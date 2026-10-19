import http from "@/shared/api/http";

export const certificatesAPI = {
  // Rejalar ro'yxati — `{ search, classId, trackId, status, due, month, page, limit }`
  getPlans: (params) => http.get("/certificates", { params }),

  // Statistika — `{ classId }`
  getStats: (params) => http.get("/certificates/stats", { params }),

  // Yo'nalishlar katalogi — `{ archived, usage }`
  getTracks: (params) => http.get("/certificates/tracks", { params }),
  createTrack: (payload) => http.post("/certificates/tracks", payload),
  updateTrack: (id, payload) => http.patch(`/certificates/tracks/${id}`, payload),

  // O'quvchi tanlagichi — `{ search, classId, limit }` (ruxsat: `certificates.manage`)
  searchStudents: (params) => http.get("/certificates/students", { params }),

  // Bitta o'quvchining rejalari — `{ history }`
  getStudentPlans: (studentId, params) =>
    http.get(`/certificates/student/${studentId}`, { params }),

  // "Nega bu foiz" — fanlar va ularning o'tilgan / qolgan mavzulari
  getStudentProgress: (studentId) =>
    http.get(`/certificates/student/${studentId}/progress`),

  createPlan: (payload) => http.post("/certificates", payload),
  updatePlan: (id, payload) => http.patch(`/certificates/${id}`, payload),
  cancelPlan: (id, payload) => http.post(`/certificates/${id}/cancel`, payload),
  markPassed: (id) => http.post(`/certificates/${id}/passed`),

  /**
   * Fayldan yuklash — IKKI QADAM.
   *
   * ⚠️ `preview` hech narsa YOZMAYDI: u faqat faylni o'qib, o'quvchilarni
   * moslashtirib qaytaradi. Yozish — `confirm`, va u ODAM KO'RGAN
   * qatorlarni o'zi qaytarib yuboradi.
   *
   * ⚠️ `Content-Type` ni QO'LDA berish SHART: http mijozining sukutdagi
   * JSON sarlavhasi bilan axios faylni tashlab ketardi.
   */
  previewImport: (file) => {
    const form = new FormData();
    form.append("file", file);
    return http.post("/certificates/import/preview", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  confirmImport: (payload) => http.post("/certificates/import/confirm", payload),
};
