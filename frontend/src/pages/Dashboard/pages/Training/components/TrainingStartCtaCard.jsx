import React from "react";

const TrainingStartCtaCard = ({ error, onStart }) => {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body items-center text-center">
        <h1 className="text-4xl font-bold">You are not tracking training</h1>
        <p className="opacity-80 max-w-xl">
          Start tracking to log sessions, see trends, and build consistency.
        </p>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <button
          type="button"
          className="btn btn-lg mt-6 w-full max-w-md bg-green-400! text-black! hover:bg-green-500!"
          onClick={onStart}
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
};

export default TrainingStartCtaCard;
