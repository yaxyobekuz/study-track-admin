import http from "@/shared/api/http";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

/**
 * XODIM O'ZIGA O'ZI BELGILAGAN TOPSHIRIQLAR (`/self-tasks`).
 *
 * Ikki guruh, ikki xil darvoza:
 *
 *   O'ZINING — ruxsat kaliti YO'Q, id serverda tokendan olinadi
 *   (`/payroll/my` bilan AYNI doktrina). Panel hech qachon `userId`
 *   yubormaydi.
 *
 *   BOSHQARUVCHINING — `tasks.self` kaliti ortida: dashboard
 *   (`getOverview`) va butun jamoaning ro'yxati (`getAll`).
 *
 * ⚠️ Lavozimlar markazi yo'llari (`tasks.api.js`) BU YERGA ko'chirilmaydi
 * va aksincha: ikki oqim server tomonda ham alohida (`self_assigned`),
 * ya'ni bitta yo'ldan ikkalasini so'rab olish imkoniyati umuman yo'q.
 */
export const selfTasksAPI = {
  // ─── Xodimning o'zi ──────────────────────────────────────────────
  getMy: (params) => http.get("/self-tasks", { params }),
  getStats: () => http.get("/self-tasks/stats"),
  getById: (id) => http.get(`/self-tasks/${id}`),

  create: (formData) => http.post("/self-tasks", formData, multipart),
  update: (id, formData) => http.put(`/self-tasks/${id}`, formData, multipart),
  // Yakunlash — "Tekshiruvda" bosqichisiz, darhol "Yakunlangan"
  complete: (id, formData) => http.put(`/self-tasks/${id}/complete`, formData, multipart),
  extend: (id, data) => http.put(`/self-tasks/${id}/extend`, data),
  stop: (id, data) => http.put(`/self-tasks/${id}/stop`, data),
  reopen: (id, data) => http.put(`/self-tasks/${id}/reopen`, data),
  remove: (id) => http.delete(`/self-tasks/${id}`),

  // ─── O'zining doimiy (takrorlanuvchi) ishlari ────────────────────
  getMyRules: (params) => http.get("/self-tasks/rules", { params }),
  createRule: (formData) => http.post("/self-tasks/rules", formData, multipart),
  updateRule: (id, formData) => http.put(`/self-tasks/rules/${id}`, formData, multipart),
  stopRule: (id, data) => http.put(`/self-tasks/rules/${id}/stop`, data),
  resumeRule: (id) => http.put(`/self-tasks/rules/${id}/resume`),
  removeRule: (id) => http.delete(`/self-tasks/rules/${id}`),

  // ─── Boshqaruvchi (`tasks.self`) ─────────────────────────────────
  // Dashboard — Lavozimlar markazi hisobotining AYNI payload'i
  getOverview: (params) => http.get("/self-tasks/overview", { params }),
  getAll: (params) => http.get("/self-tasks/all", { params }),
  getAnyById: (id) => http.get(`/self-tasks/all/${id}`),
};
