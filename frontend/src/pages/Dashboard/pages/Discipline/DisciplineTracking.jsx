import React, { useCallback, useEffect, useMemo, useState } from "react";
import graphPlaceholder from "../../../../assets/graph-placeholder.svg";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskFinished,
} from "../../../../api/discipline";

import {
  computeDailyCompletion,
  getDailyCompletions,
} from "../../../../api/dailyCompletion";

import TaskList from "./components/TaskList.jsx";

export default function DisciplineTracking() {
  const pageSize = 50;
  const completionPageSize = 14;

  const todayIso = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [completionInfo, setCompletionInfo] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const [workingTaskIds, setWorkingTaskIds] = useState([]);

  const [dailyCompletions, setDailyCompletions] = useState([]);
  const [completionPage, setCompletionPage] = useState(0);
  const [completionHasMore, setCompletionHasMore] = useState(false);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(true);
  const [isLoadingMoreCompletions, setIsLoadingMoreCompletions] = useState(false);
  const [completionError, setCompletionError] = useState("");

  const workingSet = useMemo(
    () => new Set(workingTaskIds),
    [workingTaskIds],
  );

  const fetchPage = useCallback(async (nextPage) => {
    const data = await getTasks({ page: nextPage, size: pageSize });
    return {
      nextTasks: Array.isArray(data?.tasks) ? data.tasks : [],
      nextHasMore: Boolean(data?.hasMore),
    };
  }, []);

  const fetchCompletionsPage = useCallback(async (nextPage) => {
    const data = await getDailyCompletions({
      page: nextPage,
      size: completionPageSize,
    });
    return {
      nextCompletions: Array.isArray(data?.completions) ? data.completions : [],
      nextHasMore: Boolean(data?.hasMore),
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const { nextTasks, nextHasMore } = await fetchPage(0);
        if (cancelled) return;
        setTasks(nextTasks);
        setHasMore(nextHasMore);
        setPage(0);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || "Failed to load tasks.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoadingCompletions(true);
        setCompletionError("");
        const { nextCompletions, nextHasMore } = await fetchCompletionsPage(0);
        if (cancelled) return;
        setDailyCompletions(nextCompletions);
        setCompletionHasMore(nextHasMore);
        setCompletionPage(0);
      } catch (e) {
        if (cancelled) return;
        setCompletionError(
          e?.response?.data?.message ||
            "Failed to load daily completion history.",
        );
      } finally {
        if (!cancelled) setIsLoadingCompletions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchCompletionsPage]);

  const onLoadMoreCompletions = async () => {
    if (isLoadingMoreCompletions || !completionHasMore) return;
    const nextPage = completionPage + 1;
    try {
      setIsLoadingMoreCompletions(true);
      setCompletionError("");
      const { nextCompletions, nextHasMore } =
        await fetchCompletionsPage(nextPage);
      setDailyCompletions((prev) => [...prev, ...nextCompletions]);
      setCompletionHasMore(nextHasMore);
      setCompletionPage(nextPage);
    } catch (e) {
      setCompletionError(
        e?.response?.data?.message || "Failed to load more completions.",
      );
    } finally {
      setIsLoadingMoreCompletions(false);
    }
  };

  const onLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError("");
      const { nextTasks, nextHasMore } = await fetchPage(nextPage);
      setTasks((prev) => [...prev, ...nextTasks]);
      setHasMore(nextHasMore);
      setPage(nextPage);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load more tasks.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const withWorking = async (taskId, fn) => {
    setWorkingTaskIds((prev) => [...prev, taskId]);
    try {
      await fn();
    } finally {
      setWorkingTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const onAdd = async (name) => {
    setError("");
    try {
      const created = await createTask({ name });
      setTasks((prev) => [created, ...prev]);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create task.");
    }
  };

  const onDelete = async (taskId) => {
    setError("");
    await withWorking(taskId, async () => {
      try {
        await deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to delete task.");
      }
    });
  };

  const onToggleFinished = async (taskId, isFinished) => {
    if (workingSet.has(taskId)) return;
    setError("");

    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, isFinished } : t)),
    );

    await withWorking(taskId, async () => {
      try {
        const updated = await updateTaskFinished(taskId, isFinished);
        setTasks((prev) =>
          prev.map((t) => (t.taskId === taskId ? updated : t)),
        );
      } catch (e) {
        // revert
        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === taskId ? { ...t, isFinished: !isFinished } : t,
          ),
        );
        setError(e?.response?.data?.message || "Failed to update task.");
      }
    });
  };

  const onRename = async (taskId, name) => {
    setError("");
    await withWorking(taskId, async () => {
      try {
        const updated = await updateTask(taskId, { name });
        setTasks((prev) =>
          prev.map((t) => (t.taskId === taskId ? updated : t)),
        );
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to update task.");
      }
    });
  };

  const onComputeToday = async () => {
    setError("");
    setCompletionInfo(null);
    setIsComputing(true);
    try {
      const result = await computeDailyCompletion();
      setCompletionInfo(result?.completion ?? null);

      // refresh daily completion history
      try {
        const { nextCompletions, nextHasMore } = await fetchCompletionsPage(0);
        setDailyCompletions(nextCompletions);
        setCompletionHasMore(nextHasMore);
        setCompletionPage(0);
      } catch {
        // ignore
      }

      // refresh tasks as backend will reset finished -> false
      const { nextTasks, nextHasMore } = await fetchPage(0);
      setTasks(nextTasks);
      setHasMore(nextHasMore);
      setPage(0);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Failed to compute daily completion.",
      );
    } finally {
      setIsComputing(false);
    }
  };

  const isTodayClosed = useMemo(() => {
    return (dailyCompletions ?? []).some((dc) => dc?.date === todayIso);
  }, [dailyCompletions, todayIso]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Discipline</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={onComputeToday}
          disabled={isComputing || isTodayClosed}
          title="Compute today's completion and reset tasks for the next day"
        >
          {isTodayClosed ? "Day closed" : isComputing ? "Computing…" : "Close day"}
        </button>
      </div>

      {completionInfo ? (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Daily completion saved</h2>
            <p className="text-sm opacity-80">
              Date: {completionInfo.date} — Completion: {completionInfo.procent}%
            </p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <p className="opacity-80">Loading tasks…</p>
          </div>
        </div>
      ) : (
        <>
          <TaskList
            tasks={tasks}
            onAdd={onAdd}
            onDelete={onDelete}
            onToggleFinished={onToggleFinished}
            onRename={onRename}
            isWorkingTaskIds={workingTaskIds}
          />

          {error ? <p className="text-error text-sm">{error}</p> : null}

          {hasMore ? (
            <button
              className="btn btn-outline btn-sm"
              disabled={isLoadingMore}
              onClick={onLoadMore}
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          ) : null}

          <div className="card bg-base-200 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Progress</h2>
              <p className="text-sm opacity-80">(Placeholder graph for now)</p>
              <div className="mt-4">
                <img
                  src={graphPlaceholder}
                  alt="Discipline graph placeholder"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Daily completion</h2>
              <p className="text-sm opacity-80">
                Previous days completion percentages.
              </p>

              {completionError ? (
                <p className="text-error text-sm mt-2">{completionError}</p>
              ) : null}

              <div className="mt-4 overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCompletions ? (
                      <tr>
                        <td colSpan={2} className="opacity-70">
                          Loading…
                        </td>
                      </tr>
                    ) : (dailyCompletions ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="opacity-70">
                          No daily completion records yet. Click “Close day” to
                          save today.
                        </td>
                      </tr>
                    ) : (
                      (dailyCompletions ?? []).map((dc) => (
                        <tr key={dc.dailyCompletionId}>
                          <td>{dc.date ?? "—"}</td>
                          <td className="text-right tabular-nums">
                            {dc.procent ?? 0}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                {completionHasMore ? (
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={isLoadingMoreCompletions}
                    onClick={onLoadMoreCompletions}
                  >
                    {isLoadingMoreCompletions ? "Loading…" : "Load more"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

