// HTTP
import http from "@/shared/api/http";

/**
 * INVENTAR — moddiy-texnik baza.
 *
 * Uchta mustaqil API guruhi, uchta ruxsat bo'limi:
 *   inventoryAPI  → katalog va xatlov      (`inventory.*`)
 *   checksAPI     → kunlik monitoring      (`monitoring.*`)
 *   damagesAPI    → zarar va undiruv       (`damages.*`)
 */

/** Toifalar, jihoz turlari va xonalar katalogi. */
export const catalogAPI = {
  getCategories: (params) => http.get("/inventory/categories", { params }),
  createCategory: (data) => http.post("/inventory/categories", data),
  updateCategory: (id, data) => http.put(`/inventory/categories/${id}`, data),
  archiveCategory: (id, isArchived) =>
    http.patch(`/inventory/categories/${id}/archive`, { isArchived }),

  getItems: (params) => http.get("/inventory/items", { params }),
  getActiveItems: (params) => http.get("/inventory/items/active", { params }),
  createItem: (data) => http.post("/inventory/items", data),
  updateItem: (id, data) => http.put(`/inventory/items/${id}`, data),
  archiveItem: (id, isArchived) =>
    http.patch(`/inventory/items/${id}/archive`, { isArchived }),

  getLocations: (params) => http.get("/inventory/locations", { params }),
  getActiveLocations: () => http.get("/inventory/locations/active"),
  getLocationById: (id) => http.get(`/inventory/locations/${id}`),
  createLocation: (data) => http.post("/inventory/locations", data),
  updateLocation: (id, data) => http.put(`/inventory/locations/${id}`, data),
  archiveLocation: (id, isArchived) =>
    http.patch(`/inventory/locations/${id}/archive`, { isArchived }),
};

/**
 * XATLOV va miqdor daftari.
 *
 * ⚠️ `updateStock` YO'Q va bo'lmasligi ham kerak: miqdor faqat DAFTAR
 * orqali o'zgaradi (qo'shish / ta'mirlash / hisobdan chiqarish /
 * ko'chirish / to'g'rilash). To'g'ridan-to'g'ri yozish daftar bilan
 * xatlovni bir-biriga to'g'ri kelmaydigan qilib qo'yardi.
 */
export const stockAPI = {
  getAll: (params) => http.get("/inventory/stocks", { params }),
  getByLocation: (locationId, params) =>
    http.get(`/inventory/stocks/location/${locationId}`, { params }),
  add: (data) => http.post("/inventory/stocks", data),
  repair: (data) => http.post("/inventory/stocks/repair", data),
  writeOff: (data) => http.post("/inventory/stocks/write-off", data),
  adjust: (data) => http.post("/inventory/stocks/adjust", data),
  transfer: (data) => http.post("/inventory/stocks/transfer", data),
  getMovements: (params) => http.get("/inventory/movements", { params }),
};

/** Kunlik monitoring hisoboti. */
export const checksAPI = {
  getAll: (params) => http.get("/inventory-checks", { params }),
  getById: (id) => http.get(`/inventory-checks/${id}`),
  getPending: (params) => http.get("/inventory-checks/pending", { params }),
  // IDEMPOTENT: shu kun uchun varaq bo'lsa o'sha qaytadi
  open: (data) => http.post("/inventory-checks", data),
  updateLines: (id, data) => http.put(`/inventory-checks/${id}/lines`, data),
  // ⚠️ `multipart/form-data` sarlavhasi MAJBURIY: http mijozining standart
  // sarlavhasi `application/json`, u bilan axios FormData'ni JSON'ga aylantirib
  // yuboradi va fayllar jimgina yo'qoladi (kodbazadagi boshqa yuklashlar
  // bilan bir xil qoida).
  attachFiles: (id, lineId, formData) =>
    http.post(`/inventory-checks/${id}/lines/${lineId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  submit: (id, data) => http.post(`/inventory-checks/${id}/submit`, data),
  remove: (id) => http.delete(`/inventory-checks/${id}`),
};

/**
 * MODDIY ZARAR — hodisa, aybdorga yozilgan qarz va undiruv.
 *
 * ⚠️ Zarar va qarz summasini o'zgartiradigan metod YO'Q: ikkalasi ham
 * MUHRLANGAN. Xato bo'lsa bekor qilinadi va qaytadan kiritiladi.
 */
export const damagesAPI = {
  getAll: (params) => http.get("/damages", { params }),
  getById: (id) => http.get(`/damages/${id}`),
  // Rasm biriktirilishi mumkin — FormData bilan yuboriladi. Sarlavha
  // majburiy: `checksAPI.attachFiles` dagi izohga qarang.
  create: (formData) =>
    http.post("/damages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  waive: (id, reason) => http.post(`/damages/${id}/waive`, { reason }),
  unwaive: (id) => http.post(`/damages/${id}/unwaive`),
  cancel: (id, reason) => http.post(`/damages/${id}/cancel`, { reason }),

  getCharges: (params) => http.get("/damages/charges", { params }),
  getChargeById: (id) => http.get(`/damages/charges/${id}`),
  createCharges: (damageId, data) => http.post(`/damages/${damageId}/charges`, data),
  updateCharge: (id, data) => http.put(`/damages/charges/${id}`, data),
  cancelCharge: (id, reason) => http.post(`/damages/charges/${id}/cancel`, { reason }),

  /** Bitta odamning qarzi — profildagi "qarzdorlik" bloki. */
  getPersonSummary: (personId) => http.get(`/damages/person/${personId}`),

  getPayments: (params) => http.get("/damages/payments", { params }),
  previewPayment: (data) => http.post("/damages/payments/preview", data),
  createPayment: (data) => http.post("/damages/payments", data),
  voidPayment: (id, reason) => http.post(`/damages/payments/${id}/void`, { reason }),
};

/** Hisobotlar va sozlamalar. */
export const inventoryReportsAPI = {
  getSummary: (params) => http.get("/inventory/summary", { params }),
  getByLocation: (params) => http.get("/inventory/reports/locations", { params }),
  getByItem: (params) => http.get("/inventory/reports/items", { params }),
  getMonitoring: (params) => http.get("/inventory/reports/monitoring", { params }),
  getDebtors: (params) => http.get("/inventory/reports/debtors", { params }),
  getSettings: () => http.get("/inventory/settings"),
  updateSettings: (data) => http.put("/inventory/settings", data),
  // Faol to'lov turlari — faqat id va nom (kassa qoldig'i yo'q). Undiruv
  // oynasi va standart to'lov turi tanlagichi uchun; `finance.view` shart emas.
  getPaymentAccounts: () => http.get("/inventory/payment-accounts"),
};
