// Axios
import axios from "axios";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4040";

/**
 * QAYSI PANEL — `X-Client` sarlavhasi.
 *
 * ⚠️ USER-AGENT YETARLI EMAS: barcha panellar bitta brauzerdan
 * ochiladi va UA ularni ajrata olmaydi ("Chrome · Windows" ham admin,
 * ham o'qituvchi paneli uchun bir xil). Faollik va xavfsizlik
 * bo'limlari esa aynan shu farqni ko'rsatadi — "o'qituvchilar
 * panelidan 12 kishi kirdi" degan qator shu sarlavhasiz mumkin emas.
 *
 * ⚠️ Har panelda O'Z qiymati bo'lishi shart va u serverdagi
 * `ACTIVITY_CHANNELS` ro'yxatidan olinadi (`utils/constants.js`).
 * Noma'lum qiymat xato bermaydi — server uni `admin` deb qabul qiladi.
 */
const CLIENT = "admin";

// Create an Axios instance
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client": CLIENT,
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default http;
