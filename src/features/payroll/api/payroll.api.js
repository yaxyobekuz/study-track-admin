// HTTP
import http from "@/shared/api/http";

/** Malaka toifasi katalogi — soatlik KPI stavka (sozlamalar). */
export const salaryCategoriesAPI = {
  getAll: (params) => http.get("/payroll/categories", { params }),
  getActive: () => http.get("/payroll/categories/active"),
  create: (data) => http.post("/payroll/categories", data),
  update: (id, data) => http.put(`/payroll/categories/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/payroll/categories/${id}/archive`, { isArchived }),
  remove: (id) => http.delete(`/payroll/categories/${id}`),
};

/** Oylik qoidalari — kimga qancha fiksa belgilangan. */
export const staffSalariesAPI = {
  getAll: (params) => http.get("/payroll/salaries", { params }),
  getStaffHistory: (staffId) => http.get(`/payroll/salaries/staff/${staffId}`),
  // KPI oyligini oldindan ko'rsatish uchun: xodimning oydagi dars soati
  getLessonHours: (staffId, month) =>
    http.get(`/payroll/salaries/lesson-hours/${staffId}`, { params: { month } }),
  create: (data) => http.post("/payroll/salaries", data),
  update: (id, data) => http.put(`/payroll/salaries/${id}`, data),
  close: (id, endMonth) => http.patch(`/payroll/salaries/${id}/close`, { endMonth }),
  remove: (id) => http.delete(`/payroll/salaries/${id}`),
};

/**
 * Oylik majburiyatlari va to'lovlar.
 *
 * ⚠️ Majburiyat summasini o'zgartiradigan endpoint YO'Q va bo'lmasligi kerak:
 * u muhrlangan fakt. Xato bo'lsa bekor qilinib, qoida to'g'rilangach qayta
 * shakllantiriladi.
 */
export const payrollAPI = {
  getEntries: (params) => http.get("/payroll", { params }),
  getStaffEntries: (staffId) => http.get(`/payroll/staff/${staffId}`),
  generate: (data) => http.post("/payroll/generate", data),
  cancelEntry: (id, reason) => http.post(`/payroll/${id}/cancel`, { reason }),

  getPayments: (params) => http.get("/payroll/payments", { params }),
  previewPayment: (data) => http.post("/payroll/payments/preview", data),
  createPayment: (data) => http.post("/payroll/payments", data),
  voidPayment: (id, reason) => http.post(`/payroll/payments/${id}/void`, { reason }),
};
