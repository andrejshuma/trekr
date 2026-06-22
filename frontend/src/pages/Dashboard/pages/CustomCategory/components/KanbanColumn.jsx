import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MdCheckCircle, MdRadioButtonUnchecked, MdAutorenew } from "react-icons/md";

const VARIANTS = {
  NOT_STARTED: {
    Icon: MdRadioButtonUnchecked,
    header: "from-slate-500/20 via-slate-500/8 to-transparent",
    badge: "bg-slate-500/15 text-slate-200 border-slate-500/30",
    ring: "group-hover:ring-slate-500/25",
    drop: "border-slate-400/60 bg-slate-400/10",
    border: "border-slate-500/20",
  },
  IN_PROGRESS: {
    Icon: MdAutorenew,
    header: "from-amber-500/20 via-amber-500/8 to-transparent",
    badge: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    ring: "group-hover:ring-amber-500/25",
    drop: "border-amber-400/60 bg-amber-400/10",
    border: "border-amber-500/20",
  },
  FINISHED: {
    Icon: MdCheckCircle,
    header: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    badge: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    ring: "group-hover:ring-emerald-500/25",
    drop: "border-emerald-400/60 bg-emerald-400/10",
    border: "border-emerald-500/20",
  },
};

export default function KanbanColumn({ laneId, title, droppableId, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const v = VARIANTS[laneId] ?? VARIANTS.NOT_STARTED;

  return (
    <div
      className={
        "group overflow-hidden rounded-xl border bg-neutral-900/40 shadow-sm ring-1 ring-white/5 transition " +
        v.border + " " + v.ring
      }
    >
      <div className={"bg-gradient-to-b " + v.header + " p-4"}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <v.Icon className="size-5 text-white/80" />
            <h2 className="text-sm font-semibold tracking-wide text-white/90">{title}</h2>
          </div>
          <span className={"rounded-full border px-2 py-0.5 text-xs font-medium " + v.badge}>
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={
          "min-h-[220px] p-4 transition-colors " +
          (isOver ? v.drop : "border-t border-white/10")
        }
      >
        {children}
      </div>
    </div>
  );
}
