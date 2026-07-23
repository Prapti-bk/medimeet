import { format } from "date-fns";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://medimeet.app";

// Lazy Resend client — only instantiated when actually sending, not at build time
function getResend() {
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Reminder type labels
 */
const REMINDER_LABELS = {
  "24h": "Tomorrow",
  "1h":  "In 1 Hour",
  "15m": "In 15 Minutes",
};

/**
 * Build the premium HTML email template
 */
function buildEmailHTML({ patientName, doctorName, specialty, startTime, appointmentId, reminderType }) {
  const dateStr  = format(new Date(startTime), "EEEE, MMMM d, yyyy");
  const timeStr  = format(new Date(startTime), "h:mm a");
  const label    = REMINDER_LABELS[reminderType] ?? "Upcoming";
  const joinUrl  = `${APP_URL}/appointments`;
  const isUrgent = reminderType === "15m" || reminderType === "1h";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Reminder — MediMeet</title>
</head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9 0%,#06b6d4 50%,#14b8a6 100%);border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:white;letter-spacing:-0.5px;margin-bottom:4px;">
              🏥 MediMeet
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.85);font-weight:500;">
              AI-Powered Healthcare Platform
            </div>
          </td>
        </tr>

        <!-- Urgency banner (for 15m and 1h) -->
        ${isUrgent ? `
        <tr>
          <td style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 40px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">
              ⏰ ${reminderType === "15m" ? "Your appointment starts in 15 minutes — please join now!" : "Your appointment is in 1 hour — get ready!"}
            </p>
          </td>
        </tr>` : ""}

        <!-- Main card -->
        <tr>
          <td style="background:white;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(14,165,233,0.10);">

            <!-- Greeting -->
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">
              Hello, ${patientName || "there"} 👋
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              This is your <strong style="color:#0ea5e9;">${label}</strong> reminder for your upcoming video consultation on MediMeet.
            </p>

            <!-- Appointment details card -->
            <div style="background:linear-gradient(135deg,#f0f9ff,#ecfeff);border:1px solid #bae6fd;border-radius:16px;padding:24px;margin-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Doctor</div>
                    <div style="font-size:18px;font-weight:800;color:#0f172a;">Dr. ${doctorName}</div>
                    <div style="font-size:13px;color:#64748b;margin-top:2px;">${specialty || "Specialist"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #bae6fd;padding-top:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">📅 Date</div>
                          <div style="font-size:14px;font-weight:700;color:#0f172a;">${dateStr}</div>
                        </td>
                        <td width="50%">
                          <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">⏰ Time</div>
                          <div style="font-size:14px;font-weight:700;color:#0f172a;">${timeStr}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${joinUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:white;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;box-shadow:0 4px 20px rgba(14,165,233,0.35);letter-spacing:0.3px;">
                🎥 Join Video Consultation
              </a>
            </div>

            <!-- Add to calendar -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=MediMeet+Appointment+with+Dr.+${encodeURIComponent(doctorName)}&dates=${format(new Date(startTime),"yyyyMMdd'T'HHmmss")}/${format(new Date(startTime),"yyyyMMdd'T'HHmmss")}&details=Video+consultation+on+MediMeet"
                target="_blank"
                style="display:inline-block;background:white;color:#0ea5e9;text-decoration:none;font-size:13px;font-weight:600;padding:10px 24px;border-radius:50px;border:1.5px solid #bae6fd;">
                📆 Add to Google Calendar
              </a>
            </div>

            <!-- Preparation tips -->
            <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:12px;">📋 Before Your Consultation</div>
              <ul style="margin:0;padding-left:20px;color:#64748b;font-size:13px;line-height:1.8;">
                <li>Ensure a stable internet connection</li>
                <li>Find a quiet, well-lit private space</li>
                <li>Have your medical history and current medications ready</li>
                <li>Test your camera and microphone beforehand</li>
                <li>Join 5 minutes early to avoid technical delays</li>
              </ul>
            </div>

            <!-- Emergency section -->
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;">
              <div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:6px;">🚨 Emergency?</div>
              <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">
                If you have a medical emergency, do not wait for your appointment.<br/>
                Call <strong>112</strong> (Emergency) or <strong>108</strong> (Ambulance) immediately.
              </p>
            </div>

            <!-- Footer note -->
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
              This reminder was sent to you because you have an upcoming appointment on MediMeet.<br/>
              If you need to reschedule, please visit your <a href="${joinUrl}" style="color:#0ea5e9;text-decoration:none;">appointments page</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
              © 2026 MediMeet · AI-Powered Healthcare Platform
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">
              You received this email because you booked an appointment on MediMeet.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send an appointment reminder email via Resend.
 *
 * @param {object} params
 * @param {string} params.to           - Patient email address
 * @param {string} params.patientName  - Patient's name
 * @param {string} params.doctorName   - Doctor's name
 * @param {string} params.specialty    - Doctor's specialty
 * @param {Date}   params.startTime    - Appointment start time
 * @param {string} params.appointmentId
 * @param {string} params.reminderType - "24h" | "1h" | "15m"
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendAppointmentReminder({
  to,
  patientName,
  doctorName,
  specialty,
  startTime,
  appointmentId,
  reminderType,
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_your_")) {
    console.warn("[Resend] RESEND_API_KEY not configured — skipping email send.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const label = REMINDER_LABELS[reminderType] ?? "Upcoming";
  const subject = reminderType === "15m"
    ? `⏰ Your appointment starts in 15 minutes — Dr. ${doctorName}`
    : reminderType === "1h"
    ? `🔔 1 hour until your consultation with Dr. ${doctorName}`
    : `📅 Appointment reminder for tomorrow — Dr. ${doctorName}`;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "MediMeet <onboarding@resend.dev>",
      to: [to],
      subject,
      html: buildEmailHTML({ patientName, doctorName, specialty, startTime, appointmentId, reminderType }),
    });

    if (error) {
      console.error("[Resend] Email send error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend] ✅ Reminder sent to ${to} (${reminderType}) — ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Resend] Unexpected error:", err.message);
    return { success: false, error: err.message };
  }
}
