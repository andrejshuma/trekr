import api from "./axios";

export async function computeDailyCompletion(date /* yyyy-mm-dd or undefined */) {
  const res = await api.post("/discipline/daily-completions/compute", null, {
    params: date ? { date } : {},
  });
  return res?.data;
}

export async function getDailyCompletions({ page = 0, size = 14 } = {}) {
  const res = await api.get("/discipline/daily-completions", {
    params: { page, size },
  });
  return res?.data;
}

