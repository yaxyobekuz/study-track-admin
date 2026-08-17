// Shared
import http from "@/shared/api/http";

/** Oylik to'lov majburiyatlari. */
export const invoicesAPI = {
  getAll: (params) => http.get("/invoices", { params }),
  getById: (id, params) => http.get(`/invoices/${id}`, { params }),
  getSummary: (params) => http.get("/invoices/summary", { params }),
  // Kassirning asosiy ekrani: o'quvchi + tarif + chegirma + depozit + qarz
  getStudentRegistry: (params) => http.get("/invoices/students", { params }),
  getForStudent: (studentId, params) =>
    http.get(`/invoices/student/${studentId}`, { params }),

  // Natija — paket hisoboti, yaratilgan resurs emas
  generate: (data) => http.post("/invoices/generate", data),

  // Faqat izoh — summa/oy/o'quvchi o'zgarmas
  updateNote: (id, note) => http.patch(`/invoices/${id}`, { note }),
  cancel: (id, reason) => http.post(`/invoices/${id}/cancel`, { reason }),
  // Summa muhrlangani uchun uni tahrirlab bo'lmaydi — bekor qilib qayta yaratish
  regenerate: (id, reason) => http.post(`/invoices/${id}/regenerate`, { reason }),
  restore: (id) => http.post(`/invoices/${id}/restore`),

  // Hisob-fakturaga tushgan to'lovlar (chek raqami bilan)
  getPayments: (id, params) => http.get(`/invoices/${id}/payments`, { params }),
};

/**
 * To'lovlar — kassa cheki.
 *
 * To'lov endi HISOB-FAKTURAGA emas, O'QUVCHIGA kiritiladi: kassir bitta
 * summa beradi, server uni eng eski qarzdan boshlab taqsimlaydi.
 */
export const paymentsAPI = {
  getAll: (params) => http.get("/payments", { params }),
  getById: (id) => http.get(`/payments/${id}`),
  getForStudent: (studentId, params) =>
    http.get(`/payments/student/${studentId}`, { params }),

  // Yozmaydi — kassir tasdiqlashdan oldin taqsimotni ko'radi
  preview: (data) => http.post("/payments/preview", data),
  create: (data) => http.post("/payments", data),

  updateNote: (id, note) => http.patch(`/payments/${id}`, { note }),
  // Soft void — yozuv bazadan chiqmaydi
  void: (id, reason) => http.post(`/payments/${id}/void`, { reason }),
};

/** To'lov hisoblari (kassalar) va ular orasidagi o'tkazmalar. */
export const paymentAccountsAPI = {
  getAll: (params) => http.get("/payment-accounts", { params }),
  getById: (id) => http.get(`/payment-accounts/${id}`),
  getReport: (params) => http.get("/payment-accounts/report", { params }),
  getEntries: (id, params) =>
    http.get(`/payment-accounts/${id}/entries`, { params }),

  create: (data) => http.post("/payment-accounts", data),
  update: (id, data) => http.put(`/payment-accounts/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/payment-accounts/${id}/archive`, { isArchived }),
  // Sanoq farqi — sabab majburiy, serverda logga tushadi
  adjust: (id, data) => http.post(`/payment-accounts/${id}/adjust`, data),

  getTransfers: (params) =>
    http.get("/payment-accounts/transfers", { params }),
  createTransfer: (data) => http.post("/payment-accounts/transfers", data),
  voidTransfer: (id, reason) =>
    http.post(`/payment-accounts/transfers/${id}/void`, { reason }),
};

/** O'quvchining depozit hisobi (oldindan to'langan qoldiq). */
export const studentAccountsAPI = {
  get: (studentId) => http.get(`/student-accounts/${studentId}`),
  getMovements: (studentId) =>
    http.get(`/student-accounts/${studentId}/movements`),
  // Qoldiqni ochiq hisob-fakturalarga qo'llash (idempotent)
  apply: (studentId) => http.post(`/student-accounts/${studentId}/apply`),
  refund: (studentId, data) =>
    http.post(`/student-accounts/${studentId}/refund`, data),
  adjust: (studentId, data) =>
    http.post(`/student-accounts/${studentId}/adjust`, data),
};

/** Chegirmalar katalogi va o'quvchiga biriktirish. */
export const discountsAPI = {
  getAll: (params) => http.get("/discounts", { params }),
  getById: (id) => http.get(`/discounts/${id}`),
  create: (data) => http.post("/discounts", data),
  update: (id, data) => http.put(`/discounts/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/discounts/${id}/archive`, { isArchived }),
  delete: (id) => http.delete(`/discounts/${id}`),

  getAssignments: (params) => http.get("/discounts/assignments", { params }),
  getForStudent: (studentId) =>
    http.get(`/discounts/assignments/student/${studentId}`),
  assign: (data) => http.post("/discounts/assignments", data),
  bulkAssign: (data) => http.post("/discounts/assignments/bulk", data),
  updateAssignment: (id, data) => http.put(`/discounts/assignments/${id}`, data),
  closeAssignment: (id, endMonth) =>
    http.patch(`/discounts/assignments/${id}/close`, { endMonth }),
  deleteAssignment: (id) => http.delete(`/discounts/assignments/${id}`),
};

/** Ta'til oylari — o'sha oyda hech kimga to'lov yozilmaydi. */
export const vacationMonthsAPI = {
  getAll: (params) => http.get("/vacation-months", { params }),
  create: (data) => http.post("/vacation-months", data),
  delete: (id) => http.delete(`/vacation-months/${id}`),
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
