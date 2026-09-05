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

  /** Xarajat kategoriyalari bo'yicha oylik limit. Params: { month } */
  getExpenseBudgets: (params) => http.get("/finance-reports/expense-budgets", { params }),

  /** Limitlarni saqlash. Body: { month, items: [{ categoryId, limitAmount }] } */
  saveExpenseBudgets: (data) => http.put("/finance-reports/expense-budgets", data),

  /** Mas'ul × kirim turi bo'yicha yig'ish rejasi. Params: { month } */
  getIncomePlans: (params) => http.get("/finance-reports/income-plans", { params }),

  /** Rejani saqlash. Body: { month, items: [{ responsibleId, categoryId, targetAmount, studentCount }] } */
  saveIncomePlans: (data) => http.put("/finance-reports/income-plans", data),
};

export default financeDashboardAPI;
