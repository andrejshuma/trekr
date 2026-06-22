import React, { useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { MdAdd, MdSort } from "react-icons/md";

import KanbanColumn from "./KanbanColumn";
import TaskTicketCard from "./TaskTicketCard";
import TaskFormModal from "./TaskFormModal";

const LANES = [
  { id: "NOT_STARTED", droppableId: "lane:NOT_STARTED", title: "Not Started" },
  { id: "IN_PROGRESS", droppableId: "lane:IN_PROGRESS", title: "In Progress" },
  { id: "FINISHED",    droppableId: "lane:FINISHED",    title: "Finished" },
];

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2, null: 3, undefined: 3 };

function sortTasks(tasks, sortBy) {
  if (!tasks || tasks.length === 0) return tasks;
  const arr = [...tasks];
  if (sortBy === "dueDate") {
    arr.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortBy === "priority") {
    arr.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
  }
  return arr;
}

function statusForDropId(dropId) {
  return dropId.replace("lane:", "");
}

export default function CustomCategoryKanbanBoard({
  loading, notStarted, inProgress, finished,
  onAddTask, onEditTask, onDeleteTask, onMoveTask,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tasksByLane = useMemo(() => ({
    NOT_STARTED: sortTasks(notStarted ?? [], sortBy),
    IN_PROGRESS: sortTasks(inProgress ?? [], sortBy),
    FINISHED:    sortTasks(finished ?? [], sortBy),
  }), [notStarted, inProgress, finished, sortBy]);

  const allTasks = useMemo(() => [
    ...(notStarted ?? []),
    ...(inProgress ?? []),
    ...(finished ?? []),
  ], [notStarted, inProgress, finished]);

  function findTask(id) {
    return allTasks.find((t) => String(t.taskId) === String(id));
  }

  async function handleDragEnd({ active, over }) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const task = findTask(activeId);
    if (!task) return;

    if (overId.startsWith("lane:")) {
      const toStatus = statusForDropId(overId);
      if (task.status !== toStatus) await onMoveTask(task.taskId, toStatus);
      return;
    }

    const overTask = findTask(overId);
    if (!overTask) return;

    if (task.status !== overTask.status) {
      await onMoveTask(task.taskId, overTask.status);
    }
  }

  async function handleModalSubmit(payload) {
    setModalLoading(true);
    try {
      if (editingTask) {
        await onEditTask(editingTask.taskId, payload);
      } else {
        await onAddTask(payload);
      }
      setModalOpen(false);
      setEditingTask(null);
    } finally {
      setModalLoading(false);
    }
  }

  const total = allTasks.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
          <span className="rounded-full bg-slate-500/20 px-2 py-1 text-slate-200">
            Not started: {(notStarted ?? []).length}
          </span>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-200">
            In progress: {(inProgress ?? []).length}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">
            Finished: {(finished ?? []).length}
          </span>
          <span className="text-white/40">/ {total} total</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
            <MdSort className="size-4 text-white/50" />
            <span className="text-xs text-white/50">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white/80 outline-none cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-green-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-green-300"
          >
            <MdAdd className="size-4" />
            New ticket
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {LANES.map((lane) => {
            const tasks = tasksByLane[lane.id] ?? [];
            return (
              <KanbanColumn
                key={lane.id}
                laneId={lane.id}
                title={lane.title}
                droppableId={lane.droppableId}
                count={tasks.length}
              >
                <SortableContext
                  items={tasks.map((t) => String(t.taskId))}
                  strategy={rectSortingStrategy}
                >
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-sm opacity-70">Loading...</div>
                    ) : tasks.length === 0 ? (
                      <div className="text-sm opacity-40">No tickets.</div>
                    ) : (
                      tasks.map((t) => (
                        <TaskTicketCard
                          key={t.taskId}
                          task={t}
                          onEdit={() => { setEditingTask(t); setModalOpen(true); }}
                          onDelete={() => onDeleteTask(t.taskId)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSubmit={handleModalSubmit}
        task={editingTask}
        isLoading={modalLoading}
      />
    </div>
  );
}
