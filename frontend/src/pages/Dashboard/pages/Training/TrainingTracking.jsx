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

  const fetchPage = useCallback(async (nextPage) => {
    const resp = await api.get("/training/sessions", {
      params: { page: nextPage, size: pageSize },
    });
    const data = resp?.data ?? {};
    const nextSessions = Array.isArray(data.sessions) ? data.sessions : [];
    const nextHasMore = Boolean(data.hasMore);
    return { nextSessions, nextHasMore };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const { nextSessions, nextHasMore } = await fetchPage(0);
        if (cancelled) return;
        setSessions(nextSessions);
        setHasMore(nextHasMore);
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
  }, [fetchPage]);

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
      <TrainingProgressCard sessions={sessions} />
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
