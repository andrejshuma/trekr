import React from "react";

export default function WeightStartCtaCard({ error, onStart, isSubmitting }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body items-center text-center">
        <h1 className="text-4xl font-bold">You are not tracking weight</h1>
        <p className="opacity-80 max-w-xl">
          Start tracking to save your weight profile, calculate your target pace,
          and keep daily calorie intake history.
        </p>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <button
          type="button"
          className="btn btn-lg mt-6 w-full max-w-md bg-green-400! text-black! hover:bg-green-500!"
          onClick={onStart}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting…" : "Start Tracking Weight"}
        </button>
      </div>
    </div>
  );
}

