import React from "react";

export default function WeightCenteredCard({ title, message }) {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="card bg-base-200 border border-base-300 w-full max-w-2xl">
        <div className="card-body items-center text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="opacity-80">{message}</p>
        </div>
      </div>
    </div>
  );
}

