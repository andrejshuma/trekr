import React from "react";

const TrainingSessionsTable = ({
  columns,
  sessions,
  isLoading,
  error,
  isLoadingMore,
  hasMore,
  onLoadMore,
  pageSize,
  formatDate,
  titleCase,
}) => {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="card-title">Recent sessions</h2>
          <span className="badge badge-ghost">Showing up to {pageSize}</span>
        </div>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <span className="opacity-80">Loading…</span>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <span className="opacity-80">No sessions yet.</span>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={
                      s.trainingId ??
                      `${s.date}-${s.type}-${s.duration}-${s.calories}`
                    }
                  >
                    <td>{formatDate(s.date)}</td>
                    <td>{titleCase(s.type)}</td>
                    <td>{s.duration ?? "—"}</td>
                    <td>{s.calories ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onLoadMore}
            disabled={isLoading || isLoadingMore || !hasMore}
          >
            {isLoadingMore ? "Loading…" : hasMore ? "Load more" : "No more"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingSessionsTable;
