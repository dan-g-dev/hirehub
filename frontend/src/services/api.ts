import axios from "axios";

// In local dev, '/api' works via vite.config.ts's proxy to your local
// backend. In production (Vercel), there is no such proxy — the frontend
// and backend are different domains — so VITE_API_URL (set in Vercel's
// environment variables) must be used as the real base URL instead.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hirehub_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized / expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith("/student") ||
        currentPath.startsWith("/employer") ||
        currentPath.startsWith("/admin")
      ) {
        localStorage.removeItem("hirehub_token");
        localStorage.removeItem("hirehub_user");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
