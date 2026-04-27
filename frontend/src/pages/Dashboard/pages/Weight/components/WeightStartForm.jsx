import React from "react";

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

export default function WeightStartForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
  autoCalculateTargets,
  setAutoCalculateTargets,
  estimatedGoalTimeWeeks,
  estimatedGoalCalories,
}) {
  return (
    <form onSubmit={onSubmit} className="card bg-base-200 border border-base-300">
      <div className="card-body items-center text-center">
        <h1 className="text-3xl font-bold">Start tracking weight</h1>
        <p className="opacity-80 max-w-2xl">
          Fill in your current body metrics and the target you want to reach.
          Trekr will estimate the time and goal calories in the form, and you can
          override the calculation manually if you want to plan your own target.
        </p>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">Current weight (kg)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.weight}
              onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
              min={1}
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="label">Height (cm)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.height}
              onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
              min={1}
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="label">Goal weight (kg)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.goalWeight}
              onChange={(e) =>
                setForm((p) => ({ ...p, goalWeight: e.target.value }))
              }
              min={1}
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="mt-4 w-full rounded-2xl border border-base-300 bg-base-100 p-4 text-left">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox"
              checked={autoCalculateTargets}
              onChange={(e) => {
                const next = e.target.checked;
                setAutoCalculateTargets(next);
                if (!next) {
                  if (form.goalTimeWeeks === "" && estimatedGoalTimeWeeks !== null) {
                    setForm((p) => ({
                      ...p,
                      goalTimeWeeks: String(estimatedGoalTimeWeeks),
                    }));
                  }
                  if (form.goalCalories === "" && estimatedGoalCalories !== null) {
                    setForm((p) => ({
                      ...p,
                      goalCalories: String(estimatedGoalCalories),
                    }));
                  }
                }
              }}
            />
            <span className="label-text">Auto-calculate goal time and calories</span>
          </label>
          <p className="text-xs opacity-70 mt-1">
            Trekr calculates the recommended time locally and only saves your
            weight profile plus the calorie target.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-base-300 p-3">
              <div className="text-xs uppercase opacity-60">Suggested time</div>
              <div className="text-xl font-semibold">
                {formatNumber(estimatedGoalTimeWeeks)} weeks
              </div>
            </div>
            <div className="rounded-xl border border-base-300 p-3">
              <div className="text-xs uppercase opacity-60">Suggested calories</div>
              <div className="text-xl font-semibold">
                {formatNumber(estimatedGoalCalories)} kcal
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Goal time (weeks)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.goalTimeWeeks}
              onChange={(e) =>
                setForm((p) => ({ ...p, goalTimeWeeks: e.target.value }))
              }
              min={0}
              step="0.1"
              disabled={autoCalculateTargets}
              placeholder={autoCalculateTargets ? "Calculated automatically" : "12.5"}
              required={!autoCalculateTargets}
            />
          </div>

          <div>
            <label className="label">Goal calories (kcal)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.goalCalories}
              onChange={(e) =>
                setForm((p) => ({ ...p, goalCalories: e.target.value }))
              }
              min={0}
              step="0.1"
              disabled={autoCalculateTargets}
              placeholder={autoCalculateTargets ? "Calculated automatically" : "2200"}
              required={!autoCalculateTargets}
            />
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            className="btn btn-lg w-full sm:w-auto bg-green-400! text-black! hover:bg-green-500!"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting…" : "Start Tracking"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

