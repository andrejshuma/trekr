import React from "react";

export default function InvestingTrackingHeader({ onAddAsset }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Investing</h1>
        <p className="opacity-80">Track your assets over time.</p>
      </div>
      <button
        type="button"
        className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
        onClick={onAddAsset}
      >
        + Add new investment
      </button>
    </div>
  );
}
