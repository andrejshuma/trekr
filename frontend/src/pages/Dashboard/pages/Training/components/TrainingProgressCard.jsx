import React, { useMemo, useState } from "react";

import TimeRangeToggle from "../../../../../components/graphs/TimeRangeToggle.jsx";
import PercentChangeAreaChart from "../../../../../components/graphs/PercentChangeAreaChart.jsx";
import { percentChangeSeries, sumByTimeBucket } from "../../../../../utils/timeSeries.js";

const TrainingProgressCard = ({ sessions }) => {
  const [range, setRange] = useState("weekly");

  const points = useMemo(() => {
    const buckets = sumByTimeBucket(
      sessions,
      range,
      (s) => s.date,
      (s) => s.calories
    );
    return percentChangeSeries(buckets);
  }, [range, sessions]);

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
              Add at least 2 sessions to see % change.
            </div>
          ) : (
            <PercentChangeAreaChart
              points={points}
              granularity={range}
              height={260}
            />
          )}
        </div>

        <div className="mt-2 text-xs opacity-70">
          Showing percentage change in calories burned per {range} bucket. Latest bucket total: {Math.round(latestBase)}.
        </div>
      </div>
    </div>
  );
};

export default TrainingProgressCard;
