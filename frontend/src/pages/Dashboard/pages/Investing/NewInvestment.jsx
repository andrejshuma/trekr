import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../../api/axios";
import { searchTickers } from "../../../../api/yahooFinance";

export default function NewInvestment() {
  const navigate = useNavigate();

  const todayIso = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const initialForm = useMemo(
    () => ({ tickerSymbol: "", quantity: "", buyPrice: "", buyDate: "" }),
    [],
  );

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tickerQuery, setTickerQuery] = useState("");
  const [tickerOptions, setTickerOptions] = useState([]);
  const [isLoadingTickers, setIsLoadingTickers] = useState(false);

  useEffect(() => {
    const q = tickerQuery.trim();
    if (q.length < 2) {
      setTickerOptions([]);
      setIsLoadingTickers(false);
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setIsLoadingTickers(true);
        if (cancelled) return;
        const data = await searchTickers(q, 20);
        if (cancelled) return;
        setTickerOptions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setTickerOptions([]);
      } finally {
        if (!cancelled) setIsLoadingTickers(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [tickerQuery]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.tickerSymbol) {
      setError("Please select a ticker symbol");
      return;
    }

    if (form.buyDate && form.buyDate > todayIso) {
      setError("Buy date cannot be in the future");
      return;
    }

    const quantityNum = form.quantity === "" ? null : Number(form.quantity);
    if (!quantityNum || Number.isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    const buyPriceNum = form.buyPrice === "" ? null : Number(form.buyPrice);
    if (
      buyPriceNum !== null &&
      (Number.isNaN(buyPriceNum) || buyPriceNum < 0)
    ) {
      setError("Buy price must be 0 or greater");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/investing/assets", {
        tickerSymbol: form.tickerSymbol,
        quantity: quantityNum,
        buyPrice: buyPriceNum,
        buyDate: form.buyDate === "" ? null : form.buyDate,
      });

      navigate("/dashboard/investing/tracking", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors ?? {})[0] ||
        "Failed to add investment";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h1 className="text-2xl font-bold">Add new investment</h1>
          <p className="opacity-80">
            Add an asset you bought. (We’ll build performance tracking next.)
          </p>

          {error ? (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Ticker symbol</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="input input-bordered w-full"
                  placeholder="Search (e.g. AAPL, TSLA, NVDA)"
                  value={tickerQuery}
                  onChange={(e) => setTickerQuery(e.target.value)}
                />
                <select
                  className="select select-bordered w-full"
                  value={form.tickerSymbol}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tickerSymbol: e.target.value }))
                  }
                  required
                >
                  <option value="" disabled>
                    {isLoadingTickers
                      ? "Loading tickers…"
                      : tickerOptions.length
                        ? "Select a ticker"
                        : "Search to load tickers"}
                  </option>
                  {tickerOptions.map((o) => {
                    const symbol = o?.symbol ?? "";
                    const name = o?.name ?? "";
                    const exchange = o?.exchange ?? "";
                    const label = [
                      symbol,
                      name ? `— ${name}` : "",
                      exchange ? `(${exchange})` : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <option key={symbol} value={symbol}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <p className="text-xs opacity-70 mt-2">
                Only tickers returned by Yahoo Finance can be selected.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input input-bordered w-full"
                  placeholder="10"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Buy price (optional)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input input-bordered w-full"
                  placeholder="187.20"
                  value={form.buyPrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, buyPrice: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Buy date (optional)</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.buyDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, buyDate: e.target.value }))
                }
                max={todayIso}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/dashboard/investing/tracking")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-green-400! text-black! hover:bg-green-500! border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving…" : "Save investment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
