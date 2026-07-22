import { getCurrentUser } from "@/actions/onboarding";
import { getPatientDashboardData } from "@/actions/patient-dashboard";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  HeartHandshake,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Stethoscope,
  ClipboardList,
  Activity,
  BookOpen,
  MapPin,
  ArrowRight,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import BarChart from "./_components/BarChart";
import DonutChart from "./_components/DonutChart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Patient Dashboard - MediMeet",
};

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const data = await getPatientDashboardData();
  const { stats, charts, progressNotes, upcoming, recentCompleted } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<HeartHandshake />}
        title="Patient Dashboard"
        backLink="/doctors"
        backLabel="Find Doctors"
      />

      {/* Welcome */}
      <div className="mt-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your health journey on MediMeet.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/wellness" className="group">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 hover:shadow-lg hover:shadow-emerald-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200/30 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-md">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">AI Wellness Tracker</p>
                  <p className="text-xs text-slate-500">Log health metrics & get AI insights</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/medical-awareness" className="group">
          <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-5 hover:shadow-lg hover:shadow-sky-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-200/30 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Medical Awareness & Precaution Modules</p>
                  <p className="text-xs text-slate-500">Medicines, first-aid & health education</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/nearby-hospitals" className="group">
          <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 hover:shadow-lg hover:shadow-violet-100/60 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-200/30 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 shadow-md">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Nearby Hospitals</p>
                  <p className="text-xs text-slate-500">Find hospitals near your location</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-5 w-5 text-emerald-600" />}
          label="Total Visits"
          value={stats.totalAppointments}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          label="Completed"
          value={stats.completedAppointments}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          label="Upcoming"
          value={stats.scheduledAppointments}
          bg="bg-amber-50"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="Cancelled"
          value={stats.cancelledAppointments}
          bg="bg-red-50"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          label="Credits Used"
          value={stats.totalCreditsSpent}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          label="Credits Left"
          value={stats.currentCredits}
          bg="bg-purple-50"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/30 border h-11">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Doctor Progress Notes
            {progressNotes.length > 0 && (
              <Badge className="ml-1 bg-emerald-600 text-white text-xs px-1.5 py-0">
                {progressNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Appointments */}
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Appointments — Last 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={charts.monthlyAppointments}
                  valueKey="count"
                  labelKey="month"
                  color="#10b981"
                />
              </CardContent>
            </Card>

            {/* Monthly Credits Spent */}
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Credits Spent — Last 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={charts.monthlyCreditsSpent}
                  valueKey="credits"
                  labelKey="month"
                  color="#3b82f6"
                />
              </CardContent>
            </Card>

            {/* Appointment Status Donut */}
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Appointment Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={charts.statusCounts} />
              </CardContent>
            </Card>

            {/* By Specialty */}
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-amber-600" />
                  Visits by Specialty
                </CardTitle>
              </CardHeader>
              <CardContent>
                {charts.appointmentsBySpecialty.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {charts.appointmentsBySpecialty
                      .sort((a, b) => b.count - a.count)
                      .map((item, i) => {
                        const max = Math.max(
                          ...charts.appointmentsBySpecialty.map((x) => x.count)
                        );
                        const pct = Math.round((item.count / max) * 100);
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium">
                                {item.specialty}
                              </span>
                              <span className="text-muted-foreground">
                                {item.count} visit{item.count !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Progress Notes Tab ── */}
        <TabsContent value="progress">
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
                Progress Notes from Your Doctors
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Notes your doctors have written about your health progress after
                completed appointments.
              </p>
            </CardHeader>
            <CardContent>
              {progressNotes.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-slate-700 font-medium">
                    No progress notes yet
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your doctors will add progress notes after completed
                    appointments.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progressNotes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-emerald-900/15 rounded-xl p-4 bg-emerald-50/30"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Dr. {note.doctorName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {note.specialty}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-slate-600">
                            {format(new Date(note.date), "MMM d, yyyy")}
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-emerald-900/10 border-emerald-900/20 text-emerald-700 text-xs mt-1"
                          >
                            Completed
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                            Progress Update
                          </p>
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-white rounded-lg p-3 border border-emerald-900/10">
                            {note.progress}
                          </p>
                        </div>
                        {note.notes && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              Clinical Notes
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 rounded-lg p-3 border border-slate-200">
                              {note.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Upcoming Tab ── */}
        <TabsContent value="upcoming">
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-slate-700 font-medium">
                    No upcoming appointments
                  </p>
                  <Link href="/doctors">
                    <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                      Find a Doctor
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} role="PATIENT" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history">
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Completed Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompleted.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-slate-700 font-medium">
                    No completed appointments yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompleted.map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} role="PATIENT" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <Card className="border-slate-100">
      <CardContent className="p-4">
        <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>{icon}</div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function AppointmentRow({ appt }) {
  const statusColors = {
    SCHEDULED: "bg-amber-900/10 border-amber-900/20 text-amber-700",
    COMPLETED: "bg-emerald-900/10 border-emerald-900/20 text-emerald-700",
    CANCELLED: "bg-red-900/10 border-red-900/20 text-red-600",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 rounded-full p-2">
          <Stethoscope className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900 text-sm">
            Dr. {appt.doctor?.name}
          </p>
          <p className="text-xs text-muted-foreground">{appt.doctor?.specialty}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-700">
          {format(new Date(appt.startTime), "MMM d, yyyy")}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(appt.startTime), "h:mm a")}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`text-xs ml-3 ${statusColors[appt.status]}`}
      >
        {appt.status}
      </Badge>
    </div>
  );
}
