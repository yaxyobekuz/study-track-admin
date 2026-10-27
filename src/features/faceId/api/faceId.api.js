// HTTP
import http from "@/shared/api/http";

/**
 * FACE ID — endpointlar.
 *
 * ⚠️ `.data` bu yerda OCHILMAYDI — bu qatlamning ishi faqat manzil.
 * Ochish `queries` da bo'ladi (`devices.api.js` bilan bir xil qoida).
 *
 * ⚠️ KIOSK YO'LLARI (`/api/kiosk/*`) BU YERDA YO'Q va bo'lmasligi
 * kerak: ular qurilma tokeni bilan ishlaydi va faqat kiosk dasturidan
 * chaqiriladi (`.claude/rules/face-id.md` §8).
 */

/** Kiosklar — reyestr va qurilma hayot davri. */
export const kiosksAPI = {
  getAll: (params) => http.get("/face-id/kiosks", { params }),
  getById: (id) => http.get(`/face-id/kiosks/${id}`),
  create: (data) => http.post("/face-id/kiosks", data),
  update: (id, data) => http.put(`/face-id/kiosks/${id}`, data),
  updatePin: (id, data) => http.put(`/face-id/kiosks/${id}/pin`, data),

  /**
   * Biriktirish kodi.
   * ⚠️ Kod javobda FAQAT BIR MARTA keladi — bazada hash bilan yotadi.
   * Yo'qotilsa yangisi beriladi.
   */
  issueCode: (id) => http.post(`/face-id/kiosks/${id}/pairing-code`),
  cancelCode: (id) => http.delete(`/face-id/kiosks/${id}/pairing-code`),

  revoke: (id, data) => http.post(`/face-id/kiosks/${id}/revoke`, data),
  suspend: (id, data) => http.post(`/face-id/kiosks/${id}/suspend`, data),
  resume: (id) => http.post(`/face-id/kiosks/${id}/resume`),
  remove: (id) => http.delete(`/face-id/kiosks/${id}`),
};

/** Yuz profillari va namunalar. */
export const faceProfilesAPI = {
  /** Odamlar ro'yxati — ro'yxatga olingan va OLINMAGANLAR birga. */
  getPeople: (params) => http.get("/face-id/people", { params }),
  getProfile: (userId) => http.get(`/face-id/profiles/${userId}`),

  /**
   * Yuz namunasini saqlash.
   * ⚠️ `embedding` — kiosk/panel hisoblagan vektor (sonlar massivi).
   * Rasm (`snapshot`) ixtiyoriy va maxfiy saqlanadi.
   */
  addSample: (userId, data) => http.post(`/face-id/profiles/${userId}/samples`, data),
  removeSample: (id) => http.delete(`/face-id/samples/${id}`),
  removeProfile: (userId) => http.delete(`/face-id/profiles/${userId}`),
  setActive: (userId, data) => http.patch(`/face-id/profiles/${userId}/active`, data),
};

/** Urinishlar jurnali va manzara. */
export const faceEventsAPI = {
  getAll: (params) => http.get("/face-id/events", { params }),
  getOverview: (params) => http.get("/face-id/overview", { params }),
};

/** Sozlama. */
export const faceSettingsAPI = {
  get: () => http.get("/face-id/settings"),
  update: (data) => http.put("/face-id/settings", data),
  /** ⚠️ MIGRATSIYA, sozlama emas — `confirm: true` talab qiladi. */
  switchModel: (data) => http.post("/face-id/settings/model", data),
};
