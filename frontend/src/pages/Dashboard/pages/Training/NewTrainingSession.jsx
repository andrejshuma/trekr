import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

import WorkoutTypeSelect from "./components/WorkoutTypeSelect.jsx";
import CaloriesEstimate from "./components/CaloriesEstimate.jsx";

const NewTrainingSession = () => {
  const navigate = useNavigate();

  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [profileWeightKg, setProfileWeightKg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [type, setType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [autoCalculateCalories, setAutoCalculateCalories] = useState(true);
  const [calories, setCalories] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");

        const [typesRes, profileRes] = await Promise.all([
          api.get("/training/workout-types"),
          api.get("/training/profile"),
        ]);

        if (cancelled) return;

        const types = Array.isArray(typesRes?.data) ? typesRes.data : [];
        setWorkoutTypes(types);

        const weight = profileRes?.data?.weight;
        setProfileWeightKg(
          weight === null || weight === undefined || weight === ""
            ? null
            : Number(weight),
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ||
            "Failed to load workout types/training profile.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedWorkout = useMemo(
    () => workoutTypes.find((t) => t.type === type) ?? null,
    [workoutTypes, type],
  );

  const estimatedCalories = useMemo(() => {
    const met = selectedWorkout?.met;
    const durationNum = durationMinutes === "" ? NaN : Number(durationMinutes);
    const weightNum = profileWeightKg;
    if (!Number.isFinite(Number(met))) return null;
    if (!Number.isFinite(durationNum) || durationNum <= 0) return null;
    if (!Number.isFinite(weightNum) || weightNum <= 0) return null;

    const caloriesValue = Number(met) * weightNum * (durationNum / 60);
    if (!Number.isFinite(caloriesValue)) return null;
    return Math.round(caloriesValue * 100) / 100;
  }, [durationMinutes, profileWeightKg, selectedWorkout?.met]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLoading) return;

    if (!type) {
      setError("Please select a workout type.");
      return;
    }

    const durationNum = durationMinutes === "" ? NaN : Number(durationMinutes);
    if (!Number.isFinite(durationNum) || durationNum < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    const caloriesNum = calories === "" ? NaN : Number(calories);
    if (!autoCalculateCalories) {
      if (!Number.isFinite(caloriesNum) || caloriesNum < 0) {
        setError("Calories must be 0 or greater.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await api.post("/training/sessions", {
        type,
        durationMinutes: durationNum,
        autoCalculateCalories,
        calories: autoCalculateCalories ? null : caloriesNum,
      });

      navigate("/dashboard/training/tracking", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to add training session.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="card bg-base-200 border border-base-300 w-full max-w-2xl"
      >
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Add training session</h1>
              <p className="opacity-80 mt-1">
                Choose a workout type, enter the duration, and we’ll save your
                session.
              </p>
            </div>
          </div>

          {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

          {isLoading ? (
            <p className="opacity-80 mt-2">Loading workout types…</p>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <WorkoutTypeSelect
              workoutTypes={workoutTypes}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isLoading}
            />

            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                min={1}
                step={1}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={autoCalculateCalories}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoCalculateCalories(next);
                  if (
                    !next &&
                    (calories === "" || calories === null) &&
                    estimatedCalories !== null
                  ) {
                    setCalories(String(estimatedCalories));
                  }
                }}
              />
              <span className="label-text">Auto-calculate calories burned</span>
            </label>
            <p className="text-xs opacity-70 mt-1">
              Uses your training profile weight and the workout type.
            </p>
            <CaloriesEstimate
              estimatedCalories={estimatedCalories}
              profileWeightKg={profileWeightKg}
            />
          </div>

          <div className="mt-2">
            <label className="label">Calories (kcal)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              min={0}
              step={1}
              disabled={autoCalculateCalories}
              placeholder={
                autoCalculateCalories
                  ? "Calculated automatically"
                  : "Enter calories"
              }
              required={!autoCalculateCalories}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/dashboard/training/tracking")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-green-400! text-black! hover:bg-green-500!"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Saving…" : "Save session"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTrainingSession;
