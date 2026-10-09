import http from "@/shared/api/http";

export const issuesAPI = {
  // ── Muammolar ──
  getAll: (params) => http.get("/issues", { params }),
  getCounts: () => http.get("/issues/counts"),
  getById: (id) => http.get(`/issues/${id}`),
  review: (id, data) => http.patch(`/issues/${id}/review`, data),
  delete: (id) => http.delete(`/issues/${id}`),

  // ── Hisobot ──
  getReport: (params) => http.get("/issues/report", { params }),

  // ── Kategoriyalar ──
  // `getCategories` — boshqaruv ro'yxati (noaktivlar + sanoq bilan),
  // `getActiveCategories` — filtr uchun qisqa ro'yxat. Ikkisi boshqa-boshqa
  // ruxsat ortida (`issues.categories` / `issues.view`).
  getCategories: () => http.get("/issues/categories"),
  getActiveCategories: () => http.get("/issues/categories/active"),
  createCategory: (data) => http.post("/issues/categories", data),
  updateCategory: (id, data) => http.put(`/issues/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/issues/categories/${id}`),
};
