const BASE_URL =
  import.meta.env.VITE_TWELVE_DATA_BASE_URL ?? "https://api.twelvedata.com";

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY ?? "";

const CACHE_TTL_MS = 5 * 60_000;
const MAX_SYMBOLS_PER_REQUEST = 20;

// Cache by Twelve Data symbol (normalized)
const priceCache = new Map();
const inFlight = new Map();

function getCachedPrice(twelveSymbol) {
  const item = priceCache.get(twelveSymbol);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) return null;
  return item.price;
}

function setCachedPrice(twelveSymbol, price) {
  if (!twelveSymbol || typeof price !== "number" || !Number.isFinite(price)) return;
  priceCache.set(twelveSymbol, { price, ts: Date.now() });
}

function parsePriceJson(json, requestedSymbols) {
  const out = {};
  if (!json || typeof json !== "object" || Array.isArray(json)) return out;

  // Single symbol response
  if (json.price !== undefined && requestedSymbols.length === 1) {
    const n = Number(json.price);
    if (Number.isFinite(n)) out[requestedSymbols[0]] = n;
    return out;
  }

  // Multi symbol response: object keyed by symbol
  for (const sym of requestedSymbols) {
    const n = Number(json?.[sym]?.price);
    if (Number.isFinite(n)) out[sym] = n;
  }

  return out;
}

