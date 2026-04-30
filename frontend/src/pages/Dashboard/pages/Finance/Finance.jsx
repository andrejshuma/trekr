import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFinanceStatus, startFinanceTracking } from "../../../../api/finance";

import FinanceCenteredCard from "./components/FinanceCenteredCard.jsx";
import FinanceStartCtaCard from "./components/FinanceStartCtaCard.jsx";
import FinanceStartForm from "./components/FinanceStartForm.jsx";

export default function Finance() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [step, setStep] = useState("cta"); // cta | form
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = useMemo(
    () => ({
      spendingBudget: "50",
      savingBudget: "20",
      investingBudget: "20",
      donationBudget: "5",
      credit: "5",
    }),
    [],
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const tracking = await getFinanceStatus();
        if (!isMounted) return;
        setIsTracking(tracking);
        if (tracking) {
          navigate("/dashboard/finance/tracking", { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message || "Failed to load finance status";
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
      await startFinanceTracking({
        spendingBudget:
          form.spendingBudget === "" ? null : Number(form.spendingBudget),
        savingBudget: form.savingBudget === "" ? null : Number(form.savingBudget),
        investingBudget:
          form.investingBudget === "" ? null : Number(form.investingBudget),
        donationBudget:
          form.donationBudget === "" ? null : Number(form.donationBudget),
        credit: form.credit === "" ? null : Number(form.credit),
      });

      setIsTracking(true);
      navigate("/dashboard/finance/tracking", { replace: true });
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
    return <FinanceCenteredCard title="Finance" message="Loading…" />;
  }

  if (isTracking) {
    return <FinanceCenteredCard title="Finance" message="Redirecting…" />;
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        {step === "cta" ? (
          <FinanceStartCtaCard error={error} onStart={onStart} />
        ) : (
          <FinanceStartForm
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
}
