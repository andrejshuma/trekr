import React from "react";

export default function InvestingCenteredCard({ title, message }) {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="opacity-80">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
