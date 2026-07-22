"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Search, Locate, Zap, Sparkles, X, ChevronRight,
  Phone, AlertTriangle, Bell, Clock, Video,
  Droplets, Stethoscope, Brain, Send, Loader2,
  MapPin, Navigation, ChevronDown, ChevronUp,
  Ambulance, Mic, MicOff,
} from "lucide-react";
import { CITIES, getHospitalsByCity, getCityById } from "@/lib/hospitals-data";
import HospitalCard from "./HospitalCard";
import CityDropdown from "./CityDropdown";
import { format, differenceInMinutes, isFuture } from "date-fns";

// ── Leaflet SSR guard ──────────────────────────────────────────────────────
const HospitalMap = dynamic(() => import("./HospitalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-3 border-sky-400 border-t-transparent animate-spin" />
        <p className="text-sky-500 text-sm font-semibold">Initialising map…</p>
      </div>
    </div>
  ),
});

// ── AI symptom → hospital recommendation ──────────────────────────────────
function getAIHospitalReply(message, hospitals) {
  const q = message.toLowerCase();
  const nearest   = hospitals[0];
  const emergency = hospitals.find(h => h.emergency);
  const aiPick    = hospitals.find(h => h.aiRecommended);

  if (/chest pain|heart|cardiac|palpitation/.test(q))
    return `🚨 **Chest pain detected — this may be a cardiac emergency.**\n\nNearest emergency: **${emergency?.name ?? nearest?.name}** (${emergency?.distance ?? nearest?.distance} km)\n\nCall 112 immediately. Do not drive yourself. Chew aspirin if available and not allergic.\n\n✨ AI Recommended: ${aiPick?.name ?? "—"}`;

  if (/breath|asthma|oxygen|suffocate/.test(q))
    return `🚨 **Breathing difficulty — seek emergency care now.**\n\nNearest emergency: **${emergency?.name ?? nearest?.name}** (${emergency?.distance ?? nearest?.distance} km)\n\nSit upright, stay calm, call 112 if worsening.\n\n✨ AI Recommended: ${aiPick?.name ?? "—"}`;

  if (/stroke|face droop|slur|numb|paralys/.test(q))
    return `🚨 **Possible stroke — time-critical emergency.**\n\nRemember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 112.\n\nNearest emergency: **${emergency?.name ?? nearest?.name}** (${emergency?.distance ?? nearest?.distance} km)`;

  if (/fever|temperature|high temp/.test(q))
    return `🌡️ **Fever guidance**\n\nFor mild fever: rest, hydrate, paracetamol.\nFor high fever (>103°F) or fever in children: visit **${nearest?.name}** (${nearest?.distance} km).\n\n✨ AI Recommended: ${aiPick?.name ?? "—"}`;

  if (/accident|injury|fracture|broken|bleed/.test(q))
    return `🩹 **Injury / Trauma**\n\nNearest emergency: **${emergency?.name ?? nearest?.name}** (${emergency?.distance ?? nearest?.distance} km)\n\nFor severe bleeding: apply firm pressure. Call 108 for ambulance.\n\n✨ AI Recommended: ${aiPick?.name ?? "—"}`;

  if (/blood|transfusion|donor/.test(q))
    return `🩸 **Blood Bank**\n\nContact **${nearest?.name}** (${nearest?.phone}) for blood availability.\n\nNational Blood Bank helpline: **104**\n\n✨ AI Recommended: ${aiPick?.name ?? "—"}`;

  if (/pharmacy|medicine|drug|tablet/.test(q))
    return `💊 **Pharmacy guidance**\n\nMost hospitals have 24-hour pharmacies. Nearest: **${nearest?.name}** (${nearest?.distance} km, ${nearest?.phone}).\n\nFor prescription medicines always consult a doctor first.`;

  return `🏥 **AI Healthcare Navigation**\n\nI can help you find:\n• Nearest emergency hospital\n• Specialist recommendations\n• First-aid guidance\n\nNearest hospital: **${nearest?.name ?? "—"}** (${nearest?.distance ?? "—"} km)\n✨ AI Pick: **${aiPick?.name ?? "—"}**\n\nTry: "chest pain", "fever", "accident", "blood bank"`;
}

// ── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [mins, setMins] = useState(null);
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = differenceInMinutes(new Date(targetDate), new Date());
      setMins(diff);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [targetDate]);
  return mins;
}

