import React from "react";

const TrainingProgressCard = ({ graphSrc }) => {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="card-title">Progress</h2>
          <span className="badge badge-ghost">Graph placeholder</span>
        </div>
        <div className="mt-4 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100">
          <img
            src={graphSrc}
            alt="Training progress graph placeholder"
            className="block h-65 w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingProgressCard;
