// Shared
import http from "@/shared/api/http";

/** Tariflar katalogi va narx versiyalari. */
export const tariffsAPI = {
  getAll: (params) => http.get("/tariffs", { params }),
  getById: (id, params) => http.get(`/tariffs/${id}`, { params }),
  create: (data) => http.post("/tariffs", data),
  update: (id, data) => http.put(`/tariffs/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/tariffs/${id}/archive`, { isArchived }),
  delete: (id) => http.delete(`/tariffs/${id}`),
  getTimeline: (id) => http.get(`/tariffs/${id}/timeline`),

  // YO'NALISHLAR — tarif ustidagi daraja. `/tariffs/directions` yo'li
  // ATAYLAB katalog ichida: yo'nalish tarifdan tashqarida ma'nosiz.
  getDirections: (params) => http.get("/tariffs/directions", { params }),
  createDirection: (data) => http.post("/tariffs/directions", data),
  updateDirection: (id, data) => http.put(`/tariffs/directions/${id}`, data),
  archiveDirection: (id, isArchived) =>
    http.patch(`/tariffs/directions/${id}/archive`, { isArchived }),

  // Narx versiyalari
  getVersions: (id, params) => http.get(`/tariffs/${id}/versions`, { params }),
  addVersion: (id, data) => http.post(`/tariffs/${id}/versions`, data),
  updateVersion: (id, versionId, data, params) =>
    http.put(`/tariffs/${id}/versions/${versionId}`, data, { params }),
  deleteVersion: (id, versionId) =>
    http.delete(`/tariffs/${id}/versions/${versionId}`),

  // Narxni hal qilish
  resolveForStudent: (params) => http.get("/tariffs/resolve", { params }),
  getMonthSheet: (month, params) =>
    http.get(`/tariffs/resolve/month/${month}`, { params }),
};

/** O'quvchilarga tarif biriktirish. */
export const studentTariffsAPI = {
  getAll: (params) => http.get("/student-tariffs", { params }),
  getById: (id) => http.get(`/student-tariffs/${id}`),
  getStudentHistory: (studentId) =>
    http.get(`/student-tariffs/student/${studentId}`),
  create: (data) => http.post("/student-tariffs", data),
  bulkAssign: (data) => http.post("/student-tariffs/bulk", data),
  // Standart tarifni BARCHA o'quvchilarga qo'llash. Sozlamadagi tarif
  // ishlatiladi — tanlov so'rov tanasida yuborilmaydi.
  applyDefault: (data) => http.post("/student-tariffs/apply-default", data),
  update: (id, data) => http.put(`/student-tariffs/${id}`, data),
  close: (id, endMonth) =>
    http.post(`/student-tariffs/${id}/close`, { endMonth }),
  changeTariff: (id, data) =>
    http.post(`/student-tariffs/${id}/change-tariff`, data),
  delete: (id) => http.delete(`/student-tariffs/${id}`),
};

/**
 * Oy summasi override'i — bitta oy uchun sababli maxsus summa (kech qo'shilgan,
 * kasallik, oilaviy, boshqa). Ommaviy grant `bulk` orqali. Server yozgach
 * o'sha oy hisob-fakturasini avtomat qayta muhrlaydi.
 */
export const studentMonthOverridesAPI = {
  getForStudent: (studentId) =>
    http.get(`/student-month-overrides/student/${studentId}`),
  upsert: (studentId, data) =>
    http.post(`/student-month-overrides/student/${studentId}`, data),
  bulk: (data) => http.post("/student-month-overrides/bulk", data),
  delete: (id) => http.delete(`/student-month-overrides/${id}`),
};
