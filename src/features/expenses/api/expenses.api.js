// HTTP
import http from "@/shared/api/http";

/** Kategoriyalar katalogi — "Kommunal", "Kitob sotuvi", "Homiylik". */
export const expenseCategoriesAPI = {
  getAll: (params) => http.get("/expense-categories", { params }),
  create: (data) => http.post("/expense-categories", data),
  update: (id, data) => http.put(`/expense-categories/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/expense-categories/${id}/archive`, { isArchived }),
  // O'chirish — server faqat hech qayerda ishlatilmagan kategoriyaga ruxsat
  // beradi, aks holda sababini aytib rad etadi
  remove: (id) => http.delete(`/expense-categories/${id}`),
};

/**
 * Xarajat yozuvlari.
 *
 * ⚠️ `update` YO'Q va bo'lmasligi ham kerak: xarajat kassa daftariga yozilgan
 * hujjat. Xato yozuv tahrirlanmaydi — bekor qilinib, qaytadan kiritiladi.
 */
export const expensesAPI = {
  getAll: (params) => http.get("/expenses", { params }),
  create: (data) => http.post("/expenses", data),
  void: (id, reason) => http.post(`/expenses/${id}/void`, { reason }),
};

/**
 * Limit oshirish so'rovlari — xodim yuboradi, admin ko'rib chiqadi.
 * Tasdiqlansa kategoriya limiti so'ralgan qiymatga oshadi.
 */
export const expenseLimitRequestsAPI = {
  submit: (data) => http.post("/expense-limit-requests", data),
  getMine: (params) => http.get("/expense-limit-requests/mine", { params }),
  getAll: (params) => http.get("/expense-limit-requests", { params }),
  review: (id, data) => http.post(`/expense-limit-requests/${id}/review`, data),
};
