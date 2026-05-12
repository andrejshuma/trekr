import React, { useMemo, useState } from "react";

import TimeRangeToggle from "../../../../../components/graphs/TimeRangeToggle.jsx";
import PercentChangeAreaChart from "../../../../../components/graphs/PercentChangeAreaChart.jsx";
import { formatBucketLabel } from "../../../../../utils/timeSeries.js";

function bucketKey(date, granularity) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function startOfISOWeek(d) {
    const date = startOfDay(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    return startOfDay(date);
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function startOfYear(d) {
    return new Date(d.getFullYear(), 0, 1);
  }

  let s;
  switch (granularity) {
    case "daily":
      s = startOfDay(d);
      break;
    case "weekly":
      s = startOfISOWeek(d);
      break;
    case "monthly":
      s = startOfMonth(d);
      break;
    case "yearly":
      s = startOfYear(d);
      break;
    default:
      s = startOfDay(d);
  }
  return s.getTime();
}

export default function InvestingProgressCard({ assets, quotesBySymbol = {} }) {
  const [range, setRange] = useState("weekly");

  const points = useMemo(() => {
    // Calculate portfolio percentage gain/loss over time using current prices
    // Display cumulative portfolio value and percentage change between time buckets

    if (!assets || assets.length === 0) {
      return [];
    }

    // Group assets by buy date bucket
    const buckets = new Map();
    for (const asset of assets) {
      if (asset?.buyDate) {
        const ts = bucketKey(asset.buyDate, range);
        if (ts !== null) {
          if (!buckets.has(ts)) {
            buckets.set(ts, []);
          }
          buckets.get(ts).push(asset);
        }
      }
    }

    // Sort buckets chronologically
    const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);

    // Calculate cumulative portfolio value at each bucket
    const points = [];
    let cumulativeAssets = [];

    for (const [ts, assetsInBucket] of sortedBuckets) {
      cumulativeAssets = [...cumulativeAssets, ...assetsInBucket];

      let totalInvested = 0;
      let totalCurrentValue = 0;

      for (const asset of cumulativeAssets) {
        const qty = Number(asset?.quantity) || 0;
        const buyPrice = Number(asset?.buyPrice) || 0;
        const ticker = String(asset?.tickerSymbol || "").toUpperCase();
        const currentPrice = quotesBySymbol[ticker] || buyPrice;

        totalInvested += qty * buyPrice;
        totalCurrentValue += qty * currentPrice;
      }

      if (totalInvested > 0) {
        points.push({
          ts,
          invested: totalInvested,
          current: totalCurrentValue,
        });
      }
    }

    // Calculate percentage gain from invested to current value
    const result = [];
    for (const p of points) {
      const percentageGain = ((p.current - p.invested) / p.invested) * 100;
      result.push({
        ts: p.ts,
        value: percentageGain,
        base: p.current,
        invested: p.invested,
      });
    }

    return result;
  }, [assets, range, quotesBySymbol]);

  const latest = points?.length ? points[points.length - 1] : null;
  const latestPct = latest ? Number(latest.value ?? 0) : 0;
  const latestCurrentValue = latest ? Number(latest.base ?? 0) : 0;
  const latestInvested = latest ? Number(latest.invested ?? 0) : 0;

  const totalCurrentPortfolioValue = assets.reduce((sum, asset) => {
    const qty = Number(asset?.quantity) || 0;
    const ticker = String(asset?.tickerSymbol || "").toUpperCase();
    const currentPrice = quotesBySymbol[ticker] || Number(asset?.buyPrice) || 0;
    return sum + qty * currentPrice;
  }, 0);

  const totalInvestedAmount = assets.reduce((sum, asset) => {
    const qty = Number(asset?.quantity) || 0;
    const buyPrice = Number(asset?.buyPrice) || 0;
    return sum + qty * buyPrice;
  }, 0);

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="card-title">Portfolio Value</h2>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-semibold">
                ${totalCurrentPortfolioValue.toFixed(2)}
              </span>
              <span
                className={`text-xs font-bold ${
                  latestPct >= 0 ? "text-success" : "text-error"
                }`}
              >
                {latestPct >= 0 ? "+" : ""}
                {latestPct.toFixed(2)}%
              </span>
            </div>
            <TimeRangeToggle value={range} onChange={setRange} />
          </div>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 p-2">
          {points.length < 1 ? (
            <div className="flex h-65 items-center justify-center text-sm opacity-70">
              Add investments to see portfolio growth.
            </div>
          ) : (
            <PercentChangeAreaChart
              points={points}
              granularity={range}
              height={260}
              positiveColor="#10b981"
            />
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded bg-base-300 p-2">
            <div className="opacity-70">Invested</div>
            <div className="font-semibold">${totalInvestedAmount.toFixed(2)}</div>
          </div>
          <div className="rounded bg-base-300 p-2">
            <div className="opacity-70">Current Value</div>
            <div className="font-semibold">${totalCurrentPortfolioValue.toFixed(2)}</div>
          </div>
          <div className="rounded bg-base-300 p-2">
            <div className="opacity-70">Gain/Loss</div>
            <div
              className={`font-semibold ${
                totalCurrentPortfolioValue >= totalInvestedAmount
                  ? "text-success"
                  : "text-error"
              }`}
            >
              ${(totalCurrentPortfolioValue - totalInvestedAmount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
