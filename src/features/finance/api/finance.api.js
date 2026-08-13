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
  update: (id, data) => http.put(`/student-tariffs/${id}`, data),
  close: (id, endMonth) =>
    http.post(`/student-tariffs/${id}/close`, { endMonth }),
  changeTariff: (id, data) =>
    http.post(`/student-tariffs/${id}/change-tariff`, data),
  delete: (id) => http.delete(`/student-tariffs/${id}`),
};
