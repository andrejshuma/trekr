import React, { Suspense, lazy, useMemo } from "react";

import { formatBucketLabel } from "../../utils/timeSeries.js";

// Lazy-load ApexCharts (same as PercentChangeAreaChart)
const ApexChart = lazy(() => import("react-apexcharts"));

/**
 * Multi-series % change area chart.
 *
 * seriesList: [{ name: string, points: [{ts, value}], color: string }]
 * granularity: daily | weekly | monthly | yearly
 */
export default function MultiPercentChangeAreaChart({
  seriesList,
  granularity,
  height = 320,
}) {
  const series = useMemo(() => {
    return (seriesList ?? []).map((s) => ({
      name: s.name,
      data: (s.points ?? []).map((p) => ({ x: p.ts, y: Number(p.value ?? 0) })),
    }));
  }, [seriesList]);

  const colors = useMemo(() => (seriesList ?? []).map((s) => s.color), [seriesList]);

  const options = useMemo(() => {
    return {
      chart: {
        type: "area",
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: "easeinout", speed: 450 },
        fontFamily: "inherit",
        foreColor: "rgba(255,255,255,0.72)",
      },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.18,
          opacityFrom: 0.22,
          opacityTo: 0.03,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "rgba(255,255,255,0.08)",
        strokeDashArray: 4,
      },
      legend: {
        show: false, // we render our own legend outside for better layout
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
          formatter: (v) => `${Number(v ?? 0).toFixed(1)}%`,
        },
      },
      colors,
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: "rgba(255,255,255,0.25)",
            strokeDashArray: 4,
          },
        ],
      },
    };
  }, [colors, granularity]);

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

