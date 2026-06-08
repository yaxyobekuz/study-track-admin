import http from "@/shared/api/http";

export const testSeasonsAPI = {
  getAll: (params = {}) => http.get("/test-seasons", { params }),
  getActive: () => http.get("/test-seasons/active"),
  getOne: (id) => http.get(`/test-seasons/${id}`),
  create: (data) => http.post("/test-seasons", data),
  update: (id, data) => http.put(`/test-seasons/${id}`, data),
  setStatus: (id, status) =>
    http.patch(`/test-seasons/${id}/status`, { status }),
  delete: (id) => http.delete(`/test-seasons/${id}`),

  // E'lon (bot orqali)
  getAnnounceClasses: (id) => http.get(`/test-seasons/${id}/announce/classes`),
  announce: (id, data) => http.post(`/test-seasons/${id}/announce`, data),

  // Mavsum mukofotlari
  getStats: (id, params = {}) =>
    http.get(`/test-seasons/${id}/stats`, { params }),
  getClassStats: (id, classId) =>
    http.get(`/test-seasons/${id}/class/${classId}/stats`),
  setAbsoluteTiers: (id, tiers) =>
    http.put(`/test-seasons/${id}/absolute-tiers`, { tiers }),
  setClassTiers: (id, classId, tiers) =>
    http.put(`/test-seasons/${id}/class/${classId}/tiers`, { tiers }),
  previewDistribution: (id) =>
    http.get(`/test-seasons/${id}/distribute/preview`),
  distributeCoins: (id, force = false) =>
    http.post(`/test-seasons/${id}/distribute`, { force }),
};
