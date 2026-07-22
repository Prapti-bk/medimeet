"use client";

import { motion } from "framer-motion";

const getScoreConfig = (score) => {
  if (score >= 80) return { label: "Excellent",  color: "#10b981", glow: "rgba(16,185,129,0.3)",  bg: "from-emerald-400 to-teal-400",    text: "text-emerald-600" };
  if (score >= 60) return { label: "Good",        color: "#0ea5e9", glow: "rgba(14,165,233,0.3)",  bg: "from-sky-400 to-cyan-400",        text: "text-sky-600" };
  if (score >= 40) return { label: "Fair",        color: "#f59e0b", glow: "rgba(245,158,11,0.3)",  bg: "from-amber-400 to-orange-400",    text: "text-amber-600" };
  return              { label: "Needs Work",  color: "#ef4444", glow: "rgba(239,68,68,0.3)",   bg: "from-red-400 to-rose-400",        text: "text-red-500" };
};

export default function WellnessScore({ score }) {
  const cfg = getScoreConfig(score);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent 70%)` }}
        />

        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          {/* Progress */}
          <motion.circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={`text-4xl font-extrabold ${cfg.text}`}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 font-semibold">/100</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-3 text-center"
      >
        <p className={`text-lg font-extrabold ${cfg.text}`}>{cfg.label}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Today's Wellness Score</p>
      </motion.div>
    </div>
  );
}
