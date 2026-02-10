import React from "react";

export default function InvestingStartCtaCard({
  error,
  onStart,
  isSubmitting,
}) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <h1 className="text-2xl font-bold">Investing</h1>
        <p className="opacity-80">
          You’re not tracking investments yet. Start tracking to log your assets
          and visualize your progress.
        </p>

        {error ? (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-6">
          <button
            type="button"
            className="btn btn-lg w-full bg-green-400! text-black! hover:bg-green-500! border-0"
            onClick={onStart}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting…" : "Start Tracking Investments"}
          </button>
        </div>
      </div>
    </div>
  );
}
