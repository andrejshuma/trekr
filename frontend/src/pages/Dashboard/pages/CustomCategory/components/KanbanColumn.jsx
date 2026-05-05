import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

export default function KanbanColumn({ title, droppableId, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  const variant = useMemo(() => {
    if (droppableId === "lane:done") {
      return {
        Icon: MdCheckCircle,
        header: "from-emerald-500/25 via-emerald-500/10 to-transparent",
        badge: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
        ring: "group-hover:ring-emerald-500/25",
        drop: "border-emerald-400/60 bg-emerald-400/10",
        border: "border-emerald-500/20",
      };
    }

    return {
      Icon: MdRadioButtonUnchecked,
      header: "from-sky-500/25 via-sky-500/10 to-transparent",
      badge: "bg-sky-500/15 text-sky-200 border-sky-500/30",
      ring: "group-hover:ring-sky-500/25",
      drop: "border-sky-400/60 bg-sky-400/10",
      border: "border-sky-500/20",
    };
  }, [droppableId]);

  return (
    <div
      className={
        "group overflow-hidden rounded-xl border bg-neutral-900/40 shadow-sm ring-1 ring-white/5 transition " +
        variant.border +
        " " +
        variant.ring
      }
    >
      <div className={"bg-gradient-to-b " + variant.header + " p-4"}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <variant.Icon className="size-5 text-white/80" />
            <h2 className="text-sm font-semibold tracking-wide text-white/90">
              {title}
            </h2>
          </div>
          <span
            className={
              "rounded-full border px-2 py-0.5 text-xs font-medium " +
              variant.badge
            }
          >
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={
          "min-h-[220px] p-4 transition-colors " +
          (isOver ? variant.drop : "border-t border-white/10")
        }
      >
        {children}
      </div>
    </div>
  );
}

