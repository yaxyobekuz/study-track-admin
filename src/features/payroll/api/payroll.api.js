// HTTP
import http from "@/shared/api/http";

/** Oylik qoidalari — kimga qancha fiksa belgilangan. */
export const staffSalariesAPI = {
  getAll: (params) => http.get("/payroll/salaries", { params }),
  getStaffHistory: (staffId) => http.get(`/payroll/salaries/staff/${staffId}`),
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
  // Bekor qilinganini qaytarish yoki qoida to'g'rilangandan keyin summani
  // yangilash — oylik passi bunday qatorga tegmaydi
  regenerateEntry: (id, reason) =>
    http.post(`/payroll/${id}/regenerate`, { reason }),

  getPayments: (params) => http.get("/payroll/payments", { params }),
  previewPayment: (data) => http.post("/payroll/payments/preview", data),
  createPayment: (data) => http.post("/payroll/payments", data),
  voidPayment: (id, reason) => http.post(`/payroll/payments/${id}/void`, { reason }),
};
