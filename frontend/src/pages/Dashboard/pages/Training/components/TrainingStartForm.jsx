import React from "react";

const TrainingStartForm = ({
  form,
  setForm,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="card bg-base-200 border border-base-300"
    >
      <div className="card-body items-center text-center">
        <h1 className="text-3xl font-bold">Start tracking training</h1>
        <p className="opacity-80 max-w-xl">
          Fill in a few details to set up your training profile.
        </p>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">Gender</label>
            <select
              className="select select-bordered w-full"
              value={form.gender}
              onChange={(e) =>
                setForm((p) => ({ ...p, gender: e.target.value }))
              }
              required
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Age</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.age}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              min={1}
              max={120}
              required
            />
          </div>

          <div>
            <label className="label">Weight (kg)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={form.weight}
              onChange={(e) =>
                setForm((p) => ({ ...p, weight: e.target.value }))
              }
              min={1}
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            className="btn btn-lg w-full sm:w-auto bg-green-400! text-black! hover:bg-green-500!"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting…" : "Start Tracking"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default TrainingStartForm;
