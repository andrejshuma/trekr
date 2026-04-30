import React from "react";

export default function FinanceCenteredCard({ title, message }) {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <h1 className="card-title text-2xl">{title}</h1>
            <p className="opacity-80">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