async function fetchBatchPrices(twelveSymbols) {
  const params = new URLSearchParams();
  params.set("symbol", twelveSymbols.join(","));
  params.set("apikey", API_KEY);

  const url = `${BASE_URL}/price?${params.toString()}`;
  const resp = await fetch(url, { method: "GET" });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Twelve Data request failed (HTTP ${resp.status}) ${text}`);
  }

  const json = await resp.json();
  if (json?.status === "error") {
    throw new Error(String(json?.message ?? "Twelve Data error"));
  }

  return parsePriceJson(json, twelveSymbols);
}

async function fetchSinglePrice(twelveSymbol) {
  const cached = getCachedPrice(twelveSymbol);
  if (typeof cached === "number") return cached;

  if (inFlight.has(twelveSymbol)) return inFlight.get(twelveSymbol);

  const p = (async () => {
    const params = new URLSearchParams();
    params.set("symbol", twelveSymbol);
    params.set("apikey", API_KEY);
    const url = `${BASE_URL}/price?${params.toString()}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Twelve Data request failed (HTTP ${resp.status}) ${text}`);
    }
    const json = await resp.json();
    if (json?.status === "error") {
      throw new Error(String(json?.message ?? "Twelve Data error"));
    }
    const n = Number(json?.price);
    if (!Number.isFinite(n)) throw new Error("Twelve Data returned no price");
    setCachedPrice(twelveSymbol, n);
    return n;
  })();

  inFlight.set(twelveSymbol, p);
  try {
    return await p;
  } finally {
    inFlight.delete(twelveSymbol);
  }
}

async function fetchSingleExchangeRate(pairSymbol) {
  const cached = getCachedPrice(pairSymbol);
  if (typeof cached === "number") return cached;

  if (inFlight.has(pairSymbol)) return inFlight.get(pairSymbol);

  const p = (async () => {
    const params = new URLSearchParams();
    params.set("symbol", pairSymbol);
    params.set("apikey", API_KEY);
    const url = `${BASE_URL}/exchange_rate?${params.toString()}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Twelve Data request failed (HTTP ${resp.status}) ${text}`);
    }
    const json = await resp.json();
    if (json?.status === "error") {
      throw new Error(String(json?.message ?? "Twelve Data error"));
    }

    const n = Number(json?.rate);
    if (!Number.isFinite(n)) throw new Error("Twelve Data returned no rate");
    setCachedPrice(pairSymbol, n);
    return n;
  })();

  inFlight.set(pairSymbol, p);
  try {
    return await p;
  } finally {
    inFlight.delete(pairSymbol);
  }
}

export function toTwelveSymbol(symbol) {
  if (!symbol) return "";
  const s = String(symbol).trim().toUpperCase();
  if (!s) return "";

  // Already Twelve format (common for FX/crypto)
  if (s.includes("/")) return s;

  // Common Yahoo-style crypto tickers
  const cryptoMap = {
    "BTC-USD": "BTC/USD",
    "ETH-USD": "ETH/USD",
    "SOL-USD": "SOL/USD",
    "BNB-USD": "BNB/USD",
    "XRP-USD": "XRP/USD",
    "ADA-USD": "ADA/USD",
    "DOGE-USD": "DOGE/USD",
    "AVAX-USD": "AVAX/USD",
    "DOT-USD": "DOT/USD",
    "LINK-USD": "LINK/USD",
    "MATIC-USD": "MATIC/USD",
    "LTC-USD": "LTC/USD",
  };

  if (cryptoMap[s]) return cryptoMap[s];

  // Default: assume it's a stock/ETF symbol (AAPL, SPY, BRK-B, ...)
  return s;
}

/**
 * Fetch current prices for one or more symbols.
 * Returns an object keyed by *original input symbols* (uppercased), with numeric prices.
 */
export async function fetchCurrentPricesBySymbol(symbols) {
  const input = Array.isArray(symbols) ? symbols : [];
  const uniqueOriginal = Array.from(
    new Set(input.map((s) => String(s ?? "").trim()).filter(Boolean)),
  );

  if (uniqueOriginal.length === 0) return {};

  if (!API_KEY) {
    throw new Error(
      "Missing Twelve Data API key (set VITE_TWELVE_DATA_API_KEY in frontend/.env.local)",
    );
  }

  // Map original -> twelve
  const originalToTwelve = new Map();
  for (const orig of uniqueOriginal) {
    originalToTwelve.set(orig, toTwelveSymbol(orig));
  }

  const allTwelveSymbols = Array.from(
    new Set(Array.from(originalToTwelve.values()).filter(Boolean)),
  );

  const pairSymbols = allTwelveSymbols.filter((s) => String(s).includes("/"));
  const priceSymbols = allTwelveSymbols.filter((s) => !String(s).includes("/"));

  // Gather prices with cache + resilient fetch (batch first, fall back to per-symbol)
  const twelvePrices = {};
  const missing = [];
  let hadAnyError = false;
  let lastErrorMessage = "";

  for (const sym of allTwelveSymbols) {
    const cached = getCachedPrice(sym);
    if (typeof cached === "number") {
      twelvePrices[sym] = cached;
    } else {
      missing.push(sym);
    }
  }

  // Fetch pair symbols via exchange_rate (generally the most reliable for FX/crypto pairs)
  for (const sym of pairSymbols) {
    if (twelvePrices[sym] !== undefined) continue;
    try {
      const n = await fetchSingleExchangeRate(sym);
      if (Number.isFinite(n)) twelvePrices[sym] = n;
    } catch (e) {
      hadAnyError = true;
      lastErrorMessage = e?.message || lastErrorMessage;
    }
  }

  // Chunk batch requests to avoid overly long URLs; if a batch fails, we continue
  // with per-symbol fetches so one invalid symbol doesn't break everything.
  const missingPrices = missing.filter((s) => priceSymbols.includes(s));

  for (let i = 0; i < missingPrices.length; i += MAX_SYMBOLS_PER_REQUEST) {
    const chunk = missingPrices.slice(i, i + MAX_SYMBOLS_PER_REQUEST);
    try {
      const got = await fetchBatchPrices(chunk);
      for (const [sym, price] of Object.entries(got)) {
        const n = Number(price);
        if (Number.isFinite(n)) {
          twelvePrices[sym] = n;
          setCachedPrice(sym, n);
        }
      }

      // Some symbols might not come back in a multi-symbol response; fetch them individually.
      for (const sym of chunk) {
        if (twelvePrices[sym] !== undefined) continue;
        try {
          const n = await fetchSinglePrice(sym);
          if (Number.isFinite(n)) twelvePrices[sym] = n;
        } catch (e) {
          // ignore single-symbol failures
          hadAnyError = true;
          lastErrorMessage = e?.message || lastErrorMessage;
        }
      }
    } catch (e) {
      // Fall back to per-symbol if the whole batch failed.
      hadAnyError = true;
      lastErrorMessage = e?.message || lastErrorMessage;
      await Promise.all(
        chunk.map(async (sym) => {
          try {
            const n = await fetchSinglePrice(sym);
            if (Number.isFinite(n)) twelvePrices[sym] = n;
          } catch (e2) {
            // ignore
            hadAnyError = true;
            lastErrorMessage = e2?.message || lastErrorMessage;
          }
        }),
      );
    }
  }

  // Convert back to original symbols
  const out = {};
  for (const [orig, twelve] of originalToTwelve.entries()) {
    const p = twelvePrices[twelve];
    if (typeof p === "number") {
      out[String(orig).toUpperCase()] = p;
    }
  }

  if (Object.keys(out).length === 0 && hadAnyError) {
    throw new Error(lastErrorMessage || "Could not fetch any current prices");
  }

  return out;
}
