import React from "react";

export default function TimeRangeToggle({ value, onChange }) {
  const TIME_RANGES = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <div className="join">
      {TIME_RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          className={
            "btn btn-xs join-item " +
            (value === r.key ? "btn-success" : "btn-ghost")
          }
          onClick={() => onChange?.(r.key)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}


