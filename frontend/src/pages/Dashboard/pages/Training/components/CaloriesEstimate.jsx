import React from "react";

const CaloriesEstimate = ({ estimatedCalories, profileWeightKg }) => {
  return (
    <div className="mt-2">
      {estimatedCalories === null ? (
        <p className="text-xs opacity-70">
          Estimated calories: —
          {profileWeightKg === null ? " (missing profile weight)" : ""}
        </p>
      ) : (
        <p className="text-xs opacity-80">
          Estimated calories:{" "}
          <span className="font-semibold">{estimatedCalories}</span> kcal
        </p>
      )}
    </div>
  );
};

export default CaloriesEstimate;
