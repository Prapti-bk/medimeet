"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";

const typeConfig = {
  positive: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconColor: "text-emerald-500" },
  warning:  { icon: AlertTriangle, bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   iconColor: "text-amber-500" },
  alert:    { icon: Zap,           bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     iconColor: "text-red-500" },
  info:     { icon: Info,          bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     iconColor: "text-sky-500" },
};

export default function InsightCard({ insight, index }) {
  const cfg = typeConfig[insight.type] ?? typeConfig.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span className="text-xl">{insight.icon}</span>
        <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
      </div>
      <div>
        <p className={`text-sm font-bold ${cfg.text}`}>{insight.title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{insight.message}</p>
      </div>
    </motion.div>
  );
}
