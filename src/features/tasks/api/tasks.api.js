import http from "@/shared/api/http";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const tasksAPI = {
  // Barcha topshiriqlar (boshqaruv)
  getAll: (params) => http.get("/tasks", { params }),

  // Jonli hisoblagichlar ("Asosiy" tab tepasi)
  getStats: () => http.get("/tasks/stats"),

  // Hisobot: { from, to } — "YYYY-MM-DD"
  getReport: (params) => http.get("/tasks/reports", { params }),

  // Lavozimlar markazi dashboardi: { period } — day | week | month | year.
  // ⚠️ Hisobot bilan BITTA dvigatel, faqat davr preseti va doirasi boshqa
  // (rahbar — o'z bo'limi). Davr chegarasi serverda, Toshkent vaqtida.
  getDashboard: (params) => http.get("/tasks/dashboard", { params }),

  // ─── XODIMLAR TOPSHIRIQLARI — TARMOQ HISOBOTI ──────────────────
  // Faqat "Umumiy — barcha filiallar" ko'rinishida ochiladi: server
  // boshqa rejimda 403 qaytaradi (`task.controller.js`).

  // Bosh sahifadagi karta: { period } — day | week | month | year
  getNetworkPulse: (params) => http.get("/tasks/network/pulse", { params }),

  // Hujjat ko'rinishidagi hisobot (ekran uchun)
  getNetworkReport: (params) => http.get("/tasks/network/report", { params }),

  // AYNI hisobot — Word (.docx) fayli. Fayl nomini server beradi
  // (`downloadBlob` → `Content-Disposition`).
  exportNetworkReport: (params) =>
    http.get("/tasks/network/report/export", { params, responseType: "blob" }),

  // Ijrochi tanlash ro'yxati — DOIRA bo'yicha (bo'lim rahbari uchun).
  // ⚠️ `users.view` talab qilmaydi: javobda faqat ism va rol bor.
  getAssignees: (params) => http.get("/tasks/assignees", { params }),

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

  // BIRIKTIRISH — o'ziga berilgan ishni boshqa xodimga yo'naltirish.
  // ⚠️ Multipart EMAS: fayl yuborilmaydi, manba topshiriqning fayllari
  // serverda havolasi bilan ko'chadi.
  delegate: (id, data) => http.put(`/tasks/${id}/delegate`, data),
};
