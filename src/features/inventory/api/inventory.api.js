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
  // ⚠️ O'CHIRISH ARXIVLASH EMAS: arxivlash jihozni tanlagichlardan olib
  // tashlaydi-yu tarixni saqlaydi, o'chirish esa yozuvning O'ZI bo'lmasligi
  // kerakligini bildiradi (kiritish xatosi). Tarixi bor jihozni server rad
  // etadi — shuning uchun tugmadan OLDIN `getItemUsage` o'qiladi.
  deleteItem: (id) => http.delete(`/inventory/items/${id}`),
  getItemUsage: (id) => http.get(`/inventory/items/${id}/usage`),

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
 * ⚠️ `update` miqdorni TO'G'RIDAN-TO'G'RI YOZMAYDI. Oyna aniq qiymat
 * yuboradi ("hozir 1 → 3"), server esa farqni LOCK ostida hisoblab
 * daftarga `adjustment` qatori sifatida yozadi. Miqdorning yagona
 * haqiqat manbai daftar bo'lib qoladi: to'g'ridan-to'g'ri yozish daftar
 * bilan xatlovni bir-biriga to'g'ri kelmaydigan qilib qo'yardi.
 *
 * ⚠️ O'sha `update` bilan XONA va JIHOZ ham almashtiriladi. Juftlik
 * o'zgarsa bu tahrir emas, KO'CHIRISH bo'ladi (`@@unique([locationId,
 * itemId])` — boshqa juftlik boshqa QATOR): daftarga ikkita qator
 * tushadi (`transfer_out` + `transfer_in`) va javobda BOSHQA qator
 * qaytadi. Javobdagi `moved` shu ikki holatni ajratadi.
 */
export const stockAPI = {
  getAll: (params) => http.get("/inventory/stocks", { params }),
  getByLocation: (locationId, params) =>
    http.get(`/inventory/stocks/location/${locationId}`, { params }),
  add: (data) => http.post("/inventory/stocks", data),
  repair: (data) => http.post("/inventory/stocks/repair", data),
  writeOff: (data) => http.post("/inventory/stocks/write-off", data),
  adjust: (data) => http.post("/inventory/stocks/adjust", data),
  update: (id, data) => http.put(`/inventory/stocks/${id}`, data),
  // ⚠️ axios'da DELETE TANASI `{ data }` ichida yuboriladi — ikkinchi
  // argument sifatida berilsa u konfiguratsiya deb qabul qilinadi va
  // sabab serverga umuman yetib bormaydi (server esa uni MAJBURIY qiladi).
  remove: (id, data) => http.delete(`/inventory/stocks/${id}`, { data }),
  getUsage: (id) => http.get(`/inventory/stocks/${id}/usage`),
  getMovements: (params) => http.get("/inventory/movements", { params }),
};

/**
 * O'TKAZMA — topshirish-qabul qilish akti.
 *
 * Xatlovdan alohida, chunki o'tkazma HUJJAT: bir aktda bir nechta jihoz,
 * qaysi xonaga va KIMGA topshirilgani, izohi bilan. Miqdor daftariga
 * qatorlar baribir yoziladi — akt ularning konteksti.
 */
export const transfersAPI = {
  getAll: (params) => http.get("/inventory/transfers", { params }),
  getById: (id) => http.get(`/inventory/transfers/${id}`),
  create: (data) => http.post("/inventory/transfers", data),
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
  // "Nega yo'qotdik" kesimi — jihoz kesimi "nima sinadi" degan savolga
  // javob beradi, bu esa "nega" degan savolga
  getByReason: (params) => http.get("/inventory/reports/reasons", { params }),
  getMonitoring: (params) => http.get("/inventory/reports/monitoring", { params }),
  getDebtors: (params) => http.get("/inventory/reports/debtors", { params }),
  getSettings: () => http.get("/inventory/settings"),
  updateSettings: (data) => http.put("/inventory/settings", data),
  // Faol to'lov turlari — faqat id va nom (kassa qoldig'i yo'q). Undiruv
  // oynasi va standart to'lov turi tanlagichi uchun; `finance.view` shart emas.
  getPaymentAccounts: () => http.get("/inventory/payment-accounts"),
};
