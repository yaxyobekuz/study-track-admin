// HTTP
import http from "@/shared/api/http";

/**
 * XAVFSIZLIK — o'qish va ikkita jiddiy amal.
 *
 * ⚠️ AMALLAR MAYDA RUXSATLAR BILAN AJRATILGAN (server tomonida):
 * ro'yxatni ko'rish (`security.sessions`) va seansni TUGATISH
 * (`security.revoke`) bir xil huquq emas — ikkinchisi boshqa odamning
 * ochiq ishini uzadi.
 */
export const securityAPI = {
  /** Butun manzara. Params: { days } */
  getOverview: (params) => http.get("/security/overview", { params }),

  /** Seanslar. Params: { status, userId, page, limit } */
  getSessions: (params) => http.get("/security/sessions", { params }),

  /** Ogohlantirishlar. Params: { status, severity, type, page, limit } */
  getAlerts: (params) => http.get("/security/alerts", { params }),

  /** Kirish urinishlari. Params: { success, username, page, limit } */
  getAttempts: (params) => http.get("/security/attempts", { params }),

  /** Bitta foydalanuvchining xavfsizlik kartasi. */
  getUser: (userId, params) =>
    http.get(`/security/users/${userId}`, { params }),

  /** Ogohlantirish holatini o'zgartirish. */
  updateAlert: (id, data) => http.put(`/security/alerts/${id}`, data),

  /** Bitta seansni tugatish. */
  revokeSession: (id) => http.delete(`/security/sessions/${id}`),

  /** Foydalanuvchining BARCHA seanslarini tugatish. */
  revokeUserSessions: (userId) =>
    http.delete(`/security/users/${userId}/sessions`),
};

export default securityAPI;
