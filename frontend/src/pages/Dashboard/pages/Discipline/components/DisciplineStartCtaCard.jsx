import React from "react";

export default function DisciplineStartCtaCard({ error, onStart, isSubmitting }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <h1 className="card-title text-2xl">Discipline</h1>
        <p className="opacity-80">
          Start tracking your daily discipline tasks. You can add, edit, and mark
          tasks as completed.
        </p>
        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}
        <div className="mt-4">
          <button
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={onStart}
          >
            {isSubmitting ? "Starting…" : "Start tracking"}
          </button>
        </div>
      </div>
    </div>
  );
}

