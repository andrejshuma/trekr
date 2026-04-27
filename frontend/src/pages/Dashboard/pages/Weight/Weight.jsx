import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

import WeightCenteredCard from "./components/WeightCenteredCard.jsx";
import WeightStartCtaCard from "./components/WeightStartCtaCard.jsx";
import WeightStartForm from "./components/WeightStartForm.jsx";

function estimateGoalTimeWeeks(currentWeight, goalWeight) {
  const current = Number(currentWeight);
  const goal = Number(goalWeight);
  if (!Number.isFinite(current) || !Number.isFinite(goal) || current <= 0 || goal <= 0) {
    return null;
  }
  const difference = Math.abs(goal - current);
  return Math.round((difference / 0.5) * 100) / 100;
}

function estimateGoalCalories(currentWeight, height, goalWeight) {
  const current = Number(currentWeight);
  const h = Number(height);
  const goal = Number(goalWeight);
  if (!Number.isFinite(current) || !Number.isFinite(h) || !Number.isFinite(goal)) {
    return null;
  }

  const maintenance = current * 10 + h * 6.25 + 50;
  if (goal < current) return Math.max(0, Math.round((maintenance - 500) * 100) / 100);
  if (goal > current) return Math.round((maintenance + 300) * 100) / 100;
  return Math.round(maintenance * 100) / 100;
}

const Weight = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [step, setStep] = useState("cta");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalculateTargets, setAutoCalculateTargets] = useState(true);

  const initialForm = useMemo(
    () => ({
      weight: "",
      height: "",
      goalWeight: "",
      goalTimeWeeks: "",
      goalCalories: "",
    }),
    [],
  );
  const [form, setForm] = useState(initialForm);

  const estimatedGoalTimeWeeks = useMemo(
    () => estimateGoalTimeWeeks(form.weight, form.goalWeight),
    [form.weight, form.goalWeight],
  );
  const estimatedGoalCalories = useMemo(
    () => estimateGoalCalories(form.weight, form.height, form.goalWeight),
    [form.weight, form.height, form.goalWeight],
  );

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/weight/status");
        const tracking = Boolean(res?.data?.tracking);
        if (!isMounted) return;
        setIsTracking(tracking);
        if (tracking) {
          navigate("/dashboard/weight/tracking", { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const message = err?.response?.data?.message || "Failed to load weight status";
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const onStart = () => {
    setError("");
    setStep("form");
  };

  const onCancel = () => {
    setStep("cta");
    setForm(initialForm);
    setAutoCalculateTargets(true);
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/weight/start", {
        weight: form.weight === "" ? null : Number(form.weight),
        height: form.height === "" ? null : Number(form.height),
        goalWeight: form.goalWeight === "" ? null : Number(form.goalWeight),
        goalCalories: autoCalculateTargets
          ? null
          : form.goalCalories === ""
            ? null
            : Number(form.goalCalories),
        autoCalculateTargets,
      });

      setIsTracking(true);
      navigate("/dashboard/weight/tracking", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to start weight tracking";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <WeightCenteredCard title="Weight" message="Loading…" />;
  }

  if (isTracking) {
    return <WeightCenteredCard title="Weight" message="Redirecting…" />;
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {step === "cta" ? (
          <WeightStartCtaCard error={error} onStart={onStart} isSubmitting={isSubmitting} />
        ) : (
          <WeightStartForm
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            onCancel={onCancel}
            error={error}
            isSubmitting={isSubmitting}
            autoCalculateTargets={autoCalculateTargets}
            setAutoCalculateTargets={setAutoCalculateTargets}
            estimatedGoalTimeWeeks={estimatedGoalTimeWeeks}
            estimatedGoalCalories={estimatedGoalCalories}
          />
        )}
      </div>
    </div>
  );
};

export default Weight;
