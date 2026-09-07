import http from "@/shared/api/http";

export const usersAPI = {
  getAll: (params) => http.get("/users", { params }),
  getAllShort: () => http.get("/users/all-short"),
  getStats: () => http.get("/users/stats"),
  getReport: (params) => http.get("/users/reports", { params }),
  getById: (id) => http.get(`/users/${id}`),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  // Telefon raqamlari — ALOHIDA endpoint va alohida ruxsat (`users.phone`):
  // `PUT /users/:id` bu maydonlarni e'tiborsiz qoldiradi. Xom (maskali)
  // qiymat yuborilsa ham bo'ladi — server normalizatsiya qiladi.
  updatePhone: (id, data) => http.put(`/users/${id}/phone`, data),
  delete: (id) => http.delete(`/users/${id}`),
  archive: (id, data) => http.put(`/users/${id}/archive`, data),
  restore: (id) => http.put(`/users/${id}/restore`),
  resetPassword: (id, data) => http.put(`/users/${id}/reset-password`, data),
  getPassword: (id) => http.get(`/users/${id}/password`),
  exportUsers: (role) =>
    http.get("/users/export", { params: { role }, responseType: "blob" }),

  // KO'P ROLLILIK — faqat OWNER (server `authorize(ROLES.OWNER)` bilan
  // yopgan). To'liq ro'yxat yuboriladi, "qo'sh"/"olib tashla" emas:
  // qisman amallarda ikkita parallel so'rov bir-birining natijasini
  // yo'q qilardi.
  setRoles: (id, extraRoles) => http.put(`/users/${id}/roles`, { extraRoles }),

  // Xodim qaysi filiallarda ishlaydi — har birida o'z roli va ruxsatlari bilan
  getBranches: (id) => http.get(`/users/${id}/branches`),
  attachBranch: (id, data) => http.post(`/users/${id}/branches`, data),
  detachBranch: (id, branchId) =>
    http.delete(`/users/${id}/branches/${branchId}`),
};
