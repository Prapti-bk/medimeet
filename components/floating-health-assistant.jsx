"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mic, MicOff, Send, Sparkles, X, ShieldAlert, Loader2 } from "lucide-react";

const SERIOUS_SYMPTOMS = [
  "chest pain","chest tightness","breathing difficulty","shortness of breath",
  "trouble breathing","stroke","face drooping","slurred speech","severe bleeding",
  "unconscious","passed out","fainting","suicidal","i want to die","kill myself","self-harm",
];

function normalizeText(s) {
  return String(s||"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
}

function estimateSafetyLevel(message) {
  const text = normalizeText(message);
  const match = SERIOUS_SYMPTOMS.find((p) => text.includes(normalizeText(p)));
  if (match) return { level:"High", urgency:"Emergency", recommendDoctor:true, emergencyNow:true };
  const medium = ["fever","vomiting","headache","dizzy","migraine","anx","panic","anxiety","stress","overwhelm"].some(s=>text.includes(s));
  const low    = ["mild","better","rest","stressed","worried"].some(s=>text.includes(s));
  if (medium) return { level:"Medium", urgency:"Soon",    recommendDoctor:true,  emergencyNow:false };
  if (low)    return { level:"Low",    urgency:"Routine", recommendDoctor:false, emergencyNow:false };
  return       { level:"Low",    urgency:"Routine", recommendDoctor:false, emergencyNow:false };
}

function formatBotReply({ message, patientName, botReply }) {
  const safety = estimateSafetyLevel(message);
  const header = safety.emergencyNow
    ? `🚨 Severity: High (Emergency)\nUrgency: Get help now\nRecommendation: Seek immediate medical assistance.`
    : `Severity: ${safety.level}\nUrgency: ${safety.urgency}\nRecommendation: ${safety.recommendDoctor?"Consider a doctor/consult":"Usually safe to start with self-care"}`;
  const precautions = safety.emergencyNow
    ? "\n\nImmediate steps: Call your local emergency number. If possible, sit upright, avoid driving yourself, and call someone to stay with you."
    : "\n\nPrecautions: Rest, hydrate if appropriate, and monitor symptoms. Avoid new medications unless prescribed.";
  const doctorLine = "\n\nDoctor consultation: "+(safety.recommendDoctor?"Recommended—especially if symptoms are new, worsening, or severe.":"Not necessary right now for many mild cases, but consult if you're concerned.");
  const disclaimer = "\n\nNote: I'm not a doctor and this is not medical advice. If symptoms worsen or you feel unsafe, contact emergency services.";
  const namePart = patientName ? ` ${patientName}` : "";
  return `Hi${namePart} — ${header}\n\n${botReply||""}${precautions}${doctorLine}${disclaimer}`;
}

export default function FloatingHealthAssistant({ patientName }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{
    role:"assistant",
    content:"Hi! I'm your AI health companion. Tell me what you're feeling and I'll help guide you.",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const greeting = useMemo(() => `Hi${patientName?`, ${patientName}`:""}!`, [patientName]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [open, messages, isLoading]);

  useEffect(() => {
    const SR = typeof window!=="undefined" ? (window.SpeechRecognition||window.webkitSpeechRecognition) : undefined;
    if (!SR) return;
    const rec = new SR();
    rec.lang="en-US"; rec.interimResults=true; rec.maxAlternatives=1;
    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = () => { setIsListening(false); toast.error("Voice input failed."); };
    rec.onresult = (e) => {
      let t="";
      for (let i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript;
      setInput(t.trim());
    };
    recognitionRef.current = rec;
  }, []);

  const canSend = useMemo(() => input.trim().length>0 && !isLoading, [input,isLoading]);

  async function handleSend(e) {
    e?.preventDefault?.();
    if (!canSend) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev=>[...prev,{role:"user",content:userMessage}]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/mental-health-chat",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:userMessage,name:patientName||undefined}),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages(prev=>[...prev,{role:"assistant",content:formatBotReply({message:userMessage,patientName,botReply:data?.reply})}]);
    } catch {
      toast.error("Failed to get assistant response");
      setMessages(prev=>[...prev,{role:"assistant",content:"Sorry—something went wrong. Please try again. If symptoms are severe, seek medical help immediately."}]);
    } finally { setIsLoading(false); }
  }

  function startListening() { try { recognitionRef.current?.start(); } catch {} }
  function stopListening()  { try { recognitionRef.current?.stop();  } catch {} }

  return (
    <>
      {/* Floating bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(v=>!v)}
          aria-label="Open health assistant"
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_8px_32px_rgba(14,165,233,0.40)] hover:shadow-[0_12px_40px_rgba(14,165,233,0.55)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center overflow-hidden"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          <span className="relative text-xl">🩺</span>
        </button>
      </div>

      {/* Slide-up panel */}
      <div
        className={"fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-all duration-500 "+(open?"translate-y-0 opacity-100":"translate-y-[110%] opacity-0")}
        aria-hidden={!open}
      >
        <div className="pointer-events-auto mx-auto w-[min(720px,95vw)] mb-5">
          {/* Glass card */}
          <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-2xl shadow-[0_32px_80px_rgba(14,165,233,0.18),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-sky-100/60 bg-gradient-to-r from-sky-50/80 to-cyan-50/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="leading-tight">
                      <div className="font-bold text-slate-800">AI Health Assistant</div>
                      <div className="text-xs text-slate-500">{greeting} Calm, safe guidance.</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-sky-500" />
                    Not a doctor. For emergencies, contact local services.
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="px-5 pt-4 pb-2">
              <div
                className="h-[320px] overflow-auto rounded-2xl bg-gradient-to-b from-sky-50/40 to-white/60 border border-sky-100/50 p-3 space-y-3"
                aria-label="Assistant chat"
              >
                {messages.map((m, idx) => (
                  <div key={idx} className={m.role==="user"?"flex justify-end":"flex justify-start"}>
                    <div className={
                      m.role==="user"
                        ? "max-w-[85%] rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white px-4 py-2.5 shadow-md shadow-sky-200/50"
                        : "max-w-[85%] rounded-2xl bg-white px-4 py-2.5 border border-sky-100 shadow-sm"
                    }>
                      <div className="text-[11px] opacity-70 mb-1 font-medium">
                        {m.role==="user"?"You":"Assistant"}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-2.5 border border-sky-100 shadow-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                      <span className="text-sm text-slate-400">Analyzing…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-5 pb-5 pt-2">
              <form className="flex flex-col gap-2" onSubmit={handleSend}>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={isListening?stopListening:startListening}
                    aria-label="Voice input"
                    className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${isListening?"bg-red-50 border-red-200 text-red-500":"bg-sky-50 border-sky-200 text-sky-500 hover:bg-sky-100"}`}
                  >
                    {isListening?<MicOff className="h-4 w-4"/>:<Mic className="h-4 w-4"/>}
                  </button>
                  <Textarea
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    placeholder="Describe your symptoms…"
                    rows={2}
                    className="flex-1 min-h-[44px] resize-none rounded-2xl border-sky-200 bg-sky-50/50 focus:border-sky-400 focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="Send"
                    className="h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200/60 disabled:opacity-40 disabled:cursor-not-allowed hover:from-sky-600 hover:to-cyan-600 transition-all shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="mt-0.5">🛡️</span>
                  For serious symptoms (chest pain, breathing difficulty, stroke signs, suicidal thoughts), seek emergency help immediately.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
