import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";

import TrainingCenteredCard from "./components/TrainingCenteredCard.jsx";
import TrainingStartCtaCard from "./components/TrainingStartCtaCard.jsx";
import TrainingStartForm from "./components/TrainingStartForm.jsx";

const Training = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [step, setStep] = useState("cta"); // cta | form
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = useMemo(() => ({ gender: "", age: "", weight: "" }), []);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/training/status");
        const tracking = Boolean(res?.data?.tracking);
        if (!isMounted) return;
        setIsTracking(tracking);
        if (tracking) {
          navigate("/dashboard/training/tracking", { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message || "Failed to load training status";
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
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/training/start", {
        gender: form.gender,
        age: form.age === "" ? null : Number(form.age),
        weight: form.weight === "" ? null : Number(form.weight),
      });

      setIsTracking(true);
      navigate("/dashboard/training/tracking", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to start tracking";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <TrainingCenteredCard title="Training" message="Loading…" />;
  }

  if (isTracking) {
    return <TrainingCenteredCard title="Training" message="Redirecting…" />;
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        {step === "cta" ? (
          <TrainingStartCtaCard error={error} onStart={onStart} />
        ) : (
          <TrainingStartForm
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            onCancel={onCancel}
            error={error}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Training;
