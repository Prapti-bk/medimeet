import { getCurrentUser } from "@/actions/onboarding";
import { getPatientAppointments } from "@/actions/patient";
import { redirect } from "next/navigation";
import NearbyHospitalsClient from "./_components/NearbyHospitalsClient";

export const metadata = {
  title: "Nearby Hospitals & Emergency Resources — MediMeet",
  description: "AI-powered healthcare navigation, emergency resources, and appointment reminders.",
};

export default async function NearbyHospitalsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  // Fetch upcoming appointments for the reminder widget
  const { appointments = [] } = await getPatientAppointments().catch(() => ({ appointments: [] }));

  return <NearbyHospitalsClient appointments={appointments} />;
}
