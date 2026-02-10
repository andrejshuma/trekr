import React from "react";

const TrainingTrackingHeader = ({ onAddSession }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="opacity-80 mt-1">Your recent sessions and progress.</p>
      </div>

      <button
        type="button"
        className="btn bg-green-400! text-black! hover:bg-green-500!"
        onClick={onAddSession}
      >
        + Add new training session
      </button>
    </div>
  );
};

export default TrainingTrackingHeader;
