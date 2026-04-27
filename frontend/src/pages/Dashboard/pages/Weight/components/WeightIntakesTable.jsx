import React, { useMemo } from "react";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

export default function WeightIntakesTable({
  intakes,
  isLoading,
  error,
  isLoadingMore,
  hasMore,
  onLoadMore,
  pageSize,
  goalCalories,
  onAddIntake,
  currentWeight,
  goalWeight,
}) {
  const columns = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "calories", label: "Calories" },
      { key: "delta", label: "Vs goal" },
    ],
    [],
  );

  // Determine if user is bulking (goal > current) or cutting (goal < current)
  const isBulking = useMemo(() => {
    const current = Number(currentWeight);
    const goal = Number(goalWeight);
    if (!Number.isFinite(current) || !Number.isFinite(goal)) {
      return null; // Can't determine
    }
    return goal > current;
  }, [currentWeight, goalWeight]);

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Daily intakes</h2>
          <span className="text-sm opacity-70">Showing {pageSize} per page</span>
        </div>

        {error ? (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="opacity-70">
                    Loading…
                  </td>
                </tr>
              ) : intakes.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-10">
                    <div className="flex flex-col items-center text-center gap-3">
                      <p className="opacity-80">No daily intakes yet.</p>
                      <button
                        type="button"
                        className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
                        onClick={onAddIntake}
                      >
                        Add your first daily intake
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                intakes.map((intake) => {
                  const calories = Number(intake?.calories);
                  const goal = Number(goalCalories);
                  const burned = Number(intake?.burnedCalories) || 0;
                  // If user trained that day, add burned calories to goal
                  const adjustedGoal = intake?.trainedThatDay ? goal + burned : goal;
                  const hasGoal = Number.isFinite(adjustedGoal);
                  const delta = hasGoal && Number.isFinite(calories) ? calories - adjustedGoal : null;
                  const deltaLabel =
                    delta === null
                      ? "—"
                      : `${delta > 0 ? "+" : ""}${formatNumber(delta)} kcal`;
                  
                  // Determine color based on bulking vs cutting
                  let deltaClass = "opacity-80";
                  if (delta !== null) {
                    if (isBulking === true) {
                      // Bulking: eating MORE is good (green), eating LESS is bad (red)
                      deltaClass = delta > 0 ? "text-green-400 font-semibold" : delta < 0 ? "text-red-400 font-semibold" : "opacity-80";
                    } else if (isBulking === false) {
                      // Cutting: eating LESS is good (green), eating MORE is bad (red)
                      deltaClass = delta > 0 ? "text-red-400 font-semibold" : delta < 0 ? "text-green-400 font-semibold" : "opacity-80";
                    }
                  }

                  return (
                    <tr key={intake.dailyIntakeId ?? `${intake.date}-${intake.calories}`}>
                      <td>{formatDate(intake.date)}</td>
                      <td>{formatNumber(intake.calories)} kcal</td>
                      <td className={deltaClass}>{deltaLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
            onClick={onAddIntake}
            disabled={isLoading}
          >
            + Add today's intake
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onLoadMore}
            disabled={isLoading || isLoadingMore || !hasMore}
          >
            {isLoadingMore ? "Loading…" : hasMore ? "Load more" : "No more"}
          </button>
        </div>
      </div>
    </div>
  );
}

