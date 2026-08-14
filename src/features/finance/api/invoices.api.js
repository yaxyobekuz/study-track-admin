// Shared
import http from "@/shared/api/http";

/** Oylik to'lov majburiyatlari. */
export const invoicesAPI = {
  getAll: (params) => http.get("/invoices", { params }),
  getById: (id, params) => http.get(`/invoices/${id}`, { params }),
  getSummary: (params) => http.get("/invoices/summary", { params }),
  getForStudent: (studentId, params) =>
    http.get(`/invoices/student/${studentId}`, { params }),

  // Natija — paket hisoboti, yaratilgan resurs emas
  generate: (data) => http.post("/invoices/generate", data),

  // Faqat izoh — summa/oy/o'quvchi o'zgarmas
  updateNote: (id, note) => http.patch(`/invoices/${id}`, { note }),
  cancel: (id, reason) => http.post(`/invoices/${id}/cancel`, { reason }),
  restore: (id) => http.post(`/invoices/${id}/restore`),

  // To'lovlar
  getPayments: (id, params) => http.get(`/invoices/${id}/payments`, { params }),
  createPayment: (id, data) => http.post(`/invoices/${id}/payments`, data),
};

/** To'lovlar registri (kassaning kunlik hisoboti). */
export const invoicePaymentsAPI = {
  getAll: (params) => http.get("/invoice-payments", { params }),
  updateNote: (id, note) => http.patch(`/invoice-payments/${id}`, { note }),
  // Soft void — yozuv bazadan chiqmaydi
  void: (id, reason) => http.delete(`/invoice-payments/${id}`, { data: { reason } }),
};

/** O'quvchining moliyaviy holati (Faol / Muzlatilgan / Chetlatilgan). */
export const financeStatusAPI = {
  getAll: (params) => http.get("/student-finance-statuses", { params }),
  getForStudent: (studentId) =>
    http.get(`/student-finance-statuses/student/${studentId}`),
  create: (data) => http.post("/student-finance-statuses", data),
  bulkCreate: (data) => http.post("/student-finance-statuses/bulk", data),
  update: (id, data) => http.put(`/student-finance-statuses/${id}`, data),
  close: (id, endMonth) =>
    http.post(`/student-finance-statuses/${id}/close`, { endMonth }),
  changeStatus: (id, data) =>
    http.post(`/student-finance-statuses/${id}/change-status`, data),
  delete: (id) => http.delete(`/student-finance-statuses/${id}`),
};

/** Moliya sozlamalari — akademik davr va hisob-faktura cron'i. */
export const financeSettingsAPI = {
  get: () => http.get("/finance-settings"),
  update: (data) => http.put("/finance-settings", data),
  getAcademicYear: (params) =>
    http.get("/finance-settings/academic-year", { params }),
};
