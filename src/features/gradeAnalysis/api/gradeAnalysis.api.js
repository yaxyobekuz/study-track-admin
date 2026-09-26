// HTTP
import http from "@/shared/api/http";

/**
 * BAHOLAR TAHLILI — har bir o'quvchi bo'yicha fan/mavzu kesimidagi
 * o'zlashtirish, sabablar va tavsiyalar.
 *
 * ⚠️ TAHLIL FONDA ISHLANADI: `createRun` darhol `queued` holatdagi
 * tahlilni qaytaradi (202), sahifa progressni `getRun` bilan kuzatadi.
 * Raqamlarni server hisoblaydi — frontend hech narsa hisoblamaydi.
 */
export const gradeAnalysisAPI = {
  /** Tahlil oynasi: davrlar, sinflar, darajalar, sozlamalar, faol tahlil. */
  getOptions: () => http.get("/grade-analysis/options"),

  /** Bitta o'quvchini tanlash. Params: { q, classId } */
  searchStudents: (params) => http.get("/grade-analysis/students", { params }),

  /** O'quvchining barcha tahlillari (dinamika). */
  getStudentHistory: (studentId) => http.get(`/grade-analysis/students/${studentId}/history`),

  /** Tahlillar tarixi. Params: { page, limit, status, trigger } */
  getRuns: (params) => http.get("/grade-analysis/runs", { params }),

  /** Bitta tahlil — yig'ma (`overview`) va xulosa (`narrative`) bilan. */
  getRun: (id) => http.get(`/grade-analysis/runs/${id}`),

  /** Body: { period, scope, classIds?, studentId?, useAi, notify } */
  createRun: (data) => http.post("/grade-analysis/runs", data),

  /** Tahlildagi o'quvchilar. Params: { page, limit, level, classId, q, sort, risk } */
  getRunReports: ({ id, ...params }) => http.get(`/grade-analysis/runs/${id}/reports`, { params }),

  cancelRun: (id) => http.post(`/grade-analysis/runs/${id}/cancel`),
  publishRun: (id) => http.post(`/grade-analysis/runs/${id}/publish`),
  unpublishRun: (id) => http.post(`/grade-analysis/runs/${id}/unpublish`),
  deleteRun: (id) => http.delete(`/grade-analysis/runs/${id}`),

  /** To'liq hisobot — o'quvchi, ota-ona va xodim matni bilan. */
  getReport: (id) => http.get(`/grade-analysis/reports/${id}`),

  getSettings: () => http.get("/grade-analysis/settings"),
  /** Body: { weeklyEnabled?, weeklyNotify?, useAi? } */
  updateSettings: (data) => http.put("/grade-analysis/settings", data),
};
