// HTTP
import http from "@/shared/api/http";

/** Kategoriyalar katalogi — "Ijara", "Kitob sotuvi", "Homiylik". */
export const incomeCategoriesAPI = {
  getAll: (params) => http.get("/income-categories", { params }),
  create: (data) => http.post("/income-categories", data),
  update: (id, data) => http.put(`/income-categories/${id}`, data),
  archive: (id, isArchived) =>
    http.patch(`/income-categories/${id}/archive`, { isArchived }),
};

/**
 * Kirim yozuvlari.
 *
 * ⚠️ `update` YO'Q va bo'lmasligi ham kerak: kirim kassa daftariga yozilgan
 * hujjat. Xato yozuv tahrirlanmaydi — bekor qilinib, qaytadan kiritiladi.
 */
export const externalIncomesAPI = {
  getAll: (params) => http.get("/external-incomes", { params }),
  create: (data) => http.post("/external-incomes", data),
  void: (id, reason) => http.post(`/external-incomes/${id}/void`, { reason }),
};
