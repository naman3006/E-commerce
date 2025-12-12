import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Request interceptor
api.interceptors.request.use((config) => {
  // Logic matches authSlice.js active user retrieval
  const activeEmail = sessionStorage.getItem("auth.active");

  if (activeEmail) {
    const users = JSON.parse(sessionStorage.getItem("auth.users") || "{}");
    const token = users[activeEmail]?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear session storage used by authSlice
      sessionStorage.removeItem("auth.users");
      sessionStorage.removeItem("auth.active");

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
