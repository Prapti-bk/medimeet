"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Phone } from "lucide-react";

const severityConfig = {
  High:   { label: "High Alert",  bg: "bg-red-100 text-red-700 border-red-300" },
  Medium: { label: "Moderate",    bg: "bg-amber-100 text-amber-700 border-amber-300" },
  Low:    { label: "Low Risk",    bg: "bg-green-100 text-green-700 border-green-300" },
};

export default function EmergencyCard({ card, index }) {
  const [open, setOpen] = useState(false);
  const sev = severityConfig[card.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`bg-white rounded-3xl border ${card.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-xl shadow-md`}>
              {card.emoji}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{card.title}</h3>
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.bg}`}>
                {sev.label}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-semibold text-red-700 leading-relaxed">{card.warning}</p>
        </div>

        {/* Signs — always visible */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Warning Signs</p>
          <div className="flex flex-wrap gap-1.5">
            {card.signs.map((s, i) => (
              <span key={i} className={`text-[11px] px-2.5 py-1 rounded-full ${card.bgLight} border ${card.borderColor} text-slate-700 font-medium`}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle first aid */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-semibold border border-slate-100 bg-slate-50 text-slate-500 hover:border-sky-200 hover:text-sky-600 hover:bg-sky-50 transition-all"
        >
          {open ? <><ChevronUp className="h-3.5 w-3.5" /> Hide First Aid</> : <><ChevronDown className="h-3.5 w-3.5" /> First Aid Steps</>}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {card.firstAid.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${card.gradient} text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}

                {/* Emergency call */}
                <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                  <Phone className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    Emergency: Call <span className="text-red-600">112</span> immediately for life-threatening situations
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
