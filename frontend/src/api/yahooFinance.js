import { LOCAL_TICKER_SYMBOLS } from "../data/tickers";

const tickerSearchCache = new Map();
const TICKER_CACHE_TTL_MS = 15 * 60 * 1000;

const quoteCache = new Map();
const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000;
let quoteBackoffUntilMs = 0;

async function tryFetchJson(url) {
  // Note: We intentionally do NOT set custom headers here.
  // Custom headers usually trigger a CORS preflight which Yahoo won't allow.
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Yahoo Finance HTTP ${resp.status}`);
  }
  return resp.json();
}

function toTickerOption(raw) {
  const symbol = raw?.symbol ? String(raw.symbol) : "";
  if (!symbol) return null;

  const name = raw?.shortname || raw?.longname || raw?.name || "";
  const exchange = raw?.exchDisp || raw?.exchange || "";

  return {
    symbol,
    name: name ? String(name) : "",
    exchange: exchange ? String(exchange) : "",
    quoteType: raw?.quoteType ? String(raw.quoteType) : "",
  };
}

/**
 * Direct Yahoo Finance search (yfinance data source).
 * Falls back to backend proxy if the browser blocks CORS.
 */
export async function searchTickers(query, limit = 20) {
  const q = String(query ?? "").trim();
  if (!q) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 25));

  const cacheKey = `${q.toUpperCase()}:${safeLimit}`;
  const cached = tickerSearchCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Offline/local ticker search: avoids Yahoo 429s and keeps the dropdown reliable.
  const upperQ = q.toUpperCase();
  const symbols = Array.isArray(LOCAL_TICKER_SYMBOLS) ? LOCAL_TICKER_SYMBOLS : [];
  const out = symbols
    .map((s) => String(s ?? "").trim())
    .filter(Boolean)
    .filter((s) => s.toUpperCase().includes(upperQ))
    .slice(0, safeLimit)
    .map((symbol) => ({ symbol, name: "", exchange: "" }));

  tickerSearchCache.set(cacheKey, {
    value: out,
    expiresAt: now + TICKER_CACHE_TTL_MS,
  });
  return out;
}

/**
 * Direct Yahoo Finance quotes (yfinance data source).
 * Returns a map { SYMBOL: priceNumber }.
 * Falls back to backend proxy if the browser blocks CORS.
 */
export async function getQuotesBySymbol(symbols) {
  const list = Array.isArray(symbols) ? symbols : [];
  const unique = Array.from(
    new Set(
      list
        .map((s) => String(s ?? "").trim())
        .filter(Boolean)
        .map((s) => s.toUpperCase()),
    ),
  );

  if (unique.length === 0) return {};

  const parseYahoo = (json) => {
    const results = Array.isArray(json?.quoteResponse?.result)
      ? json.quoteResponse.result
      : [];
    const map = {};
    for (const r of results) {
      const sym = r?.symbol ? String(r.symbol).toUpperCase() : "";
      const price = r?.regularMarketPrice;
      if (!sym) continue;
      if (typeof price !== "number") continue;
      map[sym] = price;
    }
    return map;
  };

  const now = Date.now();
  const out = {};

  // Serve cache first.
  const toFetch = [];
  for (const sym of unique) {
    const cached = quoteCache.get(sym);
    if (cached && cached.expiresAt > now && typeof cached.price === "number") {
      out[sym] = cached.price;
    } else {
      toFetch.push(sym);
    }
  }

  // Production builds: browser CORS blocks Yahoo, so quotes are unavailable without a proxy.
  if (!import.meta.env.DEV) {
    return out;
  }

  // Backoff after 429s.
  if (now < quoteBackoffUntilMs) {
    return out;
  }

  if (toFetch.length === 0) {
    return out;
  }

  const yahooUrl = `/yahoo/v7/finance/quote?symbols=${encodeURIComponent(
    toFetch.join(","),
  )}`;

  try {
    const json = await tryFetchJson(yahooUrl);
    const fresh = parseYahoo(json);
    for (const [sym, price] of Object.entries(fresh)) {
      quoteCache.set(sym, { price, expiresAt: Date.now() + QUOTE_CACHE_TTL_MS });
      out[sym] = price;
    }
    return out;
  } catch (e) {
    const msg = String(e?.message ?? "");
    if (msg.includes("HTTP 429")) {
      quoteBackoffUntilMs = Date.now() + 60_000;
    }
    return out;
  }
}
