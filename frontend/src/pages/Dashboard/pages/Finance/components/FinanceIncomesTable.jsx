import React from "react";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function FinanceIncomesTable({
  incomes,
  isLoading,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onAddIncome,
}) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-3">
          <h2 className="card-title">Incomes</h2>
          <button className="btn btn-primary btn-sm" onClick={onAddIncome}>
            Add income
          </button>
        </div>

        {error ? <p className="text-error text-sm mt-2">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="opacity-70">
                    Loading…
                  </td>
                </tr>
              ) : (incomes ?? []).length === 0 ? (
                <tr>
                  <td colSpan={2} className="opacity-70">
                    No incomes yet.
                  </td>
                </tr>
              ) : (
                (incomes ?? []).map((i) => (
                  <tr key={i.incomeId}>
                    <td>{formatDate(i.date)}</td>
                    <td className="text-right tabular-nums">{Number(i.amount).toFixed?.(2) ?? i.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          {hasMore ? (
            <button className="btn btn-outline btn-sm" disabled={isLoadingMore} onClick={onLoadMore}>
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

