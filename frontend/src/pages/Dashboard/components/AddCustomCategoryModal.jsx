import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function AddCustomCategoryModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset the form whenever the modal is opened.
  // NOTE: Hooks must be called in the same order on every render; do not early-return before hooks.
  useEffect(() => {
    if (!open) return;
    setName("");
    setError(null);
    setSubmitting(false);
  }, [open]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && name.trim().length <= 100 && !submitting;
  }, [name, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim() });
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create custom category"
      );
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-xl bg-neutral-900 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Add Custom Category</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-white/80">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-green-400"
              placeholder="e.g. My Habit Tracking"
            />
            <div className="mt-1 text-xs text-white/50">
              {name.trim().length}/100
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-green-400 px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}



