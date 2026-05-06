import React, { useMemo, useState } from "react";

import TimeRangeToggle from "../../../../../components/graphs/TimeRangeToggle.jsx";
import PercentChangeAreaChart from "../../../../../components/graphs/PercentChangeAreaChart.jsx";
import { percentChangeSeries, sumByTimeBucket } from "../../../../../utils/timeSeries.js";

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export default function WeightProgressCard({ intakes, goalCalories, isBulking }) {
  const [range, setRange] = useState("weekly");


  const points = useMemo(() => {
    // For a bucket (week/month/year) we aggregate:
    // - total calories
    // - total adjusted goal
    // then compute bucketCloseness% from those totals.
    const totals = sumByTimeBucket(
      intakes,
      range,
      (i) => i.date,
      (i) => Number(i?.calories) || 0,
    );

    const goalTotals = sumByTimeBucket(
      intakes,
      range,
      (i) => i.date,
      (i) => {
        const goal = Number(goalCalories);
        if (!Number.isFinite(goal) || goal <= 0) return 0;
        const burned = Number(i?.burnedCalories) || 0;
        const trained = Boolean(i?.trainedThatDay);
        return trained ? goal + burned : goal;
      },
    );

    const goalByTs = new Map(goalTotals.map((p) => [p.ts, p.value]));

    const closenessPoints = totals.map((p) => {
      const adjustedGoal = Number(goalByTs.get(p.ts) ?? 0);
      const calories = Number(p.value ?? 0);

      if (!Number.isFinite(adjustedGoal) || adjustedGoal <= 0) {
        return { ts: p.ts, value: 0 };
      }

      const pct = 100 - (Math.abs(calories - adjustedGoal) / adjustedGoal) * 100;
      return { ts: p.ts, value: clamp(pct, 0, 200) };
    });

    const pctChange = percentChangeSeries(closenessPoints);
    const adjusted =
      isBulking === false
        ? // Cutting: improvements should read as "positive" when the user stays under goal.
          // Flip the sign so the line direction matches the user's intent.
          pctChange.map((p) => ({ ...p, value: -Number(p.value ?? 0) }))
        : pctChange;

    // Reverse the graph line direction (invert Y) as requested.
    return adjusted.map((p) => ({ ...p, value: -Number(p.value ?? 0) }));
  }, [intakes, range, goalCalories, isBulking]);

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
              Add at least 2 daily intakes to see % change.
            </div>
          ) : (
            <PercentChangeAreaChart
              points={points}
              granularity={range}
              height={260}
              positiveColor="#60a5fa"
            />
          )}
        </div>

        <div className="mt-2 text-xs opacity-70">
          Showing percentage change in goal-accuracy (closeness %) per {range} bucket.
          {isBulking === null ? (
            <> Trend is not adjusted (missing current/goal weight). </>
          ) : (
            <> Trend is adjusted for your goal ({isBulking ? "bulking" : "cutting"}). </>
          )}
          Latest bucket closeness: {Math.round(latestBase)}%.
        </div>
      </div>
    </div>
  );
}

