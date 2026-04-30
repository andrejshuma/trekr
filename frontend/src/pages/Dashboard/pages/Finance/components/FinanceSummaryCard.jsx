import React from "react";
import FinanceLegend from "./FinanceLegend.jsx";
import FinancePieChart from "./FinancePieChart.jsx";

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

export default function FinanceSummaryCard({ segments, totalThisMonth, onEdit }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="card-title">Budget distribution</h2>
            <p className="text-sm opacity-80">
              Your current percentages (stored in your finance profile).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={onEdit}>
              Edit
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-lg border border-base-300 bg-base-100 p-4">
            <div className="text-sm opacity-70">Total money earned this month</div>
            <div className="text-2xl font-bold tabular-nums">
              {formatMoney(totalThisMonth)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] items-center">
          <div className="flex justify-center md:justify-start">
            <FinancePieChart segments={segments} size={180} />
          </div>

          <div className="space-y-4">
            <FinanceLegend segments={segments} />

            <div className="divider my-0" />

            <div className="space-y-2 text-sm">
              {segments.map((s) => {
                const pct = Number(s.value) || 0;
                const allocated = ((Number(totalThisMonth) || 0) * pct) / 100;
                return (
                  <div
                    key={s.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="opacity-80">
                        {s.label} allocation
                      </span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {formatMoney(allocated)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

