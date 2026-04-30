import React, { useMemo } from "react";
import FinanceLegend from "./FinanceLegend.jsx";
import FinancePieChart from "./FinancePieChart.jsx";

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function FinanceStartForm({ form, setForm, onSubmit, onCancel, error, isSubmitting }) {
  const segments = useMemo(
    () => [
      { key: "spending", label: "Spending", value: toNumber(form.spendingBudget), color: "#22c55e" },
      { key: "saving", label: "Saving", value: toNumber(form.savingBudget), color: "#3b82f6" },
      { key: "investing", label: "Investing", value: toNumber(form.investingBudget), color: "#a855f7" },
      { key: "donation", label: "Donation", value: toNumber(form.donationBudget), color: "#f97316" },
      { key: "credit", label: "Credit", value: toNumber(form.credit), color: "#ef4444" },
    ],
    [form],
  );

  const sum = segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
  const sumOk = Math.abs(sum - 100) <= 0.01;

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body gap-6">
        <div>
          <h2 className="card-title text-xl">Set your budget distribution</h2>
          <p className="text-sm opacity-80">
            Enter 5 percentages that sum to 100. You can fine-tune later.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Spending (%)</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.spendingBudget}
                onChange={onChange("spendingBudget")}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Saving (%)</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.savingBudget}
                onChange={onChange("savingBudget")}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Investing (%)</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.investingBudget}
                onChange={onChange("investingBudget")}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Donation (%)</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.donationBudget}
                onChange={onChange("donationBudget")}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Credit (%)</span>
              </div>
              <input
                className="input input-bordered w-full"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.credit}
                onChange={onChange("credit")}
                required
              />
            </label>

            <div className="text-sm">
              <span className={sumOk ? "text-success" : "text-warning"}>
                Total: {sum.toFixed(2)}%
              </span>
              {!sumOk ? (
                <span className="opacity-70"> (must equal 100%)</span>
              ) : null}
            </div>

            {error ? <p className="text-error text-sm">{error}</p> : null}

            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting || !sumOk}>
                {isSubmitting ? "Saving…" : "Start tracking"}
              </button>
              <button className="btn" type="button" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr] items-center">
            <div className="flex justify-center md:justify-start">
              <FinancePieChart segments={segments} size={200} />
            </div>
            <FinanceLegend segments={segments} />
          </div>
        </form>
      </div>
    </div>
  );
}

