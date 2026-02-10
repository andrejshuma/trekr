import React from "react";

export default function InvestingProgressCard({ graphSrc }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Progress</h2>
            <p className="opacity-80">
              Graph placeholder — we’ll visualize portfolio value here.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl bg-base-300/30 border border-base-300">
          <div className="p-4">
            <img
              src={graphSrc}
              alt="Graph placeholder"
              className="w-full max-h-64 object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
