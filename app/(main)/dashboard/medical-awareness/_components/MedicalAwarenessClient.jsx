"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Sparkles, ShieldCheck, BookOpen,
  AlertTriangle, Send, Loader2, Mic, MicOff, Phone,
} from "lucide-react";
import { CATEGORIES, MEDICINES, EMERGENCY_CARDS, getMedicinesByCategory, searchMedicines } from "@/lib/medicines-data";
import MedicineCard from "./MedicineCard";
import EmergencyCard from "./EmergencyCard";

/* ── AI awareness responses (no prescriptions, no dosages) ─────────────── */
function getAIAwarenessReply(message) {
  const q = message.toLowerCase();

  // Match medicine names
  const med = MEDICINES.find(
    m => q.includes(m.name.toLowerCase()) || m.brand.toLowerCase().split(" / ").some(b => q.includes(b.toLowerCase()))
  );

  if (med) {
    const usesList = med.uses.slice(0, 3).map(u => `• ${u}`).join("\n");
    const precList = med.precautions.slice(0, 3).map(p => `• ${p}`).join("\n");
    return `📋 **${med.name}** (${med.brand})\n\n**Common Uses:**\n${usesList}\n\n**Key Precautions:**\n${precList}\n\n💡 ${med.aiTip}\n\n⚠️ This is awareness information only. Always consult a doctor before use.`;
  }

  // Symptom keywords
  if (q.includes("fever") || q.includes("temperature"))
    return "🌡️ **Fever Awareness**\n\nFor mild fever, rest and hydration are key. Paracetamol is commonly used for fever relief.\n\n• Stay hydrated with water and ORS\n• Use a cool damp cloth on the forehead\n• Seek medical care if fever exceeds 103°F or lasts more than 3 days\n\n⚠️ Always consult a doctor for persistent or high fever.";

  if (q.includes("headache") || q.includes("pain"))
    return "💊 **Pain & Headache Awareness**\n\nCommon OTC options for mild pain include Paracetamol and Ibuprofen.\n\n• Rest in a quiet, dark room for headaches\n• Stay hydrated\n• Avoid screens if you have a migraine\n\n⚠️ Seek medical advice for severe, sudden, or recurring headaches.";

  if (q.includes("allerg") || q.includes("itching") || q.includes("rash"))
    return "🤧 **Allergy Awareness**\n\nCetirizine is a common antihistamine for allergic reactions.\n\n• Identify and avoid known allergens\n• Calamine lotion can soothe skin itching\n• Antihistamines may cause drowsiness\n\n⚠️ For severe allergic reactions (throat swelling, breathing difficulty) — call 112 immediately.";

  if (q.includes("stomach") || q.includes("acidity") || q.includes("acid") || q.includes("digest"))
    return "🫁 **Digestion & Acidity Awareness**\n\nPantoprazole and Omeprazole are PPIs that reduce stomach acid.\n\n• Eat smaller, more frequent meals\n• Avoid spicy, fatty foods and caffeine\n• Don't lie down immediately after eating\n\n⚠️ Persistent acidity or stomach pain should be evaluated by a doctor.";

  if (q.includes("dehydrat") || q.includes("ors") || q.includes("diarrhoea") || q.includes("diarrhea"))
    return "💧 **Dehydration & ORS Awareness**\n\nORS (Oral Rehydration Salts) is the gold standard for rehydration.\n\n• Mix ORS with clean water as per package instructions\n• Sip slowly — don't gulp\n• Continue normal feeding for children\n\n⚠️ Severe dehydration (no urination, confusion, sunken eyes) requires emergency medical care.";

  if (q.includes("burn") || q.includes("cut") || q.includes("wound") || q.includes("injury"))
    return "🩹 **First Aid Awareness**\n\nFor minor burns: cool under running water for 10–20 minutes. For cuts: clean with water, apply Betadine, cover with bandage.\n\n• Never use ice, butter, or toothpaste on burns\n• Don't burst blisters\n• Seek medical care for deep wounds or large burns\n\n⚠️ For serious injuries, call 112 immediately.";

  if (q.includes("vitamin") || q.includes("supplement") || q.includes("zinc") || q.includes("immune"))
    return "✨ **Vitamins & Supplements Awareness**\n\nVitamin C and Zinc support immune function.\n\n• Dietary sources are always preferred over supplements\n• Vitamin C: citrus fruits, amla, guava\n• Zinc: nuts, seeds, legumes, meat\n\n⚠️ High-dose supplements can have side effects. Consult a doctor before starting any supplement regimen.";

  // Default
  return `🏥 **Medical Awareness & Precaution Modules**\n\nI can provide awareness information about:\n• Medicines (Paracetamol, Ibuprofen, Cetirizine, etc.)\n• Symptoms (fever, headache, allergy, acidity)\n• First aid (burns, cuts, dehydration)\n• Vitamins & supplements\n\nTry asking: "What is Paracetamol used for?" or "What helps with fever?"\n\n⚠️ This is for awareness only — not medical advice. Always consult a doctor.`;
}

