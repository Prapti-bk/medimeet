-- AlterTable: add email reminder tracking fields to Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "patientEmail"   TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reminderSent"   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reminderType"   TEXT;