// ── Appointment Reminder Widget ────────────────────────────────────────────
function AppointmentReminder({ appointments }) {
  const [open, setOpen] = useState(false);
  const upcoming = useMemo(() =>
    (appointments || [])
      .filter(a => a.status === "SCHEDULED" && isFuture(new Date(a.startTime)))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 3),
    [appointments]
  );
  const next = upcoming[0];
  const minsUntil = useCountdown(next?.startTime);
  const unread = upcoming.length;

  const urgency = minsUntil != null && minsUntil <= 30 && minsUntil >= 0;

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.92 }}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-sm transition-all ${
          urgency
            ? "border-amber-300 bg-amber-50 text-amber-700 shadow-amber-100 animate-pulse"
            : "border-sky-200 bg-white/80 text-slate-600 hover:bg-sky-50"
        }`}
      >
        <Bell className={`h-4 w-4 ${urgency ? "text-amber-500" : "text-sky-500"}`} />
        <span className="text-xs font-semibold hidden sm:inline">Appointments</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
            {unread}
          </span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 z-50 rounded-3xl border border-sky-100 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(14,165,233,0.18)] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-bold text-slate-800">Upcoming Appointments</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 mx-auto text-sky-200 mb-2" />
                  <p className="text-slate-400 text-sm">No upcoming appointments</p>
                </div>
              ) : upcoming.map(appt => {
                const mins = differenceInMinutes(new Date(appt.startTime), new Date());
                const soon = mins <= 30 && mins >= 0;
                return (
                  <div key={appt.id} className={`rounded-2xl p-3 border transition-all ${
                    soon ? "bg-amber-50 border-amber-200" : "bg-sky-50/50 border-sky-100"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Dr. {appt.doctor?.name}</p>
                        <p className="text-xs text-slate-500">{appt.doctor?.specialty}</p>
                      </div>
                      {soon && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 shrink-0 animate-pulse">
                          Soon!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Clock className="h-3.5 w-3.5 text-sky-400" />
                      {format(new Date(appt.startTime), "MMM d, h:mm a")}
                      {mins >= 0 && (
                        <span className={`font-semibold ${soon ? "text-amber-600" : "text-sky-600"}`}>
                          · {mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`} away
                        </span>
                      )}
                    </div>
                    {soon && (
                      <a
                        href="/appointments"
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-bold shadow-sm hover:from-sky-600 hover:to-cyan-600 transition-all"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Consultation
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AI Emergency Assistant Panel ───────────────────────────────────────────
function AIEmergencyPanel({ hospitals, onClose }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "🏥 **AI Healthcare Navigation**\n\nDescribe your symptoms or emergency and I'll recommend the nearest appropriate care.\n\nExamples: \"chest pain\", \"high fever\", \"accident\", \"blood bank\"",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SR) return;
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onresult = e => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setInput(t.trim()); };
    recRef.current = rec;
  }, []);

  async function send(e) {
    e?.preventDefault?.();
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setMessages(p => [...p, { role: "assistant", content: getAIHospitalReply(msg, hospitals) }]);
    setLoading(false);
  }

  const CHIPS = ["Chest pain", "High fever", "Accident", "Blood bank", "Nearest emergency", "Pharmacy"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="fixed right-4 bottom-28 z-50 w-[min(340px,92vw)] rounded-3xl border border-violet-200 bg-white/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(139,92,246,0.22)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">AI Emergency Assistant</p>
            <p className="text-[10px] text-slate-500">Symptom-based hospital navigation</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chips */}
      <div className="px-3 pt-3 flex flex-wrap gap-1.5">
        {CHIPS.map(c => (
          <button key={c} onClick={() => setInput(c)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-medium hover:bg-violet-100 transition-colors">
            {c}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="h-56 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm"
                : "bg-white border border-violet-100 text-slate-700 shadow-sm"
            }`}>
              {m.role === "assistant" && <div className="flex items-center gap-1 mb-1"><Sparkles className="h-3 w-3 text-violet-500" /><span className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">AI</span></div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-violet-100 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
              <span className="text-xs text-slate-400">Analysing…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-3 pb-3 flex gap-2">
        <button type="button"
          onClick={() => { if (listening) { try { recRef.current?.stop(); } catch {} } else { try { recRef.current?.start(); } catch {} } }}
          className={`h-9 w-9 rounded-xl flex items-center justify-center border shrink-0 transition-all ${listening ? "bg-red-50 border-red-200 text-red-500" : "bg-violet-50 border-violet-200 text-violet-500 hover:bg-violet-100"}`}>
          {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </button>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Describe symptoms…"
          className="flex-1 px-3 py-2 rounded-xl border border-violet-200 bg-violet-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-all" />
        <button type="submit" disabled={!input.trim() || loading}
          className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm disabled:opacity-40 hover:from-violet-600 hover:to-indigo-600 transition-all shrink-0">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </motion.div>
  );
}

// ── Emergency Quick-Action Dock ────────────────────────────────────────────
function EmergencyDock({ onAI, onEmergencyFilter, emergencyActive, nearestEmergency }) {
  const ACTIONS = [
    { icon: "🚑", label: "Ambulance",  sub: "108 / 112", action: () => window.open("tel:108"), color: "from-red-500 to-rose-500",     shadow: "shadow-red-200/60" },
    { icon: "🏥", label: "Emergency",  sub: "Filter now", action: onEmergencyFilter,            color: emergencyActive ? "from-red-600 to-rose-600" : "from-orange-500 to-red-500", shadow: "shadow-orange-200/60" },
    { icon: "💊", label: "Pharmacy",   sub: "24h nearby", action: () => nearestEmergency && window.open(`https://www.google.com/maps/search/pharmacy+near+${nearestEmergency.lat},${nearestEmergency.lng}`, "_blank"), color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200/60" },
    { icon: "🩸", label: "Blood Bank", sub: "Call 104",   action: () => window.open("tel:104"), color: "from-red-400 to-pink-500",    shadow: "shadow-red-200/60" },
    { icon: "🧠", label: "AI Help",    sub: "Ask AI",     action: onAI,                         color: "from-violet-500 to-indigo-500",shadow: "shadow-violet-200/60" },
  ];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 180 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-3 rounded-3xl bg-white/90 backdrop-blur-xl border border-sky-100 shadow-[0_8px_40px_rgba(14,165,233,0.18)]"
    >
      {ACTIONS.map(a => (
        <motion.button
          key={a.label}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={a.action}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-gradient-to-br ${a.color} shadow-md ${a.shadow} text-white transition-all`}
        >
          <span className="text-xl leading-none">{a.icon}</span>
          <span className="text-[10px] font-bold leading-none">{a.label}</span>
          <span className="text-[9px] opacity-80 leading-none">{a.sub}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────
export default function NearbyHospitalsClient({ appointments = [] }) {
  const [selectedCity, setSelectedCity]       = useState("kalaburagi");
  const [userLocation, setUserLocation]       = useState(null);
  const [locationStatus, setLocationStatus]   = useState("idle");
  const [searchQuery, setSearchQuery]         = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [showAI, setShowAI]                   = useState(false);
  const [mapCenter, setMapCenter]             = useState(getCityById("kalaburagi"));
  const [showCardPanel, setShowCardPanel]     = useState(true);

  const cityHospitals = useMemo(() => getHospitalsByCity(selectedCity), [selectedCity]);

  const filteredHospitals = useMemo(() => {
    let list = cityHospitals;
    if (filterEmergency) list = list.filter(h => h.emergency);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.specialties.some(s => s.toLowerCase().includes(q)) ||
        h.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cityHospitals, filterEmergency, searchQuery]);

  const handleCityChange = useCallback((cityId) => {
    setSelectedCity(cityId);
    setSelectedHospital(null);
    setMapCenter(getCityById(cityId));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus("denied"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc); setMapCenter(loc); setLocationStatus("connected");
      },
      () => setLocationStatus("denied"),
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  const locInfo = {
    idle:      { color: "text-slate-400",   dot: "bg-slate-300",              label: "Location Off" },
    loading:   { color: "text-amber-500",   dot: "bg-amber-400 animate-pulse",label: "Detecting…" },
    connected: { color: "text-emerald-600", dot: "bg-emerald-400",            label: "GPS Connected" },
    denied:    { color: "text-red-500",     dot: "bg-red-400",                label: "Location Denied" },
  }[locationStatus];

  const nearestEmergency = cityHospitals.find(h => h.emergency);
  const aiPick           = cityHospitals.find(h => h.aiRecommended);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#eef4ff] pb-28">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-3 md:px-6 lg:px-8 pt-4 max-w-[1700px] mx-auto">

        {/* ── TOP HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-4">

          {/* Emergency banner */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.9 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-sm mb-4"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-red-700">Emergency Ready</span>
            </div>
            <span className="text-xs text-slate-600 flex-1 truncate">
              Nearest emergency: <strong>{nearestEmergency?.name ?? "—"}</strong> · {nearestEmergency?.distance ?? "—"} km
            </span>
            <a href="tel:112" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-md hover:bg-red-600 transition-colors shrink-0">
              <Phone className="h-3.5 w-3.5" /> 112
            </a>
          </motion.div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-lg shadow-sky-200/50">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold gradient-title leading-tight">
                  Nearby Hospitals & Emergency Resources
                </h1>
                <p className="text-slate-500 text-xs font-medium">AI-powered healthcare navigation · Real-time location</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* GPS status */}
              <button onClick={requestLocation}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-sky-200 bg-white/80 hover:bg-sky-50 transition-colors shadow-sm">
                <span className={`w-2 h-2 rounded-full ${locInfo.dot}`} />
                <span className={`text-xs font-semibold ${locInfo.color} hidden sm:inline`}>{locInfo.label}</span>
                <Locate className="h-3.5 w-3.5 text-sky-400" />
              </button>

              {/* Appointment reminder */}
              <AppointmentReminder appointments={appointments} />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
              <input type="text" placeholder="Search hospitals, specialties, symptoms…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm bg-white/80 border border-sky-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white shadow-sm transition-all" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <CityDropdown selectedCity={selectedCity} onChange={handleCityChange} />
            <button onClick={() => setFilterEmergency(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap shadow-sm ${
                filterEmergency ? "border-red-300 bg-red-50 text-red-600" : "border-sky-200 bg-white/80 text-slate-600 hover:border-red-300 hover:text-red-500"
              }`}>
              <Zap className="h-4 w-4" /> Emergency Only
            </button>
          </div>

          {/* AI recommendation bar */}
          {aiPick && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 shadow-sm">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 shadow-sm shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-violet-700">AI Recommendation · </span>
                <span className="text-xs text-slate-600 truncate">{aiPick.name} — {aiPick.specialties[0]} · {aiPick.distance} km · ⭐ {aiPick.rating}</span>
              </div>
              <button onClick={() => setSelectedHospital(aiPick)}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 shrink-0">
                View <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ── MAIN SPLIT LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* MAP — hero section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-3">
            <div className="relative rounded-3xl overflow-hidden border border-sky-200/60 bg-white shadow-[0_8px_40px_rgba(14,165,233,0.14)] h-[360px] md:h-[500px] lg:h-[600px]">

              {/* Map overlays */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-xs text-sky-700 font-semibold">{filteredHospitals.length} hospitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-sm">
                    <span className="text-xs text-slate-600 font-medium">{getCityById(selectedCity).name}</span>
                  </div>
                  {/* Toggle card panel on mobile */}
                  <button onClick={() => setShowCardPanel(v => !v)}
                    className="pointer-events-auto lg:hidden px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-100 shadow-sm text-xs text-sky-600 font-semibold flex items-center gap-1">
                    {showCardPanel ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    List
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
                {[
                  { color: "bg-red-400",    label: "Emergency",      glow: "shadow-red-300" },
                  { color: "bg-violet-500", label: "AI Recommended", glow: "shadow-violet-300" },
                  { color: "bg-sky-400",    label: "Hospital",       glow: "" },
                  { color: "bg-blue-500",   label: "You",            glow: "" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-sky-100 shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color} shadow-sm ${l.glow}`} />
                    <span className="text-[10px] text-slate-600 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>

              <HospitalMap
                center={mapCenter}
                hospitals={filteredHospitals}
                userLocation={userLocation}
                onSelect={setSelectedHospital}
                selectedId={selectedHospital?.id}
              />
            </div>

            {/* Stats bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: "Total",     value: cityHospitals.length,                        color: "text-sky-600",     bg: "bg-sky-50 border-sky-200" },
                { label: "Emergency", value: cityHospitals.filter(h => h.emergency).length, color: "text-red-500",   bg: "bg-red-50 border-red-200" },
                { label: "Open Now",  value: cityHospitals.filter(h => h.open).length,    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-3 text-center bg-white shadow-sm ${s.bg}`}>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* HOSPITAL CARDS PANEL */}
          <AnimatePresence>
            {(showCardPanel || typeof window === "undefined") && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="lg:col-span-2 flex flex-col gap-3"
              >
                {/* Scrollable list */}
                <div className="overflow-y-auto space-y-3 pr-0.5 max-h-[560px] lg:max-h-[650px]">
                  <AnimatePresence mode="popLayout">
                    {filteredHospitals.length === 0 ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-sky-100 shadow-sm">
                        <Search className="h-10 w-10 text-sky-200 mb-3" />
                        <p className="text-slate-500 font-semibold">No hospitals found</p>
                        <p className="text-slate-400 text-sm mt-1">Try a different search or city</p>
                      </motion.div>
                    ) : filteredHospitals.map((h, i) => (
                      <HospitalCard key={h.id} hospital={h} index={i}
                        isSelected={selectedHospital?.id === h.id} onSelect={setSelectedHospital} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── AI EMERGENCY PANEL ── */}
      <AnimatePresence>
        {showAI && (
          <AIEmergencyPanel
            hospitals={filteredHospitals.length > 0 ? filteredHospitals : cityHospitals}
            onClose={() => setShowAI(false)}
          />
        )}
      </AnimatePresence>

      {/* ── EMERGENCY DOCK ── */}
      <EmergencyDock
        onAI={() => setShowAI(v => !v)}
        onEmergencyFilter={() => setFilterEmergency(v => !v)}
        emergencyActive={filterEmergency}
        nearestEmergency={nearestEmergency}
      />
    </div>
  );
}
