import React from "react";

const WorkoutTypeSelect = ({ workoutTypes, value, onChange, disabled }) => {
  return (
    <div>
      <label className="label">Workout type</label>
      <select
        className="select select-bordered w-full"
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
      >
        <option value="" disabled>
          Select…
        </option>
        {workoutTypes.map((t) => (
          <option key={t.type} value={t.type}>
            {t.label ?? t.type}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WorkoutTypeSelect;
