import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

import TrainingTrackingHeader from "./components/TrainingTrackingHeader.jsx";
import TrainingProgressCard from "./components/TrainingProgressCard.jsx";
import TrainingSessionsTable from "./components/TrainingSessionsTable.jsx";

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

function titleCase(value) {
  if (!value) return "—";
  const s = String(value);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TrainingTracking() {
  const navigate = useNavigate();
  const pageSize = 5;
  const graphPageSize = 500;

  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const columns = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "type", label: "Type" },
      { key: "duration", label: "Duration (min)" },
      { key: "calories", label: "Calories" },
    ],
    [],
  );

  const fetchPage = useCallback(async (nextPage, size = pageSize) => {
    const resp = await api.get("/training/sessions", {
      params: { page: nextPage, size },
    });
    const data = resp?.data ?? {};
    const nextSessions = Array.isArray(data.sessions) ? data.sessions : [];
    const nextHasMore = Boolean(data.hasMore);
    return { nextSessions, nextHasMore };
  }, []);

  const fetchAllForGraph = useCallback(async () => {
    let p = 0;
    let hasMorePages = true;
    const all = [];

    while (hasMorePages) {
      const { nextSessions, nextHasMore } = await fetchPage(p, graphPageSize);
      all.push(...nextSessions);
      hasMorePages = nextHasMore && nextSessions.length > 0;
      p += 1;
      // Basic safety to avoid accidental infinite loops if backend misbehaves.
      if (p > 200) break;
    }

    return all;
  }, [fetchPage]);

  const [graphSessions, setGraphSessions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const [tableFirstPage, allForGraph] = await Promise.all([
          fetchPage(0, pageSize),
          fetchAllForGraph(),
        ]);
        if (cancelled) return;
        setSessions(tableFirstPage.nextSessions);
        setHasMore(tableFirstPage.nextHasMore);
        setGraphSessions(allForGraph);
        setPage(0);
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.response?.data?.message || "Failed to load training sessions.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAllForGraph, fetchPage]);

  const onLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError("");
      const { nextSessions, nextHasMore } = await fetchPage(nextPage);
      setSessions((prev) => [...prev, ...nextSessions]);
      setHasMore(nextHasMore);
      setPage(nextPage);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load more sessions.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <TrainingTrackingHeader
        onAddSession={() => navigate("/dashboard/training/sessions/new")}
      />
      <TrainingProgressCard sessions={graphSessions} />
      <TrainingSessionsTable
        columns={columns}
        sessions={sessions}
        isLoading={isLoading}
        error={error}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        pageSize={pageSize}
        formatDate={formatDate}
        titleCase={titleCase}
      />
    </div>
  );
}
