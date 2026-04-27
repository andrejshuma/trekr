import React, { useMemo } from "react";
import { MdEdit } from "react-icons/md";

function statValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(2);
  return `${formatted}${suffix}`;
}

export default function WeightSummaryCard({ profile, onEdit, todayTrainingInfo }) {
  const todayCalories = useMemo(() => {
    if (!profile?.goalCalories || !todayTrainingInfo) return null;
    const goal = Number(profile.goalCalories);
    const burned = Number(todayTrainingInfo.totalBurnedCalories) || 0;
    if (!Number.isFinite(goal)) return null;
    return goal + burned;
  }, [profile?.goalCalories, todayTrainingInfo]);

  const stats = [
    { label: "Current weight", value: profile?.weight, suffix: " kg" },
    { label: "Goal weight", value: profile?.goalWeight, suffix: " kg" },
    { label: "Goal calories", value: profile?.goalCalories, suffix: " kcal" },
    todayTrainingInfo?.trainedToday ? 
      { label: "Today's calories", value: todayCalories, suffix: " kcal", subtitle: `(+${statValue(todayTrainingInfo.totalBurnedCalories)} burned)` } 
      : null,
  ].filter(Boolean);

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Profile summary</h2>
            <p className="opacity-80">
              Your current target and calorie plan at a glance.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-ghost text-blue-400 hover:text-blue-300"
            title="Edit profile"
            onClick={onEdit}
          >
            <MdEdit className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat bg-base-100 rounded-box border border-base-300">
              <div className="stat-title text-xs">{stat.label}</div>
              <div className="stat-value text-lg">{statValue(stat.value, stat.suffix)}</div>
              {stat.subtitle && <div className="stat-desc text-xs">{stat.subtitle}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

