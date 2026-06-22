import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  createCustomCategoryTask,
  deleteCustomCategoryTask,
  getCustomCategoryTasks,
  getCustomTrackingCategories,
  updateCustomCategoryTask,
  updateCustomCategoryTaskStatus,
} from "../../../../api/discipline.js";

import CustomCategoryKanbanBoard from "./components/CustomCategoryKanbanBoard";

export default function CustomCategoryKanban() {
  const params = useParams();
  const customTrackingId = Number(params.customTrackingId);

  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("Custom Category");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  const lanes = useMemo(() => {
    const all = tasks ?? [];
    return {
      notStarted: all.filter((t) => t.status === "NOT_STARTED"),
      inProgress: all.filter((t) => t.status === "IN_PROGRESS"),
      finished: all.filter((t) => t.status === "FINISHED"),
    };
  }, [tasks]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, tasksRes] = await Promise.all([
        getCustomTrackingCategories(),
        getCustomCategoryTasks(customTrackingId),
      ]);
      const cats = catsRes?.items ?? [];
      const found = cats.find((c) => Number(c.customTrackingId) === customTrackingId);
      setCategoryName(found?.name ?? "Custom Category");
      setTasks(tasksRes?.tasks ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load category");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(customTrackingId)) {
      setLoading(false);
      setError("Invalid category id");
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customTrackingId]);

  async function handleAddTask(payload) {
    const created = await createCustomCategoryTask(customTrackingId, payload);
    setTasks((prev) => [created, ...(prev ?? [])]);
  }

  async function handleEditTask(taskId, payload) {
    const updated = await updateCustomCategoryTask(customTrackingId, taskId, payload);
    setTasks((prev) => (prev ?? []).map((t) => (t.taskId === taskId ? updated : t)));
  }

  async function handleDeleteTask(taskId) {
    await deleteCustomCategoryTask(customTrackingId, taskId);
    setTasks((prev) => (prev ?? []).filter((t) => t.taskId !== taskId));
  }

  async function handleMoveTask(taskId, toStatus) {
    setTasks((prev) =>
      (prev ?? []).map((t) => (t.taskId === taskId ? { ...t, status: toStatus } : t))
    );
    try {
      const saved = await updateCustomCategoryTaskStatus(customTrackingId, taskId, toStatus);
      setTasks((prev) => (prev ?? []).map((t) => (t.taskId === taskId ? saved : t)));
    } catch {
      await refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{categoryName}</h1>
          <p className="text-sm opacity-80">
            Drag tickets between columns or use the edit form to update status.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      ) : null}

      <CustomCategoryKanbanBoard
        loading={loading}
        notStarted={lanes.notStarted}
        inProgress={lanes.inProgress}
        finished={lanes.finished}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
      />
    </div>
  );
}
