import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendAppointmentReminder } from "@/lib/sendReminder";
import { addMinutes, addHours, addDays, isBefore, isAfter } from "date-fns";

/**
 * Reminder windows — how far before the appointment each reminder fires.
 * reminderType → minutes before appointment
 */
const REMINDER_WINDOWS = [
  { type: "24h", minutesBefore: 24 * 60, label: "24 hours" },
  { type: "1h",  minutesBefore: 60,      label: "1 hour" },
  { type: "15m", minutesBefore: 15,      label: "15 minutes" },
];

/**
 * Tolerance window — how many minutes either side of the target we accept.
 * The cron runs every 15 min, so ±8 min covers any drift.
 */
const TOLERANCE_MINUTES = 8;

export async function GET(request) {
  // ── Security: verify cron secret ──────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { checked: 0, sent: 0, skipped: 0, errors: 0, details: [] };

  try {
    // Fetch all SCHEDULED appointments in the next 25 hours that have a patient email
    const appointments = await db.appointment.findMany({
      where: {
        status: "SCHEDULED",
        patientEmail: { not: null },
        startTime: {
          gte: now,
          lte: addHours(now, 25),
        },
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor:  { select: { name: true, specialty: true } },
      },
    });

    results.checked = appointments.length;

    for (const appt of appointments) {
      const apptTime = new Date(appt.startTime);

      for (const window of REMINDER_WINDOWS) {
        // When should this reminder fire?
        const targetFireTime = new Date(apptTime.getTime() - window.minutesBefore * 60 * 1000);

        // Is now within the tolerance window of the target fire time?
        const windowStart = new Date(targetFireTime.getTime() - TOLERANCE_MINUTES * 60 * 1000);
        const windowEnd   = new Date(targetFireTime.getTime() + TOLERANCE_MINUTES * 60 * 1000);

        const shouldFire = isAfter(now, windowStart) && isBefore(now, windowEnd);
        if (!shouldFire) continue;

        // Has this specific reminder type already been sent?
        if (appt.reminderSent && appt.reminderType === window.type) {
          results.skipped++;
          results.details.push({ id: appt.id, type: window.type, status: "skipped_duplicate" });
          continue;
        }

        // Send the email
        const emailResult = await sendAppointmentReminder({
          to:            appt.patientEmail,
          patientName:   appt.patient?.name ?? "Patient",
          doctorName:    appt.doctor?.name  ?? "Doctor",
          specialty:     appt.doctor?.specialty ?? "Specialist",
          startTime:     appt.startTime,
          appointmentId: appt.id,
          reminderType:  window.type,
        });

        if (emailResult.success) {
          // Mark reminder as sent
          await db.appointment.update({
            where: { id: appt.id },
            data: {
              reminderSent:   true,
              reminderSentAt: now,
              reminderType:   window.type,
            },
          });
          results.sent++;
          results.details.push({ id: appt.id, type: window.type, status: "sent", emailId: emailResult.id });
        } else {
          results.errors++;
          results.details.push({ id: appt.id, type: window.type, status: "error", error: emailResult.error });
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (err) {
    console.error("[Reminders] Fatal error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Also support POST (Vercel cron sends POST)
export const POST = GET;
