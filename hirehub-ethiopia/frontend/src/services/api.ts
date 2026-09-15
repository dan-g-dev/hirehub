import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirehub_token');
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
      if (currentPath.startsWith('/student') || currentPath.startsWith('/employer') || currentPath.startsWith('/admin')) {
        localStorage.removeItem('hirehub_token');
        localStorage.removeItem('hirehub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
