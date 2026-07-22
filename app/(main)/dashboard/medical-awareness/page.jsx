import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import MedicalAwarenessClient from "./_components/MedicalAwarenessClient";

export const metadata = {
  title: "Medical Awareness & Precaution Modules — MediMeet",
  description: "AI-powered health education, medicine awareness, and first-aid guidance.",
};

export default async function MedicalAwarenessPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  return <MedicalAwarenessClient />;
}
