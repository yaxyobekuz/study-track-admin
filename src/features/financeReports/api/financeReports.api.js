// HTTP
import http from "@/shared/api/http";

/**
 * Moliya hisobotlari — FAQAT O'QIYDI. Bu yerda birorta POST/PUT yo'q va
 * bo'lmasligi ham kerak: hisobot summani ko'rsatadi, o'zgartirmaydi.
 */
export const financeReportsAPI = {
  /** KPI raqamlari + oylik trend. Params: { fromMonth, toMonth } */
  getOverview: (params) => http.get("/finance-reports/overview", { params }),

  /** Kassaga tushgan pul. Params: { from, to, groupBy } */
  getCashflow: (params) => http.get("/finance-reports/cashflow", { params }),

  /** Qarz yoshi, dinamikasi, sinf kesimi, top qarzdorlar. Params: { asOfMonth } */
  getDebt: (params) => http.get("/finance-reports/debt", { params }),

  /** Tarif ulushi, chegirma va proratsiya. Params: { fromMonth, toMonth } */
  getTariffs: (params) => http.get("/finance-reports/tariffs", { params }),
};

export default financeReportsAPI;
