import React, { Suspense, lazy, useMemo } from "react";

import { formatBucketLabel } from "../../utils/timeSeries.js";

// Code-split the charting library (ApexCharts) so it doesn't bloat the initial bundle.
const ApexChart = lazy(() => import("react-apexcharts"));

export default function PercentChangeAreaChart({
  points,
  granularity,
  height = 260,
  positiveColor = "#22c55e",
}) {
  const series = useMemo(() => {
    const data = (points ?? []).map((p) => ({ x: p.ts, y: Number(p.value ?? 0) }));
    return [{ name: "% change", data }];
  }, [points]);

  const options = useMemo(() => {
    return {
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: "easeinout", speed: 450 },
        fontFamily: "inherit",
        foreColor: "rgba(255,255,255,0.72)",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.2,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "rgba(255,255,255,0.08)",
        strokeDashArray: 4,
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          formatter: (value, timestamp) => formatBucketLabel(timestamp, granularity),
        },
        axisBorder: { color: "rgba(255,255,255,0.10)" },
        axisTicks: { color: "rgba(255,255,255,0.10)" },
      },
      yaxis: {
        labels: {
          formatter: (v) => `${Math.round(v)}%`,
        },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (_v, opts) => {
            const p = points?.[opts.dataPointIndex];
            const pct = Number(p?.value ?? 0);
            const base = Number(p?.base ?? 0);
            return `${pct.toFixed(1)}% (base ${Math.round(base)})`;
          },
        },
      },
      colors: [positiveColor],
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: "rgba(255,255,255,0.25)",
            strokeDashArray: 4,
          },
        ],
      },
      // Color negative area differently by using a second series-like trick is overkill;
      // we keep a single color and rely on the 0% line for readability.
    };
  }, [granularity, points, positiveColor]);

  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center" style={{ height }}>
            <span className="loading loading-spinner loading-md" />
          </div>
        }
      >
        <ApexChart options={options} series={series} type="area" height={height} />
      </Suspense>
    </div>
  );
}