export default function MedicalAwarenessClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("medicines"); // medicines | emergency | ai
  const [aiMessages, setAiMessages] = useState([{
    role: "assistant",
    content: "👋 Hi! I'm your Medical Awareness Assistant.\n\nAsk me about any medicine, symptom, or first-aid topic and I'll share educational awareness information.\n\n⚠️ I provide awareness only — not prescriptions or medical diagnoses.",
  }]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Filtered medicines
  const displayedMedicines = useMemo(() => {
    if (searchQuery.trim()) return searchMedicines(searchQuery);
    return getMedicinesByCategory(activeCategory);
  }, [activeCategory, searchQuery]);

  // Auto-scroll AI chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, aiLoading]);

  // Speech recognition
  useEffect(() => {
    const SR = typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : undefined;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true;
    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = () => setIsListening(false);
    rec.onresult = e => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setAiInput(t.trim());
    };
    recognitionRef.current = rec;
  }, []);

  async function handleAISend(e) {
    e?.preventDefault?.();
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 600)); // slight delay for realism
    const reply = getAIAwarenessReply(userMsg);
    setAiMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setAiLoading(false);
  }

  const TABS = [
    { id: "medicines",  label: "Medicine Library", emoji: "💊" },
    { id: "emergency",  label: "Emergency Guide",  emoji: "🚨" },
    { id: "ai",         label: "AI Assistant",     emoji: "🤖" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#eef4ff]">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-lg shadow-sky-200/50">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold gradient-title">
                    Medical Awareness & Precaution Modules
                  </h1>
                  <p className="text-slate-500 text-sm font-medium">
                    AI-powered health education & medicine awareness
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm max-w-sm">
              <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 leading-tight">
                For healthcare awareness only — not a substitute for professional medical advice
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Medicines",       value: MEDICINES.length,       color: "text-sky-600",    bg: "bg-sky-50 border-sky-200" },
              { label: "Categories",      value: CATEGORIES.length - 1,  color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
              { label: "Emergency Guides",value: EMERGENCY_CARDS.length, color: "text-red-500",    bg: "bg-red-50 border-red-200" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-3 text-center bg-white shadow-sm ${s.bg}`}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200/60"
                    : "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── MEDICINE LIBRARY TAB ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "medicines" && (
            <motion.div
              key="medicines"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                <input
                  type="text"
                  placeholder="Search medicines, symptoms, or health topics…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-sky-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 shadow-sm text-sm transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category filters */}
              {!searchQuery && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                        activeCategory === cat.id
                          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-transparent shadow-md shadow-sky-200/50"
                          : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 font-medium">
                  {searchQuery
                    ? `${displayedMedicines.length} result${displayedMedicines.length !== 1 ? "s" : ""} for "${searchQuery}"`
                    : `${displayedMedicines.length} medicines in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`
                  }
                </p>
                <div className="flex items-center gap-1.5 text-xs text-sky-600 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Enhanced
                </div>
              </div>

              {/* Medicine grid */}
              {displayedMedicines.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 mx-auto text-sky-200 mb-4" />
                  <p className="text-slate-500 font-semibold text-lg">No medicines found</p>
                  <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedMedicines.map((med, i) => (
                    <MedicineCard key={med.id} medicine={med} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── EMERGENCY TAB ─────────────────────────────────────────────── */}
          {activeTab === "emergency" && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {/* Emergency header */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 mb-6 shadow-sm">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-400 to-orange-400 shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-800">Emergency Awareness Guide</p>
                  <p className="text-xs text-red-600 font-medium">
                    First-aid awareness for common emergencies. For life-threatening situations, call{" "}
                    <span className="font-extrabold">112</span> immediately.
                  </p>
                </div>
                <a
                  href="tel:112"
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold shadow-md hover:bg-red-600 transition-colors shrink-0"
                >
                  <Phone className="h-4 w-4" /> 112
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {EMERGENCY_CARDS.map((card, i) => (
                  <EmergencyCard key={card.id} card={card} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── AI ASSISTANT TAB ──────────────────────────────────────────── */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              {/* AI header */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 mb-5 shadow-sm">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sky-800">AI Medical Awareness Assistant</p>
                  <p className="text-xs text-sky-600 font-medium">
                    Ask about medicines, symptoms, or first-aid. Awareness only — not prescriptions.
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "What is Paracetamol used for?",
                  "Precautions for Ibuprofen",
                  "What helps with fever?",
                  "ORS for dehydration",
                  "Cetirizine for allergies",
                  "First aid for burns",
                ].map(chip => (
                  <button
                    key={chip}
                    onClick={() => { setAiInput(chip); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-sky-200 text-sky-700 font-medium hover:bg-sky-50 hover:border-sky-400 transition-all shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat window */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg overflow-hidden">
                <div className="h-[420px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-sky-50/30 to-white/50">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200/50"
                          : "bg-white border border-sky-100 text-slate-700 shadow-sm"
                      }`}>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="h-3 w-3 text-sky-500" />
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">AI Awareness</span>
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-sky-100 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                        <span className="text-sm text-slate-400">Searching awareness database…</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-sky-100 bg-white/80">
                  <form onSubmit={handleAISend} className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening) { try { recognitionRef.current?.stop(); } catch {} }
                        else { try { recognitionRef.current?.start(); } catch {} }
                      }}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                        isListening ? "bg-red-50 border-red-200 text-red-500" : "bg-sky-50 border-sky-200 text-sky-500 hover:bg-sky-100"
                      }`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    <input
                      type="text"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      placeholder="Ask about a medicine or symptom…"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || aiLoading}
                      className="h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200/60 disabled:opacity-40 hover:from-sky-600 hover:to-cyan-600 transition-all shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    🛡️ Awareness only — not medical advice. Consult a doctor for diagnosis or treatment.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GLOBAL DISCLAIMER ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex items-start gap-3 px-5 py-4 rounded-2xl bg-white border border-sky-100 shadow-sm"
        >
          <ShieldCheck className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">Medical Disclaimer</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The information provided in the Medical Awareness & Precaution Modules is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
