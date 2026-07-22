"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, AlertTriangle, Sparkles,
  ShieldCheck, Users, Zap, Info,
} from "lucide-react";

export default function MedicineCard({ medicine, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`
        group relative bg-white rounded-3xl border ${medicine.borderColor}
        shadow-sm hover:shadow-xl hover:shadow-sky-100/60
        transition-all duration-300 hover:-translate-y-1 overflow-hidden
      `}
    >
      {/* Gradient top strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${medicine.gradient}`} />

      {/* Emergency note banner */}
      {medicine.emergencyNote && (
        <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{medicine.emergencyNote}</p>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Icon bubble */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${medicine.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              {medicine.emoji}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{medicine.name}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{medicine.brand}</p>
            </div>
          </div>

          {/* AI tip chip */}
          <div className="shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${medicine.tagColor} border`}>
              <Sparkles className="h-2.5 w-2.5" />
              AI Tip
            </span>
          </div>
        </div>

        {/* AI tip */}
        <div className={`${medicine.bgLight} rounded-2xl px-3 py-2.5 mb-4 border ${medicine.borderColor}`}>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            💡 {medicine.aiTip}
          </p>
        </div>

        {/* Common uses — always visible */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> Common Uses
          </p>
          <ul className="space-y-1.5">
            {medicine.uses.slice(0, 3).map((use, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                {use}
              </li>
            ))}
          </ul>
        </div>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded(v => !v)}
          className={`
            w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-semibold
            border transition-all duration-200
            ${expanded
              ? `${medicine.bgLight} ${medicine.borderColor} text-slate-700`
              : "border-slate-100 bg-slate-50 text-slate-500 hover:border-sky-200 hover:text-sky-600 hover:bg-sky-50"
            }
          `}
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show Less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> View Details</>
          )}
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">

                {/* Precautions */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Precautions
                  </p>
                  <ul className="space-y-1.5">
                    {medicine.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Side effects */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-red-400" /> Possible Side Effects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {medicine.sideEffects.map((s, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Age guidance */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-sky-500" /> Age Guidance
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "👶 Children", value: medicine.ageGuidance.children, color: "bg-blue-50 border-blue-200 text-blue-800" },
                      { label: "🧑 Adults",   value: medicine.ageGuidance.adults,   color: "bg-green-50 border-green-200 text-green-800" },
                      { label: "👴 Elderly",  value: medicine.ageGuidance.elderly,  color: "bg-purple-50 border-purple-200 text-purple-800" },
                    ].map(ag => (
                      <div key={ag.label} className={`rounded-xl px-3 py-2 border ${ag.color}`}>
                        <p className="text-[11px] font-bold mb-0.5">{ag.label}</p>
                        <p className="text-xs leading-relaxed">{ag.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-sky-50 border border-sky-200">
                  <ShieldCheck className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-sky-700 font-medium leading-relaxed">
                    This information is for healthcare awareness only and is not a substitute for professional medical advice. Always consult a doctor before use.
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
