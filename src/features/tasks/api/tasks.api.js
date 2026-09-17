import http from "@/shared/api/http";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const tasksAPI = {
  // Barcha topshiriqlar (boshqaruv)
  getAll: (params) => http.get("/tasks", { params }),

  // Jonli hisoblagichlar ("Asosiy" tab tepasi)
  getStats: () => http.get("/tasks/stats"),

  // Hisobot: { from, to } — "YYYY-MM-DD"
  getReport: (params) => http.get("/tasks/reports", { params }),

  // Topshiriq qoidalari
  getSettings: () => http.get("/tasks/settings"),
  updateSettings: (data) => http.put("/tasks/settings", data),

  // O'z topshiriqlari (authenticated user)
  getMy: (params) => http.get("/tasks/my", { params }),

  // Bitta topshiriq tafsilotlari
  getById: (id) => http.get(`/tasks/${id}`),

  // Topshiriq yaratish (multipart/form-data)
  create: (formData) => http.post("/tasks", formData, multipart),

  // Tahrirlash (multipart/form-data: yangi fayllar + removeAttachmentKeys)
  update: (id, formData) => http.put(`/tasks/${id}`, formData, multipart),

  // O'chirish
  remove: (id) => http.delete(`/tasks/${id}`),

  // Ijrochi topshiriqni yakunladi deb belgilaydi (multipart/form-data)
  submitCompletion: (id, formData) =>
    http.put(`/tasks/${id}/submit`, formData, multipart),

  // Tasdiqlash / rad etish
  approve: (id, data) => http.put(`/tasks/${id}/approve`, data),
  reject: (id, data) => http.put(`/tasks/${id}/reject`, data),

  // To'xtatish
  stop: (id, data) => http.put(`/tasks/${id}/stop`, data),

  // Muddatni uzaytirish
  extend: (id, data) => http.put(`/tasks/${id}/extend`, data),

  // Yakunlangan / to'xtatilgan topshiriqni qayta ochish
  reopen: (id, data) => http.put(`/tasks/${id}/reopen`, data),
};
