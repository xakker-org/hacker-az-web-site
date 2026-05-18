import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/tokens";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "/api"}/auth/refresh/`,
        { refresh }
      );
      setTokens(data.access, refresh);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
