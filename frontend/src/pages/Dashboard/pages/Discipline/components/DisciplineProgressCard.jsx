import React, { useMemo, useState } from "react";

import TimeRangeToggle from "../../../../../components/graphs/TimeRangeToggle.jsx";
import PercentChangeAreaChart from "../../../../../components/graphs/PercentChangeAreaChart.jsx";
import { percentChangeSeries, sumByTimeBucket } from "../../../../../utils/timeSeries.js";

export default function DisciplineProgressCard({ completions }) {
  const [range, setRange] = useState("weekly");

  const points = useMemo(() => {
    // Bucket daily completion percentages by time range.
    // For weekly/monthly/yearly we compute the *average* completion % in that period.
    const sums = sumByTimeBucket(
      completions,
      range,
      (c) => c.date,
      (c) => Number(c?.procent) || 0,
    );

    const counts = sumByTimeBucket(
      completions,
      range,
      (c) => c.date,
      () => 1,
    );

    const countByTs = new Map(counts.map((p) => [p.ts, p.value]));

    const avgPoints = sums.map((p) => {
      const count = Number(countByTs.get(p.ts) ?? 0);
      const avg = count > 0 ? Number(p.value ?? 0) / count : 0;
      return { ts: p.ts, value: avg };
    });

    return percentChangeSeries(avgPoints);
  }, [completions, range]);

  const latest = points?.length ? points[points.length - 1] : null;
  const latestPct = latest ? Number(latest.value ?? 0) : 0;
  const latestBase = latest ? Number(latest.base ?? 0) : 0;

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="card-title">Progress</h2>
          <div className="flex items-center gap-3">
            <span className="badge badge-ghost">
              {latestPct >= 0 ? "+" : ""}
              {latestPct.toFixed(1)}% (last)
            </span>
            <TimeRangeToggle value={range} onChange={setRange} />
          </div>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 p-2">
          {points.length < 2 ? (
            <div className="flex h-65 items-center justify-center text-sm opacity-70">
              Add at least 2 daily completion records to see % change.
            </div>
          ) : (
            <PercentChangeAreaChart
              points={points}
              granularity={range}
              height={260}
              positiveColor="#fbbf24"
            />
          )}
        </div>

        <div className="mt-2 text-xs opacity-70">
          Showing percentage change in average completion % per {range} bucket. Latest bucket avg: {Math.round(latestBase)}%.
        </div>
      </div>
    </div>
  );
}

