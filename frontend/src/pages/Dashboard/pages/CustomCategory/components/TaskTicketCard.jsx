import React, { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDelete, MdDragIndicator, MdEdit, MdSave } from "react-icons/md";

export default function TaskTicketCard({ task, onEdit, onDelete }) {
  const id = String(task.taskId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.name ?? "");

  async function submitEdit(e) {
    e.preventDefault();
    const next = draft.trim();
    if (!next) return;
    await onEdit(next);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "group rounded-lg border border-white/10 bg-black/30 p-3 shadow-sm transition hover:border-white/20 hover:bg-black/35 " +
        (task.isFinished ? "opacity-90" : "") +
        (isDragging ? " opacity-60" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={submitEdit} className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={200}
                className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1 text-sm outline-none focus:border-green-400"
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-green-400 px-2 py-1 text-sm font-medium text-black"
              >
                <MdSave className="size-4" />
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={
                  "h-2 w-2 shrink-0 rounded-full " +
                  (task.isFinished ? "bg-emerald-400" : "bg-sky-400")
                }
              />
              <div className="min-w-0 text-sm font-medium text-white/90">
                {task.name}
              </div>
            </div>
          )}

          <div className="mt-1 text-xs text-white/50">Ticket #{task.taskId}</div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setDraft(task.name ?? "");
                setEditing(true);
              }}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
              title="Edit"
            >
              <MdEdit className="size-5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            title="Delete"
          >
            <MdDelete className="size-5" />
          </button>

          <button
            type="button"
            className="inline-flex cursor-grab items-center gap-1 rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white active:cursor-grabbing"
            title="Drag"
            {...attributes}
            {...listeners}
          >
            <MdDragIndicator className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

