"use client";

/**
 * Simple SVG donut chart — no external dependencies
 */
export default function DonutChart({ data }) {
  if (!data || data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 30;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const slice = { ...d, dash, offset, pct };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0">
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        ))}
        {/* center total */}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#111827">
          {total}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="5" fill="#6b7280">
          total
        </text>
      </svg>

      <div className="space-y-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-slate-700 font-medium">{s.status}</span>
            <span className="text-muted-foreground ml-auto pl-4">
              {s.count} ({Math.round(s.pct * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
