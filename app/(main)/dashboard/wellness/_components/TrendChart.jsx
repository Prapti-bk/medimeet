"use client";

import { motion } from "framer-motion";

/**
 * Lightweight SVG sparkline + bar chart — no external deps.
 * type: "line" | "bar"
 */
export default function TrendChart({ data, valueKey, labelKey, color = "#0ea5e9", type = "bar", unit = "" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-slate-300 text-xs">
        No data yet
      </div>
    );
  }

  const values = data.map(d => d[valueKey] ?? 0);
  const max = Math.max(...values, 1);
  const W = 100;
  const H = 60;
  const pad = 4;

  if (type === "line") {
    const pts = values.map((v, i) => {
      const x = pad + (i / Math.max(values.length - 1, 1)) * (W - pad * 2);
      const y = H - pad - ((v / max) * (H - pad * 2));
      return `${x},${y}`;
    });
    const pathD = `M ${pts.join(" L ")}`;
    const areaD = `M ${pts[0]} L ${pts.join(" L ")} L ${pad + (W - pad * 2)},${H - pad} L ${pad},${H - pad} Z`;

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
          <defs>
            <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${color.replace("#","")})`} />
          <motion.path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {values.map((v, i) => {
            const [x, y] = pts[i].split(",").map(Number);
            return (
              <circle key={i} cx={x} cy={y} r="2.5" fill={color}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            );
          })}
        </svg>
        <div className="flex justify-between mt-1">
          {data.map((d, i) => (
            <span key={i} className="text-[9px] text-slate-400 font-medium">
              {String(d[labelKey]).slice(0, 3)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart
  const barW = (W - pad * 2) / values.length;
  const gap = barW * 0.2;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        {values.map((v, i) => {
          const barH = Math.max(2, (v / max) * (H - pad * 2));
          const x = pad + i * barW + gap / 2;
          const y = H - pad - barH;
          return (
            <motion.rect
              key={i}
              x={x} y={y}
              width={barW - gap}
              height={barH}
              rx="2"
              fill={color}
              opacity="0.85"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              style={{ transformOrigin: `${x}px ${H - pad}px` }}
            />
          );
        })}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e2e8f0" strokeWidth="0.5" />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-slate-400 font-medium">
            {String(d[labelKey]).slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
}
