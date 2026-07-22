"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Clock, Mail, BellOff, Video, Calendar } from "lucide-react";
import { format, differenceInMinutes, isFuture } from "date-fns";

export default function ReminderBell({ appointments = [] }) {
  const [open, setOpen] = useState(false);

  const upcoming = useMemo(() =>
    appointments
      .filter(a => a.status === "SCHEDULED" && isFuture(new Date(a.startTime)))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [appointments]
  );

  const withReminders = upcoming.filter(a => a.patientEmail);
  const unread = upcoming.length;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.92 }}
        className={`relative flex items-center gap-2 px-3 py-2.5 rounded-2xl border shadow-sm transition-all font-medium text-sm ${
          open
            ? "border-sky-400 bg-sky-50 text-sky-700"
            : "border-sky-200 bg-white text-slate-600 hover:bg-sky-50 hover:border-sky-300"
        }`}
      >
        <Bell className={`h-4 w-4 ${unread > 0 ? "text-sky-500" : "text-slate-400"}`} />
        <span className="hidden sm:inline">Reminders</span>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 z-50 rounded-3xl border border-sky-100 bg-white/98 backdrop-blur-xl shadow-[0_20px_60px_rgba(14,165,233,0.18)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-sm">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Appointment Reminders</p>
                  <p className="text-[10px] text-slate-500">
                    {withReminders.length} of {upcoming.length} have email reminders active
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-0 border-b border-sky-100">
              {[
                { label: "Upcoming",       value: upcoming.length,                                    color: "text-sky-600",     bg: "bg-sky-50" },
                { label: "Email Active",   value: withReminders.length,                               color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Reminder Sent",  value: appointments.filter(a => a.reminderSent).length,    color: "text-violet-600",  bg: "bg-violet-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} px-4 py-3 text-center border-r border-sky-100 last:border-r-0`}>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Appointment list */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
              {upcoming.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-10 w-10 mx-auto text-sky-200 mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No upcoming appointments</p>
                </div>
              ) : upcoming.map(appt => {
                const mins = differenceInMinutes(new Date(appt.startTime), new Date());
                const soon = mins <= 60 && mins >= 0;
                const veryUrgent = mins <= 15 && mins >= 0;

                return (
                  <div key={appt.id} className={`rounded-2xl p-3.5 border transition-all ${
                    veryUrgent ? "bg-red-50 border-red-200" :
                    soon       ? "bg-amber-50 border-amber-200" :
                                 "bg-sky-50/50 border-sky-100"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Dr. {appt.doctor?.name}</p>
                        <p className="text-xs text-slate-500">{appt.doctor?.specialty}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {appt.reminderSent ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Mail className="h-2.5 w-2.5" /> Sent
                          </span>
                        ) : appt.patientEmail ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                            <Bell className="h-2.5 w-2.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            <BellOff className="h-2.5 w-2.5" /> No Email
                          </span>
                        )}
                        {veryUrgent && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                            🚨 Now!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-sky-400" />
                        {format(new Date(appt.startTime), "MMM d, h:mm a")}
                      </span>
                      {mins >= 0 && (
                        <span className={`font-semibold ${veryUrgent ? "text-red-600" : soon ? "text-amber-600" : "text-sky-600"}`}>
                          · {mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`} away
                        </span>
                      )}
                    </div>

                    {appt.patientEmail && (
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {appt.patientEmail}
                        {appt.reminderType && (
                          <span className="ml-1 text-violet-500 font-semibold">
                            · Last: {appt.reminderType} reminder
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-sky-100 bg-sky-50/50">
              <p className="text-[10px] text-slate-400 text-center">
                📧 Reminders sent automatically at 24h, 1h, and 15min before each appointment
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
