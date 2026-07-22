import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import WellnessClient from "./_components/WellnessClient";

export const metadata = {
  title: "AI Wellness Tracker — MediMeet",
  description: "Track daily health metrics and get AI-powered wellness insights.",
};

export default async function WellnessPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  return <WellnessClient userName={user.name} />;
}
