import React, { useCallback, useEffect, useMemo, useState } from "react";

import api from "../../../../api/axios";
import { getFinanceStatus, getIncomes } from "../../../../api/finance";
import { getDisciplineStatus } from "../../../../api/discipline";
import { getDailyCompletions } from "../../../../api/dailyCompletion";

import MultiPercentChangeAreaChart from "../../../../components/graphs/MultiPercentChangeAreaChart.jsx";
import TimeRangeToggle from "../../../../components/graphs/TimeRangeToggle.jsx";
import { percentChangeSeries, sumByTimeBucket } from "../../../../utils/timeSeries.js";

import TrainingProgressCard from "../Training/components/TrainingProgressCard.jsx";
import WeightProgressCard from "../Weight/components/WeightProgressCard.jsx";
import FinanceProgressCard from "../Finance/components/FinanceProgressCard.jsx";
import DisciplineProgressCard from "../Discipline/components/DisciplineProgressCard.jsx";
import InvestingProgressCard from "../Investing/components/InvestingProgressCard.jsx";

function Legend({ items, enabledKeys, onToggle, onShowAll, onHideAll }) {
  if (!items?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-xs hover:bg-white/10"
          onClick={onShowAll}
        >
          Show all
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs hover:bg-white/10"
          onClick={onHideAll}
        >
          Hide all
        </button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {items.map((it) => {
          const enabled = enabledKeys?.has(it.key);
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onToggle?.(it.key)}
              className={
                "flex items-center gap-2 rounded-full border px-2.5 py-1 transition " +
                (enabled
                  ? "border-base-300 bg-base-100 hover:bg-base-100/70"
                  : "border-transparent bg-base-300/30 opacity-60 hover:opacity-80")
              }
              title={enabled ? "Click to hide" : "Click to show"}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: it.color }}
                aria-hidden
              />
              <span className="opacity-90">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ControlCenter() {
  const [range, setRange] = useState("weekly");

  const [visibleSeries, setVisibleSeries] = useState(() => new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [tracking, setTracking] = useState({
    weight: false,
    training: false,
    finance: false,
    discipline: false,
    investing: false,
  });

  const [trainingSessions, setTrainingSessions] = useState([]);
  const [weightProfile, setWeightProfile] = useState(null);
  const [weightIntakes, setWeightIntakes] = useState([]);
  const [financeIncomes, setFinanceIncomes] = useState([]);
  const [disciplineCompletions, setDisciplineCompletions] = useState([]);
  const [investingAssets, setInvestingAssets] = useState([]);

  const fetchAllPaged = useCallback(async (fnPage, pageSize, maxPages = 400) => {
    let p = 0;
    let hasMorePages = true;
    const all = [];
    while (hasMorePages) {
      const res = await fnPage(p, pageSize);
      const items = res.items;
      all.push(...items);
      hasMorePages = Boolean(res.hasMore) && items.length > 0;
      p += 1;
      if (p > maxPages) break;
    }
    return all;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");

        // Determine tracking flags (cheap endpoints)
        const [weightRes, trainingRes, investingRes, financeTracking, disciplineTracking] =
          await Promise.all([
            api.get("/weight/status"),
            api.get("/training/status"),
            api.get("/investing/status"),
            getFinanceStatus(),
            getDisciplineStatus(),
          ]);

        const nextTracking = {
          weight: Boolean(weightRes?.data?.tracking),
          training: Boolean(trainingRes?.data?.tracking),
          investing: Boolean(investingRes?.data?.tracking),
          finance: Boolean(financeTracking),
          discipline: Boolean(disciplineTracking),
        };

        if (cancelled) return;
        setTracking(nextTracking);

        // Data fetches (only for tracked features)
        const tasks = [];

        if (nextTracking.training) {
          tasks.push(
            fetchAllPaged(
              async (page, size) => {
                const resp = await api.get("/training/sessions", { params: { page, size } });
                const data = resp?.data ?? {};
                return {
                  items: Array.isArray(data.sessions) ? data.sessions : [],
                  hasMore: Boolean(data.hasMore),
                };
              },
              500,
              200,
            ).then((all) => setTrainingSessions(all)),
          );
        }

        if (nextTracking.weight) {
          tasks.push(
            api.get("/weight/profile").then((res) => setWeightProfile(res?.data ?? null)),
          );
          tasks.push(
            fetchAllPaged(
              async (page, size) => {
                const resp = await api.get("/weight/intakes", { params: { page, size } });
                const data = resp?.data ?? {};
                return {
                  items: Array.isArray(data.intakes) ? data.intakes : [],
                  hasMore: Boolean(data.hasMore),
                };
              },
              500,
              200,
            ).then((all) => setWeightIntakes(all)),
          );
        }

        if (nextTracking.finance) {
          tasks.push(
            fetchAllPaged(
              async (page, size) => {
                const data = await getIncomes({ page, size });
                return {
                  items: Array.isArray(data?.incomes) ? data.incomes : [],
                  hasMore: Boolean(data?.hasMore),
                };
              },
              500,
              200,
            ).then((all) => setFinanceIncomes(all)),
          );
        }

        if (nextTracking.discipline) {
          tasks.push(
            fetchAllPaged(
              async (page, size) => {
                const data = await getDailyCompletions({ page, size });
                return {
                  items: Array.isArray(data?.completions) ? data.completions : [],
                  hasMore: Boolean(data?.hasMore),
                };
              },
              500,
              400,
            ).then((all) => setDisciplineCompletions(all)),
          );
        }

        if (nextTracking.investing) {
          tasks.push(
            fetchAllPaged(
              async (page, size) => {
                const resp = await api.get("/investing/assets", { params: { page, size } });
                const data = resp?.data ?? {};
                return {
                  items: Array.isArray(data.assets) ? data.assets : [],
                  hasMore: Boolean(data.hasMore),
                };
              },
              200,
              200,
            ).then((all) => setInvestingAssets(all)),
          );
        }

        await Promise.all(tasks);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || "Failed to load Control Center.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchAllPaged]);

  const weightGoalCalories = weightProfile?.goalCalories ?? null;
  const isBulking = useMemo(() => {
    const current = Number(weightProfile?.weight);
    const goal = Number(weightProfile?.goalWeight);
    if (!Number.isFinite(current) || !Number.isFinite(goal)) return null;
    return goal > current;
  }, [weightProfile]);

  const combinedLegend = useMemo(
    () =>
      [
        tracking.training ? { key: "training", label: "Training", color: "#22c55e" } : null,
        tracking.weight ? { key: "weight", label: "Weight", color: "#60a5fa" } : null,
        tracking.finance ? { key: "finance", label: "Finance", color: "#a855f7" } : null,
        tracking.discipline ? { key: "discipline", label: "Discipline", color: "#fbbf24" } : null,
        tracking.investing ? { key: "investing", label: "Investing", color: "#14b8a6" } : null,
      ].filter(Boolean),
    [tracking],
  );

  // Initialize visible series to "all tracked" whenever tracking changes.
  useEffect(() => {
    setVisibleSeries(new Set((combinedLegend ?? []).map((x) => x.key)));
  }, [combinedLegend]);

  const onToggleSeries = useCallback((key) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const onShowAllSeries = useCallback(() => {
    setVisibleSeries(new Set((combinedLegend ?? []).map((x) => x.key)));
  }, [combinedLegend]);

  const onHideAllSeries = useCallback(() => {
    setVisibleSeries(new Set());
  }, []);

  const combinedSeriesList = useMemo(() => {
    const out = [];

    if (tracking.training) {
      const buckets = sumByTimeBucket(
        trainingSessions,
        range,
        (s) => s.date,
        (s) => s.calories,
      );
      out.push({
        name: "Training",
        key: "training",
        color: "#22c55e",
        points: percentChangeSeries(buckets),
      });
    }

    if (tracking.finance) {
      const buckets = sumByTimeBucket(
        financeIncomes,
        range,
        (i) => i.date,
        (i) => i.amount,
      );
      out.push({
        name: "Finance",
        key: "finance",
        color: "#a855f7",
        points: percentChangeSeries(buckets),
      });
    }

    if (tracking.discipline) {
      // average completion per bucket
      const sums = sumByTimeBucket(
        disciplineCompletions,
        range,
        (c) => c.date,
        (c) => Number(c?.procent) || 0,
      );
      const counts = sumByTimeBucket(
        disciplineCompletions,
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

      out.push({
        name: "Discipline",
        key: "discipline",
        color: "#fbbf24",
        points: percentChangeSeries(avgPoints),
      });
    }

    if (tracking.investing) {
      const buckets = sumByTimeBucket(
        investingAssets,
        range,
        (a) => a.buyDate,
        (a) => (Number(a?.quantity) || 0) * (Number(a?.buyPrice) || 0),
      );
      out.push({
        name: "Investing",
        key: "investing",
        color: "#14b8a6",
        points: percentChangeSeries(buckets),
      });
    }

    if (tracking.weight) {
      // replicate WeightProgressCard base series (closeness %) then % change.
      const totals = sumByTimeBucket(
        weightIntakes,
        range,
        (i) => i.date,
        (i) => Number(i?.calories) || 0,
      );
      const goalTotals = sumByTimeBucket(
        weightIntakes,
        range,
        (i) => i.date,
        (i) => {
          const goal = Number(weightGoalCalories);
          if (!Number.isFinite(goal) || goal <= 0) return 0;
          const burned = Number(i?.burnedCalories) || 0;
          const trained = Boolean(i?.trainedThatDay);
          return trained ? goal + burned : goal;
        },
      );
      const goalByTs = new Map(goalTotals.map((p) => [p.ts, p.value]));
      const closeness = totals.map((p) => {
        const adjustedGoal = Number(goalByTs.get(p.ts) ?? 0);
        const calories = Number(p.value ?? 0);
        if (!Number.isFinite(adjustedGoal) || adjustedGoal <= 0) return { ts: p.ts, value: 0 };
        const pct = 100 - (Math.abs(calories - adjustedGoal) / adjustedGoal) * 100;
        const clamped = Math.min(200, Math.max(0, pct));
        return { ts: p.ts, value: clamped };
      });
      let weightSeries = percentChangeSeries(closeness);
      if (isBulking === false) {
        weightSeries = weightSeries.map((p) => ({ ...p, value: -Number(p.value ?? 0) }));
      }
      // Weight graph is reversed (matches WeightProgressCard)
      weightSeries = weightSeries.map((p) => ({ ...p, value: -Number(p.value ?? 0) }));

      out.push({
        name: "Weight",
        key: "weight",
        color: "#60a5fa",
        points: weightSeries,
      });
    }

    return out;
  }, [
    disciplineCompletions,
    financeIncomes,
    investingAssets,
    isBulking,
    range,
    tracking,
    trainingSessions,
    weightGoalCalories,
    weightIntakes,
  ]);

  const filteredCombinedSeriesList = useMemo(() => {
    return (combinedSeriesList ?? []).filter((s) => visibleSeries.has(s.key));
  }, [combinedSeriesList, visibleSeries]);

  const trackedCount = Object.values(tracking).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control Center</h1>
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <p className="opacity-80">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control Center</h1>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (trackedCount === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control Center</h1>
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <p className="opacity-80">
              Start tracking at least one area (Weight / Training / Finance / Discipline / Investing) to see your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control Center</h1>
          <p className="mt-1 text-sm opacity-70">
            Correlate your progress across everything you track.
          </p>
        </div>
        <TimeRangeToggle value={range} onChange={setRange} />
      </div>

      <div className="card bg-base-200/60 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="card-title">Correlation</h2>
              <p className="mt-1 text-xs opacity-70">
                Toggle lines to isolate signals. All metrics are % change per {range} bucket.
              </p>
            </div>
            <Legend
              items={combinedLegend}
              enabledKeys={visibleSeries}
              onToggle={onToggleSeries}
              onShowAll={onShowAllSeries}
              onHideAll={onHideAllSeries}
            />
          </div>

          <div className="mt-4 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 p-2">
            {filteredCombinedSeriesList.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm opacity-70">
                Toggle at least one line in the legend to display the chart.
              </div>
            ) : filteredCombinedSeriesList.every((s) => (s.points?.length ?? 0) < 2) ? (
              <div className="flex h-80 items-center justify-center text-sm opacity-70">
                Add more history to see correlations.
              </div>
            ) : (
              <MultiPercentChangeAreaChart
                seriesList={filteredCombinedSeriesList}
                granularity={range}
                height={340}
              />
            )}
          </div>

          <div className="mt-3 text-xs opacity-70">
            Each line uses the same time bucket toggle, but has its own base metric (calories, income totals, completion average, etc.).
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {tracking.training ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Training</h3>
              <span className="badge badge-ghost" style={{ borderColor: "#22c55e" }}>
                % change
              </span>
            </div>
            <TrainingProgressCard sessions={trainingSessions} />
          </div>
        ) : null}

        {tracking.weight ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Weight</h3>
              <span className="badge badge-ghost" style={{ borderColor: "#60a5fa" }}>
                % change
              </span>
            </div>
            <WeightProgressCard
              intakes={weightIntakes}
              goalCalories={weightGoalCalories}
              isBulking={isBulking}
            />
          </div>
        ) : null}

        {tracking.finance ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Finance</h3>
              <span className="badge badge-ghost" style={{ borderColor: "#a855f7" }}>
                % change
              </span>
            </div>
            <FinanceProgressCard incomes={financeIncomes} />
          </div>
        ) : null}

        {tracking.discipline ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Discipline</h3>
              <span className="badge badge-ghost" style={{ borderColor: "#fbbf24" }}>
                % change
              </span>
            </div>
            <DisciplineProgressCard completions={disciplineCompletions} />
          </div>
        ) : null}

        {tracking.investing ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Investing</h3>
              <span className="badge badge-ghost" style={{ borderColor: "#14b8a6" }}>
                % change
              </span>
            </div>
            <InvestingProgressCard assets={investingAssets} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
