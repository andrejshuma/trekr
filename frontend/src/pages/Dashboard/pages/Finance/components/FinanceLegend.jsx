import React from "react";

export default function FinanceLegend({ segments }) {
  return (
    <div className="space-y-2 text-sm">
      {(segments ?? []).map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded"
              style={{ backgroundColor: s.color }}
            />
            <span className="opacity-80">{s.label}</span>
          </div>
          <span className="font-medium tabular-nums">{Number(s.value) || 0}%</span>
        </div>
      ))}
    </div>
  );
}

