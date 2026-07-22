"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

// ── helpers ────────────────────────────────────────────────────────────────
async function getPatient() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

// ── Save today's wellness log ──────────────────────────────────────────────
export async function saveWellnessLog(data) {
  const user = await getPatient();

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd   = endOfDay(today);

  // Upsert: one log per day
  const existing = await db.wellnessLog.findFirst({
    where: { userId: user.id, date: { gte: dayStart, lte: dayEnd } },
  });

  const payload = {
    waterIntake:     data.waterIntake     != null ? parseFloat(data.waterIntake)     : null,
    sleepHours:      data.sleepHours      != null ? parseFloat(data.sleepHours)      : null,
    steps:           data.steps           != null ? parseInt(data.steps)             : null,
    exerciseMinutes: data.exerciseMinutes != null ? parseInt(data.exerciseMinutes)   : null,
    calories:        data.calories        != null ? parseInt(data.calories)          : null,
    weight:          data.weight          != null ? parseFloat(data.weight)          : null,
    systolic:        data.systolic        != null ? parseInt(data.systolic)          : null,
    diastolic:       data.diastolic       != null ? parseInt(data.diastolic)         : null,
    sugarLevel:      data.sugarLevel      != null ? parseFloat(data.sugarLevel)      : null,
    mood:            data.mood            || null,
    energyLevel:     data.energyLevel     != null ? parseInt(data.energyLevel)       : null,
    stressLevel:     data.stressLevel     != null ? parseInt(data.stressLevel)       : null,
    symptoms:        Array.isArray(data.symptoms)   ? data.symptoms   : [],
    medications:     Array.isArray(data.medications) ? data.medications : [],
    notes:           data.notes           || null,
    updatedAt:       new Date(),
  };

  if (existing) {
    await db.wellnessLog.update({ where: { id: existing.id }, data: payload });
  } else {
    await db.wellnessLog.create({ data: { userId: user.id, date: today, ...payload } });
  }

  revalidatePath("/dashboard/wellness");
  return { success: true };
}

// ── Get last N days of logs ────────────────────────────────────────────────
export async function getWellnessHistory(days = 14) {
  const user = await getPatient();

  const logs = await db.wellnessLog.findMany({
    where: {
      userId: user.id,
      date: { gte: subDays(new Date(), days) },
    },
    orderBy: { date: "asc" },
  });

  return { logs };
}

// ── Get today's log (for pre-filling the form) ────────────────────────────
export async function getTodayLog() {
  const user = await getPatient();
  const today = new Date();

  const log = await db.wellnessLog.findFirst({
    where: {
      userId: user.id,
      date: { gte: startOfDay(today), lte: endOfDay(today) },
    },
  });

  return { log };
}

