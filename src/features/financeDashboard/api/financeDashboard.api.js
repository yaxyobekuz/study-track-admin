// HTTP
import http from "@/shared/api/http";

/**
 * RAHBAR DASHBOARDI — moliya bo'limining bosh ekrani.
 *
 * Uchta so'rov, uchtasi ham `/finance-reports/*` ostida: dashboard
 * hisobotlarning eng yig'iq ko'rinishi, alohida modul emas.
 *
 * `saveTargets` — bu yerdagi YAGONA yozuv. Qolgan hamma narsa faqat
 * o'qiydi: dashboard raqamni ko'rsatadi, o'zgartirmaydi.
 */
export const financeDashboardAPI = {
  /** Butun moliyaviy manzara. Params: { month, compareMonth, trendMonths } */
  getDashboard: (params) => http.get("/finance-reports/dashboard", { params }),

  /** Maktab KPI ko'rsatkichlari (sifat, davomat, qabul). Params: { month } */
  getScorecard: (params) => http.get("/finance-reports/kpi", { params }),

  /** Oylik reja (byudjet) qatorlari. Params: { month } */
  getTargets: (params) => http.get("/finance-reports/targets", { params }),

  /** Oylik rejani saqlash. Body: { month, items: [{ metric, planValue, actualValue }] } */
  saveTargets: (data) => http.put("/finance-reports/targets", data),
};

export default financeDashboardAPI;
