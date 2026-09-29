// HTTP
import http from "@/shared/api/http";

/**
 * QURILMA NAZORATI — endpointlar.
 *
 * ⚠️ `.data` bu yerda OCHILMAYDI — bu qatlamning ishi faqat manzil.
 * Ochish `queries` da bo'ladi (`lessonHours.api.js` bilan bir xil qoida).
 */

/** Qurilmalar, kodlar, vaqtinchalik ochish, sozlama. */
export const devicesAPI = {
  /** Qurilmalar ro'yxati — o'quvchi, siyosat va holat bilan. */
  getAll: (params) => http.get("/devices", { params }),
  getById: (id) => http.get(`/devices/${id}`),

  pause: (id, data) => http.post(`/devices/${id}/pause`, data),
  resume: (id) => http.post(`/devices/${id}/resume`),
  remove: (id, data) => http.delete(`/devices/${id}`, { data }),

  /**
   * O'quvchi qidiruvi — oynalardagi tanlagich uchun.
   * ⚠️ Bo'limning O'Z yo'li (`/users/students` EMAS): u boshqa ruxsat
   * talab qiladi va faqat qurilma nazoratini boshqaradigan xodim
   * o'quvchini tanlay olmasdi.
   */
  searchStudents: (params) => http.get("/devices/students", { params }),

  /** Bir martalik biriktirish kodi (o'quvchi uni telefoniga kiritadi). */
  issueCode: (data) => http.post("/devices/codes", data),
  getStudentCode: (studentId) => http.get(`/devices/codes/${studentId}`),

  getSettings: () => http.get("/devices/settings"),
  updateSettings: (data) => http.put("/devices/settings", data),

  getAudit: (params) => http.get("/devices/audit", { params }),
};

/** Siyosatlar va biriktirish. */
export const devicePoliciesAPI = {
  getAll: (params) => http.get("/devices/policies", { params }),
  getById: (id) => http.get(`/devices/policies/${id}`),
  create: (data) => http.post("/devices/policies", data),
  update: (id, data) => http.put(`/devices/policies/${id}`, data),
  archive: (id) => http.post(`/devices/policies/${id}/archive`),
  restore: (id) => http.post(`/devices/policies/${id}/restore`),

  /** "Nechta o'quvchiga ta'sir qiladi" — biriktirishdan OLDIN. */
  impact: (id) => http.get(`/devices/policies/${id}/impact`),

  getAssignments: (params) => http.get("/devices/assignments", { params }),
  setAssignment: (data) => http.post("/devices/assignments", data),
  clearAssignment: (id, data) => http.delete(`/devices/assignments/${id}`, { data }),
};

/** Ilovalar katalogi. */
export const deviceAppsAPI = {
  getAll: (params) => http.get("/devices/apps", { params }),
  /** Siyosat muharriri uchun yengil ro'yxat. */
  getOptions: () => http.get("/devices/apps/options"),
  create: (data) => http.post("/devices/apps", data),
  update: (id, data) => http.put(`/devices/apps/${id}`, data),
  archive: (id) => http.post(`/devices/apps/${id}/archive`),
  /** Ommaviy arxivlash — aniqlangan ilovalar uyumini tozalash. */
  bulkArchive: (ids) => http.post("/devices/apps/bulk-archive", { ids }),
  restore: (id) => http.post(`/devices/apps/${id}/restore`),
};

/** Vaqtinchalik ochish. */
export const deviceUnlocksAPI = {
  getAll: (params) => http.get("/devices/unlocks", { params }),
  create: (data) => http.post("/devices/unlocks", data),
  cancel: (id, data) => http.post(`/devices/unlocks/${id}/cancel`, data),
};

/** Manzara va hisobotlar. */
export const deviceReportsAPI = {
  getDashboard: (params) => http.get("/devices/dashboard", { params }),
  getUsage: (params) => http.get("/devices/reports/usage", { params }),
  getStudentOverview: (studentId, params) =>
    http.get(`/devices/students/${studentId}/overview`, { params }),
};
