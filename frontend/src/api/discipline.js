import api from "./axios";

export async function getDisciplineStatus() {
  const res = await api.get("/discipline/status");
  return Boolean(res?.data?.tracking);
}

export async function startDisciplineTracking() {
  return api.post("/discipline/start", {});
}

export async function getTasks({ page = 0, size = 50 } = {}) {
  const res = await api.get("/discipline/tasks", { params: { page, size } });
  return res?.data;
}

export async function createTask(payload) {
  const res = await api.post("/discipline/tasks", payload);
  return res?.data;
}

export async function updateTask(taskId, payload) {
  const res = await api.put(`/discipline/tasks/${taskId}`, payload);
  return res?.data;
}

export async function updateTaskFinished(taskId, isFinished) {
  const res = await api.patch(`/discipline/tasks/${taskId}/finished`, {
    isFinished,
  });
  return res?.data;
}

export async function deleteTask(taskId) {
  return api.delete(`/discipline/tasks/${taskId}`);
}

