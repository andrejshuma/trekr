import React from "react";
import { MdDelete } from "react-icons/md";

export default function InvestingAssetsTable({
  columns,
  assets,
  isLoading,
  error,
  quotesBySymbol,
  isQuotesLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  pageSize,
  formatDate,
  formatMoney,
  onAddAsset,
  onRequestDelete,
  onDelete,
  isDeletingId,
}) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Assets</h2>
          <span className="text-sm opacity-70">
            Showing {pageSize} per page
          </span>
        </div>

        {error ? (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table">
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
                  <td colSpan={columns.length} className="opacity-70">
                    Loading…
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-10">
                    <div className="flex flex-col items-center text-center gap-3">
                      <p className="opacity-80">No investments yet.</p>
                      <button
                        type="button"
                        className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
                        onClick={onAddAsset}
                      >
                        Add your first investment
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.assetId}>
                    <td className="font-semibold">{a.tickerSymbol ?? "—"}</td>
                    <td>{a.quantity ?? "—"}</td>
                    <td>{formatMoney(a.buyPrice)}</td>
                    <td>{formatDate(a.buyDate)}</td>
                    <td>
                      {isQuotesLoading
                        ? "Loading…"
                        : formatMoney(
                            quotesBySymbol?.[
                              String(a.tickerSymbol ?? "").toUpperCase()
                            ],
                          )}
                    </td>
                    <td>
                      {(() => {
                        const symbol = String(
                          a.tickerSymbol ?? "",
                        ).toUpperCase();
                        const current = Number(quotesBySymbol?.[symbol]);
                        const buy = Number(a.buyPrice);
                        if (!symbol || Number.isNaN(current)) return "—";
                        if (Number.isNaN(buy) || buy <= 0) return "—";
                        const roiPct = ((current - buy) / buy) * 100;
                        const cls =
                          roiPct > 0
                            ? "text-green-400 font-semibold"
                            : roiPct < 0
                              ? "text-red-400 font-semibold"
                              : "opacity-80";
                        const sign = roiPct > 0 ? "+" : "";
                        return (
                          <span className={cls}>
                            {sign}
                            {roiPct.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                        title="Delete"
                        onClick={() => {
                          if (onRequestDelete) {
                            onRequestDelete(a);
                            return;
                          }
                          onDelete?.(a.assetId);
                        }}
                        disabled={isDeletingId === a.assetId}
                      >
                        <MdDelete className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          {!isLoading && assets.length === 0 ? null : hasMore ? (
            <button
              type="button"
              className="btn"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          ) : (
            <span className="text-sm opacity-70">No more assets.</span>
          )}
        </div>
      </div>
    </div>
  );
}
