import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

export default function NewWeightIntake() {
  const navigate = useNavigate();
  const [goalCalories, setGoalCalories] = useState(null);
  const [todayTrainingInfo, setTodayTrainingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calories, setCalories] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    [],
  );

  const adjustedGoalCalories = useMemo(() => {
    if (!goalCalories || !todayTrainingInfo) return null;
    const goal = Number(goalCalories);
    const burned = Number(todayTrainingInfo.totalBurnedCalories) || 0;
    if (!Number.isFinite(goal)) return null;
    return goal + burned;
  }, [goalCalories, todayTrainingInfo]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const [statusRes, profileRes, trainingRes] = await Promise.all([
          api.get("/weight/status"),
          api.get("/weight/profile"),
          api.get("/weight/today-training"),
        ]);
        if (cancelled) return;
        if (!statusRes?.data?.tracking) {
          navigate("/dashboard/weight", { replace: true });
          return;
        }
        setGoalCalories(profileRes?.data?.goalCalories ?? null);
        setTodayTrainingInfo(trainingRes?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        const message = err?.response?.data?.message || "Failed to load weight profile.";
        if (String(message).toLowerCase().includes("not enabled")) {
          navigate("/dashboard/weight", { replace: true });
          return;
        }
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const caloriesNum = calories === "" ? NaN : Number(calories);
    if (!Number.isFinite(caloriesNum) || caloriesNum < 0) {
      setError("Calories must be 0 or greater.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/weight/intakes", {
        calories: caloriesNum,
      });
      navigate("/dashboard/weight/tracking", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add today's intake.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <h1 className="text-2xl font-bold">Add today's intake</h1>
            <p className="opacity-80">
              Log the calories you consumed today. Only one intake can be stored per day.
            </p>

            <div className="mt-2 text-sm opacity-70">Today: {todayLabel}</div>
            <div className="mt-1 text-sm opacity-70">
              Goal calories: {goalCalories === null ? "—" : `${goalCalories} kcal`}
            </div>
            {todayTrainingInfo?.trainedToday && (
              <>
                <div className="mt-2 text-sm opacity-70">
                  Burned during training: {todayTrainingInfo.totalBurnedCalories} kcal
                </div>
                <div className="mt-1 text-sm font-semibold text-green-400">
                  Adjusted goal for today: {adjustedGoalCalories === null ? "—" : `${adjustedGoalCalories} kcal`}
                </div>
              </>
            )}

            {error ? (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            ) : null}

            {isLoading ? <p className="opacity-80 mt-4">Loading…</p> : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Calories consumed</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input input-bordered w-full"
                  placeholder="2200"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/dashboard/weight/tracking")}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? "Saving…" : "Save intake"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

