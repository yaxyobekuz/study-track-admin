import http from "@/shared/api/http";

export const premiumAPI = {
  // Sozlamalar
  getSettings: () => http.get("/premium/admin/settings"),
  updateSettings: (data) => http.put("/premium/admin/settings", data),

  // Hisobot
  getStats: () => http.get("/premium/admin/stats"),
  getSubscriptions: (params) =>
    http.get("/premium/admin/subscriptions", { params }),
  exportSubscriptions: (params) =>
    http.get("/premium/admin/subscriptions/export", {
      params,
      responseType: "blob",
    }),

  // Qo'lda berish / bekor qilish
  grant: (data) => http.post("/premium/admin/grant", data),
  revoke: (data) => http.post("/premium/admin/revoke", data),

  // Emoji boshqaruvi
  getEmojis: () => http.get("/premium/admin/emojis"),
  createEmoji: (formData) =>
    http.post("/premium/admin/emojis", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateEmoji: (id, formData) =>
    http.put(`/premium/admin/emojis/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteEmoji: (id) => http.delete(`/premium/admin/emojis/${id}`),
};
