import axios from "axios";
import { getAuthToken, isTokenExpired, logoutAndRedirect } from "../utils/authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    if (isTokenExpired(token)) {
      logoutAndRedirect("/dashboard");
      return Promise.reject(new Error("Authentication session expired"));
    }
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      logoutAndRedirect("/dashboard");
    }
    return Promise.reject(error);
  },
);

export default api;