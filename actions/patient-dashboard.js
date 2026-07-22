"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

/**
 * Get full patient dashboard analytics data
 */
export async function getPatientDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId, role: "PATIENT" },
  });
  if (!user) throw new Error("Patient not found");

  // Fetch all appointments with doctor info
  const appointments = await db.appointment.findMany({
    where: { patientId: user.id },
    include: {
      doctor: {
        select: { id: true, name: true, specialty: true, imageUrl: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Fetch credit transactions
  const transactions = await db.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  // --- Analytics ---

  // 1. Appointment counts by status
  const statusCounts = {
    SCHEDULED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const a of appointments) {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  }

  // 2. Appointments per month (last 6 months)
  const now = new Date();
  const monthlyAppointments = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const count = appointments.filter((a) => {
      const d = new Date(a.startTime);
      return d >= monthStart && d <= monthEnd;
    }).length;
    monthlyAppointments.push({
      month: format(monthStart, "MMM yyyy"),
      count,
    });
  }

  // 3. Credits spent per month (last 6 months)
  const monthlyCreditsSpent = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const spent = transactions
      .filter((t) => {
        const d = new Date(t.createdAt);
        return (
          t.type === "APPOINTMENT_DEDUCTION" &&
          t.amount < 0 &&
          d >= monthStart &&
          d <= monthEnd
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    monthlyCreditsSpent.push({
      month: format(monthStart, "MMM yyyy"),
      credits: spent,
    });
  }

  // 4. Appointments by specialty
  const specialtyMap = {};
  for (const a of appointments) {
    const spec = a.doctor?.specialty || "Unknown";
    specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
  }
  const appointmentsBySpecialty = Object.entries(specialtyMap).map(
    ([specialty, count]) => ({ specialty, count })
  );

  // 5. Doctor progress notes (only completed appointments with patientProgress)
  const progressNotes = appointments
    .filter((a) => a.patientProgress && a.status === "COMPLETED")
    .map((a) => ({
      id: a.id,
      doctorName: a.doctor?.name,
      specialty: a.doctor?.specialty,
      date: a.startTime,
      progress: a.patientProgress,
      notes: a.notes,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 6. Upcoming appointments
  const upcoming = appointments
    .filter((a) => a.status === "SCHEDULED" && new Date(a.startTime) > now)
    .slice(0, 5);

  // 7. Recent completed
  const recentCompleted = appointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  // 8. Total credits spent
  const totalCreditsSpent = transactions
    .filter((t) => t.type === "APPOINTMENT_DEDUCTION" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    user: {
      id: user.id,
      name: user.name,
      credits: user.credits,
      email: user.email,
    },
    stats: {
      totalAppointments: appointments.length,
      completedAppointments: statusCounts.COMPLETED,
      cancelledAppointments: statusCounts.CANCELLED,
      scheduledAppointments: statusCounts.SCHEDULED,
      totalCreditsSpent,
      currentCredits: user.credits,
    },
    charts: {
      monthlyAppointments,
      monthlyCreditsSpent,
      appointmentsBySpecialty,
      statusCounts: [
        { status: "Completed", count: statusCounts.COMPLETED, color: "#10b981" },
        { status: "Scheduled", count: statusCounts.SCHEDULED, color: "#f59e0b" },
        { status: "Cancelled", count: statusCounts.CANCELLED, color: "#ef4444" },
      ],
    },
    progressNotes,
    upcoming,
    recentCompleted,
  };
}

/**
 * Doctor updates patient progress note for a completed appointment
 */
export async function updatePatientProgress(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({
    where: { clerkUserId: userId, role: "DOCTOR" },
  });
  if (!doctor) throw new Error("Doctor not found");

  const appointmentId = formData.get("appointmentId");
  const patientProgress = formData.get("patientProgress");

  if (!appointmentId) throw new Error("Appointment ID is required");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId, doctorId: doctor.id },
  });
  if (!appointment) throw new Error("Appointment not found");

  await db.appointment.update({
    where: { id: appointmentId },
    data: { patientProgress: patientProgress || null },
  });

  revalidatePath("/doctor");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Get all patients for a doctor with their appointment history and progress
 */
export async function getDoctorPatients() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({
    where: { clerkUserId: userId, role: "DOCTOR" },
  });
  if (!doctor) throw new Error("Doctor not found");

  // Get all appointments grouped by patient
  const appointments = await db.appointment.findMany({
    where: { doctorId: doctor.id },
    include: {
      patient: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
    orderBy: { startTime: "desc" },
  });

  // Group by patient
  const patientMap = {};
  for (const appt of appointments) {
    const pid = appt.patientId;
    if (!patientMap[pid]) {
      patientMap[pid] = {
        patient: appt.patient,
        appointments: [],
        totalAppointments: 0,
        completedAppointments: 0,
        lastVisit: null,
      };
    }
    patientMap[pid].appointments.push(appt);
    patientMap[pid].totalAppointments++;
    if (appt.status === "COMPLETED") {
      patientMap[pid].completedAppointments++;
      const apptDate = new Date(appt.startTime);
      if (
        !patientMap[pid].lastVisit ||
        apptDate > new Date(patientMap[pid].lastVisit)
      ) {
        patientMap[pid].lastVisit = appt.startTime;
      }
    }
  }

  return { patients: Object.values(patientMap) };
}
