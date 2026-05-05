// Utilities for bucketing time-series data and computing percentage changes.

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1);
}

// ISO week start (Monday)
function startOfISOWeek(d) {
  const date = startOfDay(d);
  const day = date.getDay(); // 0..6 (Sun..Sat)
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return startOfDay(date);
}

function bucketKey(date, granularity) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

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

export function sumByTimeBucket(items, granularity, getDate, getValue) {
  const map = new Map();

  for (const it of items ?? []) {
    const rawDate = getDate(it);
    const k = bucketKey(rawDate, granularity);
    if (k == null) continue;

    const v = Number(getValue(it) ?? 0);
    if (!Number.isFinite(v)) continue;

    map.set(k, (map.get(k) ?? 0) + v);
  }

  const points = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ts, value]) => ({ ts, value }));

  return points;
}

export function percentChangeSeries(points) {
  // Output: [{ ts, value: pctChange, base: sumValue }]
  const out = [];
  let prev = null;

  for (const p of points ?? []) {
    const curr = Number(p.value ?? 0);
    let pct = 0;

    if (prev == null) {
      pct = 0;
    } else if (prev === 0) {
      // Avoid exploding infinity when previous is 0.
      // Define: if curr is also 0 -> 0%, else -> 100%.
      pct = curr === 0 ? 0 : 100;
    } else {
      pct = ((curr - prev) / prev) * 100;
    }

    out.push({ ts: p.ts, value: pct, base: curr });
    prev = curr;
  }

  return out;
}

export function formatBucketLabel(ts, granularity) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";

  const optsDay = { month: "short", day: "2-digit" };
  const optsMonth = { year: "numeric", month: "short" };

  switch (granularity) {
    case "daily":
      return d.toLocaleDateString(undefined, optsDay);
    case "weekly":
      return `Wk of ${d.toLocaleDateString(undefined, optsDay)}`;
    case "monthly":
      return d.toLocaleDateString(undefined, optsMonth);
    case "yearly":
      return String(d.getFullYear());
    default:
      return d.toLocaleDateString();
  }
}