// ── AI Insights engine (pure logic, no external API) ──────────────────────
export async function getWellnessInsights() {
  const user = await getPatient();

  const logs = await db.wellnessLog.findMany({
    where: { userId: user.id, date: { gte: subDays(new Date(), 7) } },
    orderBy: { date: "desc" },
  });

  if (logs.length === 0) return { insights: [], score: null };

  const insights = [];

  // Hydration
  const waterLogs = logs.filter(l => l.waterIntake != null);
  if (waterLogs.length > 0) {
    const avg = waterLogs.reduce((s, l) => s + l.waterIntake, 0) / waterLogs.length;
    if (avg < 1.5) insights.push({ type: "warning", icon: "💧", title: "Low Hydration", message: `Average water intake is ${avg.toFixed(1)}L/day. Aim for at least 2L daily.`, color: "blue" });
    else if (avg >= 2.5) insights.push({ type: "positive", icon: "💧", title: "Great Hydration!", message: `Averaging ${avg.toFixed(1)}L/day — excellent hydration habits.`, color: "cyan" });
  }

  // Sleep
  const sleepLogs = logs.filter(l => l.sleepHours != null);
  if (sleepLogs.length > 0) {
    const avg = sleepLogs.reduce((s, l) => s + l.sleepHours, 0) / sleepLogs.length;
    if (avg < 6) insights.push({ type: "alert", icon: "😴", title: "Sleep Deficit Detected", message: `Averaging only ${avg.toFixed(1)} hours/night. Adults need 7–9 hours for optimal health.`, color: "violet" });
    else if (avg > 9) insights.push({ type: "warning", icon: "😴", title: "Oversleeping Pattern", message: `Averaging ${avg.toFixed(1)} hours/night. Consistent oversleeping may indicate fatigue or other issues.`, color: "purple" });
    else insights.push({ type: "positive", icon: "😴", title: "Healthy Sleep Pattern", message: `Averaging ${avg.toFixed(1)} hours/night — within the recommended range.`, color: "green" });
  }

  // Stress
  const stressLogs = logs.filter(l => l.stressLevel != null);
  if (stressLogs.length > 0) {
    const avg = stressLogs.reduce((s, l) => s + l.stressLevel, 0) / stressLogs.length;
    if (avg >= 7) insights.push({ type: "alert", icon: "🧠", title: "Elevated Stress Levels", message: `Stress averaging ${avg.toFixed(1)}/10 this week. Consider relaxation techniques, exercise, or speaking with a professional.`, color: "red" });
    else if (avg <= 3) insights.push({ type: "positive", icon: "🧠", title: "Low Stress — Well Done!", message: `Stress levels are well-managed at ${avg.toFixed(1)}/10 this week.`, color: "green" });
  }

  // Exercise
  const exLogs = logs.filter(l => l.exerciseMinutes != null);
  if (exLogs.length > 0) {
    const total = exLogs.reduce((s, l) => s + l.exerciseMinutes, 0);
    const daysActive = exLogs.filter(l => l.exerciseMinutes > 0).length;
    if (daysActive < 3) insights.push({ type: "warning", icon: "🏃", title: "Low Activity This Week", message: `Only ${daysActive} active day(s) logged. WHO recommends 150 min of moderate activity per week.`, color: "orange" });
    else insights.push({ type: "positive", icon: "🏃", title: "Active Lifestyle!", message: `${daysActive} active days with ${total} total minutes this week — keep it up!`, color: "green" });
  }

  // BP trend
  const bpLogs = logs.filter(l => l.systolic != null && l.diastolic != null);
  if (bpLogs.length >= 2) {
    const latestSys = bpLogs[0].systolic;
    if (latestSys > 140) insights.push({ type: "alert", icon: "❤️", title: "High Blood Pressure Reading", message: `Latest systolic reading is ${latestSys} mmHg. Please consult your doctor if this persists.`, color: "red" });
    else if (latestSys < 90) insights.push({ type: "warning", icon: "❤️", title: "Low Blood Pressure Reading", message: `Latest systolic reading is ${latestSys} mmHg. Monitor for dizziness or fatigue.`, color: "amber" });
  }

  // Weight change
  const weightLogs = logs.filter(l => l.weight != null);
  if (weightLogs.length >= 3) {
    const first = weightLogs[weightLogs.length - 1].weight;
    const last  = weightLogs[0].weight;
    const diff  = last - first;
    if (Math.abs(diff) > 2) {
      insights.push({
        type: diff > 0 ? "warning" : "positive",
        icon: "⚖️",
        title: diff > 0 ? "Weight Increase Detected" : "Weight Loss Progress",
        message: `${Math.abs(diff).toFixed(1)} kg ${diff > 0 ? "gained" : "lost"} over the tracked period.`,
        color: diff > 0 ? "amber" : "green",
      });
    }
  }

  // Mood trend
  const moodMap = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
  const moodLogs = logs.filter(l => l.mood && moodMap[l.mood]);
  if (moodLogs.length >= 3) {
    const avg = moodLogs.reduce((s, l) => s + (moodMap[l.mood] || 3), 0) / moodLogs.length;
    if (avg < 2.5) insights.push({ type: "alert", icon: "😔", title: "Low Mood Pattern", message: "Mood has been consistently low this week. Consider speaking with a healthcare professional.", color: "violet" });
  }

  // Wellness score (0–100)
  const latest = logs[0];
  let score = 50;
  let factors = 0;
  if (latest.waterIntake != null) { score += latest.waterIntake >= 2 ? 8 : -5; factors++; }
  if (latest.sleepHours  != null) { score += (latest.sleepHours >= 7 && latest.sleepHours <= 9) ? 10 : -8; factors++; }
  if (latest.exerciseMinutes != null) { score += latest.exerciseMinutes >= 30 ? 10 : latest.exerciseMinutes > 0 ? 5 : -3; factors++; }
  if (latest.stressLevel != null) { score += latest.stressLevel <= 4 ? 8 : latest.stressLevel <= 6 ? 0 : -10; factors++; }
  if (latest.mood != null) { const mv = moodMap[latest.mood] || 3; score += (mv - 3) * 4; factors++; }
  if (latest.steps != null) { score += latest.steps >= 8000 ? 8 : latest.steps >= 5000 ? 4 : -2; factors++; }
  score = Math.max(10, Math.min(100, Math.round(score)));

  return { insights, score, logsCount: logs.length };
}
