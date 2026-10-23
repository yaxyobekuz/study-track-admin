// Axios
import axios from "axios";

// Utils
import { saveLogoutReason } from "@/shared/utils/logoutReason.utils";

// Umumiy ko'rinish: "bu id — shu filialda" belgilari
import {
  rememberBranchHints,
  resolveRequestBranch,
} from "@/shared/api/branchHints";

// Umumiy ko'rinish: "bu raqamning qanchasi qaysi filialdan"
import { attachAggregateMeta } from "@/shared/api/aggregateMeta";

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
const MUTATIONS = new Set(["post", "put", "patch", "delete"]);

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // UMUMIY KO'RINISHDA YOZUV — qator o'z filialiga ketadi.
    //
    // ⚠️ Sarlavha faqat YOZUV amallariga va faqat id tanilgan bo'lsa
    // qo'yiladi; bitta filial rejimida xarita bo'sh bo'lgani uchun bu blok
    // amalda hech narsa qilmaydi (server ham bu sarlavhani faqat umumiy
    // tokende o'qiydi). Oyna o'zi aniq filial bergan bo'lsa — tegilmaydi.
    const method = String(config.method || "get").toLowerCase();
    if (MUTATIONS.has(method) && !config.headers["X-Branch-Id"]) {
      const branchId = resolveRequestBranch(config);
      if (branchId) config.headers["X-Branch-Id"] = branchId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    // Umumiy ko'rinishda har qator `_branch` bilan keladi — keyingi yozuv
    // amali uchun eslab qolinadi (`branchHints.js`).
    if (response?.data) {
      rememberBranchHints(response.data);
      // Sanoqchilarning filiallar kesimi javob konvertidan ma'lumotning
      // o'ziga ko'chiriladi (`aggregateMeta.js`) — kartalar uni shundan
      // o'qiydi va `meta` ni har bir so'rov funksiyasiga olib yurish
      // kerak bo'lmaydi.
      attachAggregateMeta(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Sabab login sahifasida ko'rsatiladi — qayta yuklashda yo'qolmasin
      saveLogoutReason(error);
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default http;
