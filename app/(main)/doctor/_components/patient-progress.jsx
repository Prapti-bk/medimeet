"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  User,
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  CheckCircle,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import { updatePatientProgress } from "@/actions/patient-dashboard";
import { getDoctorPatients } from "@/actions/patient-dashboard";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

export default function PatientProgress() {
  const [patients, setPatients] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [progressText, setProgressText] = useState("");

  const {
    loading: loadingPatients,
    fn: fetchPatients,
    data: patientsData,
  } = useFetch(getDoctorPatients);

  const {
    loading: saving,
    fn: saveProgress,
    data: saveData,
  } = useFetch(updatePatientProgress);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patientsData?.patients) {
      setPatients(patientsData.patients);
    }
  }, [patientsData]);

  useEffect(() => {
    if (saveData?.success) {
      toast.success("Progress note saved — patient can now see it on their dashboard.");
      setEditingId(null);
      setProgressText("");
      fetchPatients();
    }
  }, [saveData]);

  const handleSave = async (appointmentId) => {
    const fd = new FormData();
    fd.append("appointmentId", appointmentId);
    fd.append("patientProgress", progressText);
    await saveProgress(fd);
  };

  const startEdit = (appointmentId, existing) => {
    setEditingId(appointmentId);
    setProgressText(existing || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProgressText("");
  };

  if (loadingPatients) {
    return (
      <Card className="border-emerald-900/20">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-muted-foreground">Loading patients…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            Patient Progress
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Write progress notes for your patients after completed appointments.
            Patients can see these notes on their dashboard.
          </p>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-slate-700 font-medium">No patients yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Patients will appear here once they book appointments with you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((p) => {
                const isOpen = expanded === p.patient.id;
                const completedAppts = p.appointments.filter(
                  (a) => a.status === "COMPLETED"
                );

                return (
                  <div
                    key={p.patient.id}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    {/* Patient header row */}
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                      onClick={() =>
                        setExpanded(isOpen ? null : p.patient.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 rounded-full p-2">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {p.patient.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.patient.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-slate-700">
                            {p.totalAppointments} appointment
                            {p.totalAppointments !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.completedAppointments} completed
                          </p>
                        </div>
                        {p.lastVisit && (
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50 hidden md:flex"
                          >
                            Last:{" "}
                            {format(new Date(p.lastVisit), "MMM d, yyyy")}
                          </Badge>
                        )}
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded appointment list */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
                        {completedAppts.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No completed appointments yet.
                          </p>
                        ) : (
                          completedAppts.map((appt) => (
                            <div
                              key={appt.id}
                              className="bg-white rounded-xl border border-slate-100 p-4 space-y-3"
                            >
                              {/* Appointment meta */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Calendar className="h-4 w-4 text-emerald-600" />
                                  {format(
                                    new Date(appt.startTime),
                                    "MMMM d, yyyy 'at' h:mm a"
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-900/10 border-emerald-900/20 text-emerald-700 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>

                              {/* Patient description */}
                              {appt.patientDescription && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Patient's Description
                                  </p>
                                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100 whitespace-pre-line">
                                    {appt.patientDescription}
                                  </p>
                                </div>
                              )}

                              {/* Clinical notes */}
                              {appt.notes && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Clinical Notes
                                  </p>
                                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100 whitespace-pre-line">
                                    {appt.notes}
                                  </p>
                                </div>
                              )}

                              {/* Progress note */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                    Progress Note (visible to patient)
                                  </p>
                                  {editingId !== appt.id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      onClick={() =>
                                        startEdit(
                                          appt.id,
                                          appt.patientProgress
                                        )
                                      }
                                    >
                                      <Edit className="h-3.5 w-3.5 mr-1" />
                                      {appt.patientProgress ? "Edit" : "Add"}
                                    </Button>
                                  )}
                                </div>

                                {editingId === appt.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={progressText}
                                      onChange={(e) =>
                                        setProgressText(e.target.value)
                                      }
                                      placeholder="Describe the patient's progress, treatment response, next steps, lifestyle recommendations…"
                                      rows={4}
                                      className="text-sm resize-none border-emerald-200 focus:border-emerald-400"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="border-slate-200"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSave(appt.id)}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                      >
                                        {saving ? (
                                          <>
                                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                            Saving…
                                          </>
                                        ) : (
                                          "Save Note"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ) : appt.patientProgress ? (
                                  <p className="text-sm text-slate-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100 whitespace-pre-line">
                                    {appt.patientProgress}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    No progress note added yet. Click "Add" to
                                    write one.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}

                        {/* Scheduled / cancelled appointments summary */}
                        {p.appointments.filter(
                          (a) => a.status !== "COMPLETED"
                        ).length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-muted-foreground font-medium mb-2">
                              Other appointments
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {p.appointments
                                .filter((a) => a.status !== "COMPLETED")
                                .map((a) => (
                                  <Badge
                                    key={a.id}
                                    variant="outline"
                                    className={
                                      a.status === "SCHEDULED"
                                        ? "border-amber-200 text-amber-700 bg-amber-50"
                                        : "border-red-200 text-red-600 bg-red-50"
                                    }
                                  >
                                    {format(
                                      new Date(a.startTime),
                                      "MMM d"
                                    )}{" "}
                                    — {a.status}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
