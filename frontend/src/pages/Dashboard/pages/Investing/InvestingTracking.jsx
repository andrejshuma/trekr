import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";
import { fetchCurrentPricesBySymbol } from "../../../../api/twelveData";

import InvestingTrackingHeader from "./components/InvestingTrackingHeader.jsx";
import InvestingProgressCard from "./components/InvestingProgressCard.jsx";
import InvestingAssetsTable from "./components/InvestingAssetsTable.jsx";

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

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function InvestingTracking() {
  const navigate = useNavigate();
  const pageSize = 5;
  const graphPageSize = 200;

  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState("");

  const [quotesBySymbol, setQuotesBySymbol] = useState({});
  const [isQuotesLoading, setIsQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");

  const columns = useMemo(
    () => [
      { key: "tickerSymbol", label: "Ticker" },
      { key: "quantity", label: "Quantity" },
      { key: "buyPrice", label: "Buy Price" },
      { key: "buyDate", label: "Buy Date" },
      { key: "currentPrice", label: "Current Price" },
      { key: "roi", label: "ROI" },
      { key: "actions", label: "" },
    ],
    [],
  );

  const fetchPage = useCallback(async (nextPage, size = pageSize) => {
    const resp = await api.get("/investing/assets", {
      params: { page: nextPage, size },
    });
    const data = resp?.data ?? {};
    const nextAssets = Array.isArray(data.assets) ? data.assets : [];
    const nextHasMore = Boolean(data.hasMore);
    return { nextAssets, nextHasMore };
  }, []);

  const [graphAssets, setGraphAssets] = useState([]);

  const fetchAllAssetsForGraph = useCallback(async () => {
    let p = 0;
    let hasMorePages = true;
    const all = [];

    while (hasMorePages) {
      const { nextAssets: chunk, nextHasMore } = await fetchPage(p, graphPageSize);
      all.push(...chunk);
      hasMorePages = nextHasMore && chunk.length > 0;
      p += 1;
      if (p > 200) break;
    }

    return all;
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const [tableFirstPage, allForGraph] = await Promise.all([
          fetchPage(0, pageSize),
          fetchAllAssetsForGraph(),
        ]);
        if (cancelled) return;
        setAssets(tableFirstPage.nextAssets);
        setHasMore(tableFirstPage.nextHasMore);
        setGraphAssets(allForGraph);
        setPage(0);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || "Failed to load assets.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAllAssetsForGraph, fetchPage]);

  const tickerSymbols = useMemo(() => {
    const set = new Set();
    for (const a of assets) {
      if (a?.tickerSymbol) set.add(String(a.tickerSymbol).toUpperCase());
    }
    return Array.from(set).sort();
  }, [assets]);

  const tickerSymbolsKey = useMemo(() => tickerSymbols.join(","), [tickerSymbols]);

  useEffect(() => {
    if (tickerSymbols.length === 0) {
      setQuotesBySymbol({});
      setIsQuotesLoading(false);
      setQuotesError("");
      return;
    }

    let cancelled = false;
    let intervalId;

    const fetchQuotes = async () => {
      try {
        setIsQuotesLoading(true);
        setQuotesError("");
        if (cancelled) return;
        const map = await fetchCurrentPricesBySymbol(tickerSymbols);
        if (cancelled) return;
        setQuotesBySymbol(map);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.message ||
          "Could not fetch current prices (check API key / provider availability).";
        setQuotesError(msg);
        // Keep any previously loaded quotes instead of wiping the table.
        // (If this is the first load, quotesBySymbol will already be empty.)
      } finally {
        if (!cancelled) setIsQuotesLoading(false);
      }
    };

    fetchQuotes();
    // Keep refresh infrequent to avoid provider rate limits.
    intervalId = setInterval(fetchQuotes, 5 * 60_000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [tickerSymbolsKey, tickerSymbols]);

  const onLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError("");
      const { nextAssets, nextHasMore } = await fetchPage(nextPage);
      setAssets((prev) => [...prev, ...nextAssets]);
      setHasMore(nextHasMore);
      setPage(nextPage);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load more assets.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const doDelete = async (assetId) => {
    if (!assetId || isDeletingId) return;
    try {
      setIsDeletingId(assetId);
      setError("");
      await api.delete(`/investing/assets/${assetId}`);
      setAssets((prev) => prev.filter((a) => a.assetId !== assetId));
      setPendingDelete(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete asset.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const onRequestDelete = (asset) => {
    if (!asset?.assetId) return;
    setPendingDelete({
      assetId: asset.assetId,
      tickerSymbol: asset.tickerSymbol,
    });
  };

  return (
    <div className="space-y-6">
      <InvestingTrackingHeader
        onAddAsset={() => navigate("/dashboard/investing/assets/new")}
      />
       <InvestingProgressCard assets={graphAssets} quotesBySymbol={quotesBySymbol} />

      {quotesError ? (
        <div className="text-sm opacity-70">
          Prices unavailable: {quotesError}
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">Delete investment?</h3>
            <p className="opacity-80 mt-2">
              This will permanently delete{" "}
              <span className="font-semibold">
                {pendingDelete.tickerSymbol || "this asset"}
              </span>
              .
            </p>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPendingDelete(null)}
                disabled={isDeletingId === pendingDelete.assetId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn bg-red-500! text-white! hover:bg-red-600! border-0"
                onClick={() => doDelete(pendingDelete.assetId)}
                disabled={isDeletingId === pendingDelete.assetId}
              >
                {isDeletingId === pendingDelete.assetId
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close"
            onClick={() => {
              if (isDeletingId === pendingDelete.assetId) return;
              setPendingDelete(null);
            }}
          />
        </div>
      ) : null}

      <InvestingAssetsTable
        columns={columns}
        assets={assets}
        isLoading={isLoading}
        error={error}
        quotesBySymbol={quotesBySymbol}
        isQuotesLoading={isQuotesLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        pageSize={pageSize}
        formatDate={formatDate}
        formatMoney={formatMoney}
        onAddAsset={() => navigate("/dashboard/investing/assets/new")}
        onRequestDelete={onRequestDelete}
        isDeletingId={isDeletingId}
      />
    </div>
  );
}
