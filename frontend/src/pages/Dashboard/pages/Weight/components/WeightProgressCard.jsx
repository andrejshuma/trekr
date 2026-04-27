import React from "react";

export default function WeightProgressCard({ graphSrc }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Progress</h2>
            <p className="opacity-80">
              Graph placeholder — calorie intake over time will appear here.
            </p>
          </div>
          <span className="badge badge-ghost">Graph placeholder</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl bg-base-300/30 border border-base-300">
          <div className="p-4">
            <img
              src={graphSrc}
              alt="Weight progress graph placeholder"
              className="w-full max-h-64 object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

