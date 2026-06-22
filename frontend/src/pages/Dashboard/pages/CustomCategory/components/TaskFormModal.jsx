import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  isLoading = false,
}) {
  const isEditing = !!task;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "NOT_STARTED",
  });
  const [errors, setErrors] = useState({});

  // Initialize form with task data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "NOT_STARTED",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        status: "NOT_STARTED",
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }
    if (formData.name.length > 200) {
      newErrors.name = "Task name must be 200 characters or less";
    }
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      dueDate: formData.dueDate || null,
      priority: formData.priority,
    };

    // Only include status if editing
    if (isEditing) {
      payload.status = formData.status;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
            title="Close"
          >
            <MdClose className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Task Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter task name"
              maxLength={200}
              className={`w-full rounded-lg border bg-black/40 px-3 py-2 text-sm text-white outline-none transition ${
                errors.name
                  ? "border-red-500/50 focus:border-red-400"
                  : "border-white/10 focus:border-green-400"
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-white/40">
              {formData.name.length}/200
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-green-400"
              disabled={isLoading}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-green-400"
              disabled={isLoading}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-black/40 px-3 py-2 text-sm text-white outline-none transition ${
                errors.dueDate
                  ? "border-red-500/50 focus:border-red-400"
                  : "border-white/10 focus:border-green-400"
              }`}
              disabled={isLoading}
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>
            )}
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-green-400"
                disabled={isLoading}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-green-400 px-4 py-2 text-sm font-medium text-black transition hover:bg-green-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

