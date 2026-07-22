"use client";

/**
 * Simple SVG bar chart — no external dependencies
 */
export default function BarChart({ data, valueKey, labelKey, color = "#10b981", height = 160 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const barWidth = 100 / data.length;
  const gap = 0.8; // gap between bars as % of barWidth

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }}>
        {data.map((item, i) => {
          const barH = (item[valueKey] / max) * (height - 24);
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          const y = height - 20 - barH;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                fill={color}
                rx="1"
                opacity="0.85"
              />
              {/* value label on top */}
              {item[valueKey] > 0 && (
                <text
                  x={x + w / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="4"
                  fill="#374151"
                >
                  {item[valueKey]}
                </text>
              )}
              {/* x-axis label */}
              <text
                x={x + w / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="3.5"
                fill="#6b7280"
              >
                {String(item[labelKey]).replace(" 20", " '")}
              </text>
            </g>
          );
        })}
        {/* baseline */}
        <line
          x1="0"
          y1={height - 20}
          x2="100"
          y2={height - 20}
          stroke="#e5e7eb"
          strokeWidth="0.3"
        />
      </svg>
    </div>
  );
}
