import React, { useState } from "react";

export default function NewIncomeForm({ onSubmit, onCancel, error, isSubmitting }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    console.log('Date:', d);
    return d.toISOString().slice(0, 10);
  });
  const [amount, setAmount] = useState("");

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Add income</h2>

        <form
          className="mt-4 grid grid-cols-1 gap-4 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ date, amount });
          }}
        >
          <label className="form-control">
            <div className="label">
              <span className="label-text">Date</span>
            </div>
            <input
              className="input input-bordered"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Amount</span>
            </div>
            <input
              className="input input-bordered"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          {error ? <p className="text-error text-sm">{error}</p> : null}

          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            <button className="btn" type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

