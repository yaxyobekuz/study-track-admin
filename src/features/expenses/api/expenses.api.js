// HTTP
import http from "@/shared/api/http";

/** Kategoriyalar katalogi — "Kommunal", "Kitob sotuvi", "Homiylik". */
export const expenseCategoriesAPI = {
  getAll: (params) => http.get("/expense-categories", { params }),
  create: (data) => http.post("/expense-categories", data),
  update: (id, data) => http.put(`/expense-categories/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/expense-categories/${id}/archive`, { isArchived }),
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
