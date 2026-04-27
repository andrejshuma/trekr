import React from "react";

export default function WeightTrackingHeader({ onAddIntake, isTodayLogged }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Weight</h1>
        <p className="opacity-80">
          Track your daily calorie intakes and keep an eye on your target.
        </p>
      </div>
      <button
        type="button"
        className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
        onClick={onAddIntake}
        disabled={isTodayLogged}
      >
        {isTodayLogged ? "Today's intake already logged" : "+ Add today's intake"}
      </button>
    </div>
  );
}

