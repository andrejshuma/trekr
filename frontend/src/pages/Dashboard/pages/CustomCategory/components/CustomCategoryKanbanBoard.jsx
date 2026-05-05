import React, { useMemo, useState } from "react";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import KanbanColumn from "./KanbanColumn";
import TaskTicketCard from "./TaskTicketCard";

function laneIdForTask(task) {
  return task?.isFinished ? "done" : "notDone";
}

export default function CustomCategoryKanbanBoard({
  loading,
  notDone,
  done,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Keep a local order per lane for nicer UX, but still driven by server state.
  const [notDoneOrder, setNotDoneOrder] = useState([]);
  const [doneOrder, setDoneOrder] = useState([]);

  const orderedNotDone = useMemo(() => {
    const byId = new Map((notDone ?? []).map((t) => [String(t.taskId), t]));
    const ids = [
      ...notDoneOrder.filter((id) => byId.has(id)),
      ...Array.from(byId.keys()).filter((id) => !notDoneOrder.includes(id)),
    ];
    return ids.map((id) => byId.get(id));
  }, [notDone, notDoneOrder]);

  const orderedDone = useMemo(() => {
    const byId = new Map((done ?? []).map((t) => [String(t.taskId), t]));
    const ids = [
      ...doneOrder.filter((id) => byId.has(id)),
      ...Array.from(byId.keys()).filter((id) => !doneOrder.includes(id)),
    ];
    return ids.map((id) => byId.get(id));
  }, [done, doneOrder]);

  async function submitNewTask(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    try {
      await onAddTask(name);
      setNewName("");
    } finally {
      setSubmitting(false);
    }
  }

  function findTaskById(id) {
    const all = [...(notDone ?? []), ...(done ?? [])];
    return all.find((t) => String(t.taskId) === String(id));
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const task = findTaskById(activeId);
    if (!task) return;

    // Moving over a column dropzone
    if (overId === "lane:notDone" || overId === "lane:done") {
      const toFinished = overId === "lane:done";
      if (Boolean(task.isFinished) === toFinished) return;
      await onMoveTask(task.taskId, toFinished);
      return;
    }

    // Sorting within a lane: keep it frontend-only.
    const overTask = findTaskById(overId);
    if (!overTask) return;

    const fromLane = laneIdForTask(task);
    const toLane = laneIdForTask(overTask);

    if (fromLane !== toLane) {
      // if dropped onto a card in the other lane => treat as lane move
      await onMoveTask(task.taskId, toLane === "done");
      return;
    }

    if (fromLane === "notDone") {
      const ids = orderedNotDone.map((t) => String(t.taskId));
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        setNotDoneOrder(arrayMove(ids, oldIndex, newIndex));
      }
    } else {
      const ids = orderedDone.map((t) => String(t.taskId));
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        setDoneOrder(arrayMove(ids, oldIndex, newIndex));
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-white/90">
              Tickets
              <span className="ml-2 text-xs font-normal text-white/60">
                Drag cards left/right to change status.
              </span>
            </div>
            <div className="mt-1 text-xs text-white/55">
              Tip: grab the <span className="font-semibold text-white/80">drag</span> handle.
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-200">
              Not done: {(notDone ?? []).length}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">
              Done: {(done ?? []).length}
            </span>
          </div>
        </div>

        <form onSubmit={submitNewTask} className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add a new ticket (e.g. Fix bug #123)"
            maxLength={200}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-green-400"
          />
          <button
            className="rounded-lg bg-green-400 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            type="submit"
            disabled={!newName.trim() || submitting}
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <KanbanColumn
            title="Not done"
            droppableId="lane:notDone"
            count={orderedNotDone.length}
          >
            <SortableContext
              items={orderedNotDone.map((t) => String(t.taskId))}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm opacity-70">Loading...</div>
                ) : orderedNotDone.length === 0 ? (
                  <div className="text-sm opacity-70">No tickets yet.</div>
                ) : (
                  orderedNotDone.map((t) => (
                    <TaskTicketCard
                      key={t.taskId}
                      task={t}
                      onEdit={(name) => onEditTask(t.taskId, name)}
                      onDelete={() => onDeleteTask(t.taskId)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </KanbanColumn>

          <KanbanColumn
            title="Done"
            droppableId="lane:done"
            count={orderedDone.length}
          >
            <SortableContext
              items={orderedDone.map((t) => String(t.taskId))}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm opacity-70">Loading...</div>
                ) : orderedDone.length === 0 ? (
                  <div className="text-sm opacity-70">Nothing done yet.</div>
                ) : (
                  orderedDone.map((t) => (
                    <TaskTicketCard
                      key={t.taskId}
                      task={t}
                      onEdit={(name) => onEditTask(t.taskId, name)}
                      onDelete={() => onDeleteTask(t.taskId)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </KanbanColumn>
        </div>
      </DndContext>
    </div>
  );
}


