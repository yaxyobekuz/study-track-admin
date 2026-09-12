// HTTP
import http from "@/shared/api/http";

/**
 * DARS JADVALI — GOOGLE SHEETS ORQALI BOSHQARISH.
 *
 * ⚠️ `.data` bu yerda OCHILMAYDI — bu qatlamning ishi faqat manzil.
 * Ochish `queries` da bo'ladi.
 *
 * ⚠️ Qo'llash / almashtirish / tiklash so'rovlari `activeHash` va
 * `newHash` ni EKRANDA KO'RSATILGAN ko'rinishdan oladi. Xato javobidagi
 * xeshlar bilan qayta yuborilmaydi: 409 bo'lsa ko'rinish qayta o'qiladi
 * va odam qaytadan tasdiqlaydi.
 */
export const scheduleSyncAPI = {
  /** Jadval manbai: `{ mode: "platform" | "sheet" }`. */
  getMode: () => http.get("/schedule-sync/mode"),

  /** Bo'lim holati (havola, oxirgi tekshiruv, arxiv, huquqlar). */
  getStatus: () => http.get("/schedule-sync/status"),

  /** Havola va varaqni saqlash: `{ sheetUrl, sheetTab, autoCheck? }`. */
  updateConfig: (data) => http.put("/schedule-sync/config", data),

  /** Havoladagi KO'RINADIGAN varaqlar ro'yxati. */
  inspect: (sheetUrl) => http.post("/schedule-sync/inspect", { sheetUrl }),

  /** Sheet'ni hozir o'qish → `{ created, revision }`. */
  check: () => http.post("/schedule-sync/check"),

  getRevisions: (params) => http.get("/schedule-sync/revisions", { params }),

  /** O'qilgan holatning to'liq ko'rinishi (farq, ta'sir, ogohlantirishlar). */
  getRevision: (id) => http.get(`/schedule-sync/revisions/${id}`),

  /** `{ activeHash, newHash, acknowledged }` */
  applyRevision: (id, data) =>
    http.post(`/schedule-sync/revisions/${id}/apply`, data),

  /** `{ reason? }` */
  rejectRevision: (id, data) =>
    http.post(`/schedule-sync/revisions/${id}/reject`, data),

  /** Saqlangan moslashlar + tanlov ro'yxatlari. */
  getMappings: () => http.get("/schedule-sync/mappings"),

  /** Barcha o'zgarishlar BITTA so'rovda; `targetId: null` — moslashni o'chirish. */
  saveMappings: (items) => http.put("/schedule-sync/mappings", { items }),

  /** Manbani almashtirish (platforma ↔ sheet). */
  switchSource: (data) => http.post("/schedule-sync/switch", data),

  getSnapshots: (params) => http.get("/schedule-sync/snapshots", { params }),

  /** Versiya va uni tiklasa nima o'zgarishi. */
  getSnapshot: (id) => http.get(`/schedule-sync/snapshots/${id}`),

  /** `{ activeHash, newHash, acknowledged }` */
  restoreSnapshot: (id, data) =>
    http.post(`/schedule-sync/snapshots/${id}/restore`, data),
};
