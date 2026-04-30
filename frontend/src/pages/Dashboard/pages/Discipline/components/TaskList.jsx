import React, { useMemo, useState } from "react";

function normalizeName(value) {
  return String(value ?? "").trim();
}

export default function TaskList({
  tasks,
  onAdd,
  onDelete,
  onToggleFinished,
  onRename,
  isWorkingTaskIds,
}) {
  const [newTaskName, setNewTaskName] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editName, setEditName] = useState("");

  const workingSet = useMemo(
    () => new Set(isWorkingTaskIds ?? []),
    [isWorkingTaskIds],
  );

  const beginEdit = (t) => {
    setEditTaskId(t.taskId);
    setEditName(t.name ?? "");
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditName("");
  };

  const submitRename = async () => {
    const name = normalizeName(editName);
    if (!name) return;
    await onRename(editTaskId, name);
    cancelEdit();
  };

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="card-title">Daily tasks</h2>
            <p className="text-sm opacity-80">
              Check a task to mark it finished. Changes are saved immediately.
            </p>
          </div>
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = normalizeName(newTaskName);
            if (!name) return;
            onAdd(name);
            setNewTaskName("");
          }}
        >
          <input
            className="input input-bordered w-full"
            placeholder="New task name…"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            maxLength={200}
          />
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {(tasks ?? []).length === 0 ? (
            <p className="opacity-70">No tasks yet.</p>
          ) : (
            (tasks ?? []).map((t) => {
              const isWorking = workingSet.has(t.taskId);
              const isEditing = editTaskId === t.taskId;

              return (
                <div
                  key={t.taskId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2"
                >
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-success"
                      checked={Boolean(t.isFinished)}
                      disabled={isWorking}
                      onChange={(e) =>
                        onToggleFinished(t.taskId, e.target.checked)
                      }
                    />

                    {isEditing ? (
                      <input
                        className="input input-bordered input-sm w-full"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={200}
                      />
                    ) : (
                      <div className="w-full">
                        <div
                          className={
                            t.isFinished
                              ? "line-through opacity-70"
                              : "font-medium"
                          }
                        >
                          {t.name}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-primary btn-xs"
                          type="button"
                          disabled={isWorking}
                          onClick={submitRename}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          type="button"
                          disabled={isWorking}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-outline btn-xs"
                          type="button"
                          disabled={isWorking}
                          onClick={() => beginEdit(t)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-error btn-xs"
                          type="button"
                          disabled={isWorking}
                          onClick={() => onDelete(t.taskId)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

