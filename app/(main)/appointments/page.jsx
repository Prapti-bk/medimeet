import { getPatientAppointments } from "@/actions/patient";
import { AppointmentCard } from "@/components/appointment-card";
import { PageHeader } from "@/components/page-header";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import ReminderBell from "@/components/reminder-bell";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "My Appointments — MediMeet",
};

export default async function PatientAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const { appointments = [], error } = await getPatientAppointments();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Calendar />}
        title="My Appointments"
        backLink="/doctors"
        backLabel="Find Doctors"
      />

      {/* Reminder system info banner */}
      <div className="mt-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-md shrink-0">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">📧 Automatic Email Reminders Active</p>
            <p className="text-xs text-slate-500 mt-0.5">
              You'll receive reminder emails at <strong>24 hours</strong>, <strong>1 hour</strong>, and <strong>15 minutes</strong> before each appointment — sent to your registered email.
            </p>
          </div>
        </div>
        <ReminderBell appointments={appointments} />
      </div>

      <Card className="border-sky-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-500" />
              Your Appointments
            </span>
            <span className="text-sm font-normal text-slate-400">
              {appointments.filter(a => a.status === "SCHEDULED").length} upcoming
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Error: {error}</p>
            </div>
          ) : appointments?.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-sky-200 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No appointments yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Browse our verified doctors and book your first consultation.
              </p>
              <Link href="/doctors">
                <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 border-0 rounded-xl">
                  Find a Doctor
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
