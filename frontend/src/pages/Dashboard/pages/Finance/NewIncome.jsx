import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createIncome } from "../../../../api/finance";
import NewIncomeForm from "./components/NewIncomeForm.jsx";

export default function NewIncome() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async ({ date, amount }) => {
    setError("");
    setIsSubmitting(true);
    try {
      await createIncome({
        date,
        amount: amount === "" ? null : Number(amount),
      });
      navigate("/dashboard/finance/tracking", { replace: true });
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        Object.values(e?.response?.data?.errors ?? {})[0] ||
        "Failed to add income";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finance</h1>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <NewIncomeForm
        onSubmit={onSubmit}
        onCancel={() => navigate("/dashboard/finance/tracking")}
        error={error}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

