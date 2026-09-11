import axios from "axios";

/**
 * Resolves the base URL for API requests.
 * Supports:
 * - Host URL: "http://localhost:3000" -> "http://localhost:3000/api"
 * - Full URL with /api: "http://localhost:3000/api" -> "http://localhost:3000/api"
 * - Remote backend URL: "http://backend.example.com" -> "http://backend.example.com/api"
 * - Relative / empty (same-origin container / reverse proxy): "" -> "/api"
 */
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return "/api";
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 120000,
  withCredentials: true,
});

// Guard against duplicate /api/ if a caller supplies a path starting with /api/
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api/, "");
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];
let refreshSuccessHandler = null;
let refreshFailureHandler = null;

export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const setCsrfHeader = (token) => {
  if (token) {
    api.defaults.headers.common["x-csrf-token"] = token;
  } else {
    delete api.defaults.headers.common["x-csrf-token"];
  }
};

export const registerRefreshHandlers = ({
  onTokenRefreshed,
  onRefreshFailed,
}) => {
  refreshSuccessHandler = onTokenRefreshed || null;
  refreshFailureHandler = onRefreshFailed || null;
};

export const clearRefreshHandlers = () => {
  refreshSuccessHandler = null;
  refreshFailureHandler = null;
  refreshSubscribers = [];
};

const notifyRefreshSuccess = (accessToken, csrfToken) => {
  if (refreshSuccessHandler) {
    refreshSuccessHandler({ accessToken, csrfToken });
  }

  refreshSubscribers.forEach((subscriber) => {
    subscriber.resolve({ accessToken, csrfToken });
  });
  refreshSubscribers = [];
};

const notifyRefreshFailure = (error) => {
  if (refreshFailureHandler) {
    refreshFailureHandler(error);
  }

  refreshSubscribers.forEach((subscriber) => {
    subscriber.reject(error);
  });
  refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({ resolve, reject });
        }).then(({ accessToken, csrfToken }) => {
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          if (csrfToken) {
            originalRequest.headers["x-csrf-token"] = csrfToken;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshAccessToken();
        const { accessToken, csrfToken } = data;

        if (accessToken) setAuthHeader(accessToken);
        if (csrfToken) setCsrfHeader(csrfToken);
        notifyRefreshSuccess(accessToken, csrfToken);

        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (csrfToken) {
          originalRequest.headers["x-csrf-token"] = csrfToken;
        }

        return api(originalRequest);
      } catch (refreshError) {
        notifyRefreshFailure(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
