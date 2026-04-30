import api from "./axios";

export async function getFinanceStatus() {
  const res = await api.get("/finance/status");
  return Boolean(res?.data?.tracking);
}

export async function startFinanceTracking(payload) {
  return api.post("/finance/start", payload);
}

export async function getFinanceProfile() {
  const res = await api.get("/finance/profile");
  return res?.data;
}

export async function getIncomes({ page = 0, size = 5 } = {}) {
  const res = await api.get("/finance/incomes", { params: { page, size } });
  return res?.data;
}

export async function createIncome(payload) {
  const res = await api.post("/finance/incomes", payload);
  return res?.data;
}

