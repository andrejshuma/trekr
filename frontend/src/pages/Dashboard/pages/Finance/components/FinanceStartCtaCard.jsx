import React from "react";

export default function FinanceStartCtaCard({ error, onStart }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <h1 className="card-title text-2xl">Finance</h1>
        <p className="opacity-80">
          Start tracking your finances by setting your yearly budget distribution
          percentages.
        </p>
        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}
        <div className="mt-4">
          <button className="btn btn-primary" onClick={onStart}>
            Start tracking
          </button>
        </div>
      </div>
    </div>
  );
}

