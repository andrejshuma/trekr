import React, { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDelete, MdDragIndicator, MdEdit, MdCalendarToday } from "react-icons/md";

const PRIORITY_STYLES = {
  HIGH:   "bg-red-500/15 text-red-300 border-red-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  LOW:    "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

const STATUS_DOT = {
  NOT_STARTED: "bg-slate-400",
  IN_PROGRESS: "bg-amber-400",
  FINISHED:    "bg-emerald-400",
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function TaskTicketCard({ task, onEdit, onDelete }) {
  const id = String(task.taskId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);

  const overdue = task.status !== "FINISHED" && isOverdue(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "group rounded-lg border border-white/10 bg-black/30 p-3 shadow-sm transition hover:border-white/20 hover:bg-black/35 " +
        (task.status === "FINISHED" ? "opacity-80" : "") +
        (isDragging ? " opacity-50 scale-95" : "")
      }
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={"h-2 w-2 shrink-0 rounded-full " + (STATUS_DOT[task.status] ?? "bg-slate-400")} />
            <span className="text-sm font-medium text-white/90 leading-snug">{task.name}</span>
          </div>

          {task.description ? (
            <p className="mt-1.5 text-xs text-white/50 line-clamp-2">{task.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
            title="Edit"
          >
            <MdEdit className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
            title="Delete"
          >
            <MdDelete className="size-4" />
          </button>
          <button
            type="button"
            className="cursor-grab rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white active:cursor-grabbing"
            title="Drag"
            {...attributes}
            {...listeners}
          >
            <MdDragIndicator className="size-4" />
          </button>
        </div>
      </div>

      {/* Footer row: priority + due date */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/30">#{task.taskId}</span>

        {task.priority ? (
          <span className={"rounded-full border px-2 py-0.5 text-xs font-medium " + (PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.LOW)}>
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </span>
        ) : null}

        {task.dueDate ? (
          <span className={"flex items-center gap-1 text-xs " + (overdue ? "text-red-400" : "text-white/40")}>
            <MdCalendarToday className="size-3" />
            {overdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
