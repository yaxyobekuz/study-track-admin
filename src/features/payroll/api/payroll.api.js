// HTTP
import http from "@/shared/api/http";

/** Bo'limlar (staff / teaching). */
export const departmentsAPI = {
  getAll: (params) => http.get("/payroll/departments", { params }),
  create: (data) => http.post("/payroll/departments", data),
  update: (id, data) => http.put(`/payroll/departments/${id}`, data),
  remove: (id) => http.delete(`/payroll/departments/${id}`),
};

/** Lavozimlar (staff bo'lim ichida) + maosh. */
export const positionsAPI = {
  getAll: (params) => http.get("/payroll/positions", { params }),
  create: (data) => http.post("/payroll/positions", data),
  update: (id, data) => http.put(`/payroll/positions/${id}`, data),
  remove: (id) => http.delete(`/payroll/positions/${id}`),
};

/** Hisoblangan oyliklar (admin ko'rinishlari) + biriktirish. */
export const payrollViewAPI = {
  staff: (params) => http.get("/payroll/view/staff", { params }),
  // "Xodim qo'shish" tanlagichi — shu bo'limga hali biriktirilmaganlar
  assignCandidates: (departmentId) =>
    http.get("/payroll/view/assign-candidates", { params: { departmentId } }),
  teachers: (params) => http.get("/payroll/view/teachers", { params }),
  // Ustama haq registri (Yo'nalish -> Ustama haq)
  allowances: (params) => http.get("/payroll/view/allowances", { params }),
  // Admin ustama qo'shish/o'chirish
  createBonus: (data) => http.post("/payroll/bonuses", data),
  deleteBonus: (id) => http.delete(`/payroll/bonuses/${id}`),
  assign: (staffId, data) => http.patch(`/payroll/staff/${staffId}/assign`, data),
};

/**
 * Oylik zayavkalari — o'qituvchi/xodim TOIFA yoki USTAMA so'raydi, admin
 * ko'rib chiqadi. Tasdiq oylikka ta'sir qiladi (toifa biriktirish / ustama).
 * Audit — oylik strukturasidagi har bir o'zgarish qaydi (kim/qachon/eski/yangi).
 */
export const payrollRequestsAPI = {
  getAll: (params) => http.get("/payroll-requests", { params }),
  review: (id, data) => http.post(`/payroll-requests/${id}/review`, data),
  getAudit: (params) => http.get("/payroll-requests/audit", { params }),
};

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
 * Oylikdan ushlab qolish.
 *
 * ⚠️ Summa serverda (payroll dvigateli) hisoblanadi — `preview` aynan
 * saqlangandan keyin yoziladigan raqamni qaytaradi.
 */
export const deductionsAPI = {
  getAll: (params) => http.get("/payroll/deductions", { params }),
  candidates: (month) => http.get("/payroll/deductions/candidates", { params: { month } }),
  preview: (data) => http.post("/payroll/deductions/preview", data),
  create: (data) => http.post("/payroll/deductions", data),
  cancel: (id, reason) => http.post(`/payroll/deductions/${id}/cancel`, { reason }),
  cancelBatch: (batchId, reason) =>
    http.post(`/payroll/deductions/batch/${batchId}/cancel`, { reason }),
  // Mavjud guruhni keyin oyligi belgilanganlarga ham yoyish
  applyToAll: (batchId) => http.post(`/payroll/deductions/batch/${batchId}/apply-all`),
};

/**
 * Oylikni to'xtatish — tanlangan oy(lar)da oylikning butuni yoki qismi
 * hisoblanmaydi. Summa serverda (payroll dvigateli).
 */
export const suspensionsAPI = {
  getAll: (params) => http.get("/payroll/suspensions", { params }),
  candidates: (month) => http.get("/payroll/suspensions/candidates", { params: { month } }),
  units: (staffId, month) => http.get("/payroll/suspensions/units", { params: { staffId, month } }),
  preview: (data) => http.post("/payroll/suspensions/preview", data),
  create: (data) => http.post("/payroll/suspensions", data),
  cancel: (id, reason) => http.post(`/payroll/suspensions/${id}/cancel`, { reason }),
  cancelBatch: (batchId, reason) =>
    http.post(`/payroll/suspensions/batch/${batchId}/cancel`, { reason }),
};

/**
 * Oylik majburiyatlari va to'lovlar.
 *
 * ⚠️ Majburiyat summasini QO'LDA yozadigan endpoint YO'Q: u muhrlangan fakt.
 * Yagona yo'l — "Qayta hisoblash": qator AMALDAGI shartnomadan qayta
 * hisoblanadi (to'lov, chek va kassaga tegmasdan), avval ro'yxat ko'rsatiladi.
 */
export const payrollAPI = {
  getEntries: (params) => http.get("/payroll", { params }),
  getStaffEntries: (staffId) => http.get(`/payroll/staff/${staffId}`),
  generate: (data) => http.post("/payroll/generate", data),
  cancelEntry: (id, reason) => http.post(`/payroll/${id}/cancel`, { reason }),
  // Qayta hisoblash: { month, entryIds? } → "eski → yangi" ro'yxati (hech
  // narsa yozilmaydi); `recalc` esa { month, entryIds?, reason } bilan yozadi
  previewRecalc: (data) => http.post("/payroll/recalc/preview", data),
  recalc: (data) => http.post("/payroll/recalc", data),

  getPayments: (params) => http.get("/payroll/payments", { params }),
  previewPayment: (data) => http.post("/payroll/payments/preview", data),
  createPayment: (data) => http.post("/payroll/payments", data),
  voidPayment: (id, reason) => http.post(`/payroll/payments/${id}/void`, { reason }),
  // Tahrirlash — eski bekor qilinadi, to'g'ri summa bilan yangisi yoziladi
  replacePayment: (id, data) => http.post(`/payroll/payments/${id}/replace`, data),
};
