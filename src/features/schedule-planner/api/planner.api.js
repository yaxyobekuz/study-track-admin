import http from "@/shared/api/http";

export const plannerAPI = {
  // Yuklama ("Asosiy" tab)
  getLoads: () => http.get("/planner/loads"),
  saveLoad: (data) => http.put("/planner/loads", data),

  // Bandlik
  getAvailability: () => http.get("/planner/availability"),
  setAvailability: (teacherId, slots) =>
    http.put(`/planner/availability/${teacherId}`, { slots }),
  toggleSlot: (teacherId, day, order) =>
    http.patch(`/planner/availability/${teacherId}/toggle`, { day, order }),
  fillFromWorkSchedule: (teacherId) =>
    http.post(`/planner/availability/${teacherId}/from-work-schedule`),

  // Dars taqsimoti varag'i (mustaqil tab)
  getDistribution: () => http.get("/planner/distribution"),
  saveDistribution: (data) => http.put("/planner/distribution", { data }),

  // Sozlamalar  getSettings: () => http.get("/planner/settings"),
  updateSettings: (data) => http.put("/planner/settings", data),

  // Shakllantirish
  getPreflight: () => http.get("/planner/preflight"),
  generate: (data) => http.post("/planner/runs", data),

  // Variantlar
  getRuns: () => http.get("/planner/runs"),
  getRun: (id) => http.get(`/planner/runs/${id}`),
  renameRun: (id, name) => http.patch(`/planner/runs/${id}`, { name }),
  deleteRun: (id) => http.delete(`/planner/runs/${id}`),
  exportRun: (id) =>
    http.get(`/planner/runs/${id}/export`, { responseType: "blob" }),

  // Variantdagi darslar
  addLesson: (runId, data) => http.post(`/planner/runs/${runId}/lessons`, data),
  updateLesson: (runId, lessonId, data) =>
    http.patch(`/planner/runs/${runId}/lessons/${lessonId}`, data),
  removeLesson: (runId, lessonId) =>
    http.delete(`/planner/runs/${runId}/lessons/${lessonId}`),
};
