import React, { useMemo } from "react";

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function FinancePieChart({ segments, size = 180 }) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  const normalized = useMemo(() => {
    const values = (segments ?? []).map((s) => ({
      ...s,
      value: Math.max(0, Number(s.value) || 0),
    }));
    const sum = values.reduce((acc, s) => acc + s.value, 0);
    if (sum <= 0) return values.map((s) => ({ ...s, frac: 0 }));
    return values.map((s) => ({ ...s, frac: clamp01(s.value / sum) }));
  }, [segments]);

  let currentAngle = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Budget distribution pie chart"
    >
      <circle cx={cx} cy={cy} r={r} fill="#111827" opacity="0.15" />
      {normalized.map((s) => {
        const start = currentAngle;
        const sweep = s.frac * 360;
        const end = start + sweep;
        currentAngle = end;

        if (sweep <= 0.001) return null;
        return (
          <path
            key={s.key}
            d={arcPath(cx, cy, r, start, end)}
            fill={s.color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--fallback-b1, oklch(var(--b1)/1))" />
    </svg>
  );
}

