// Shared
import http from "@/shared/api/http";

/**
 * O'quvchining o'qish davrlari.
 *
 * Sanalar HAR DOIM "YYYY-MM-DD" satri sifatida yuboriladi — server boshqa
 * shaklni qabul qilmaydi. Sabab: vaqtli satr host taymzonasida o'qilib,
 * proratsiyani bir kunga siljitib yuborardi.
 */
export const enrollmentAPI = {
  getAll: (params) => http.get("/student-enrollments", { params }),
  getForStudent: (studentId) =>
    http.get(`/student-enrollments/student/${studentId}`),
  getById: (id) => http.get(`/student-enrollments/${id}`),

  // CHIQIB KETGANLAR — yopilgan davrlar registri ("nega, qachon").
  // Alohida jadval yo'q: ketish fakti davrning yopilgani, shuning uchun
  // yo'l ham, ruxsat ham (`enrollment.view`) o'sha bo'limda.
  getDepartures: (params) =>
    http.get("/student-enrollments/departures", { params }),
  // Bosh sahifadagi karta — oxirgi 30 kun + so'nggi ketishlar
  getDepartureSummary: () =>
    http.get("/student-enrollments/departures/summary"),

  // O'QUVCHILAR HARAKATI — "nechtasi keldi, nechtasi ketdi va qancha
  // foizga o'zgardi". `month` | `year` | `from`+`to` (YYYYMM).
  getMovement: (params) => http.get("/student-enrollments/movement", { params }),
  // Bosh sahifadagi "O'quvchilar" kartasi (joriy oy + joriy yil)
  getMovementSummary: () => http.get("/student-enrollments/movement/summary"),
  // AYNI hisobot — Word (.docx) fayli. Fayl nomini server beradi
  // (`downloadBlob` → `Content-Disposition`).
  exportMovement: (params) =>
    http.get("/student-enrollments/movement/export", {
      params,
      responseType: "blob",
    }),

  create: (data) => http.post("/student-enrollments", data),
  update: (id, data) => http.put(`/student-enrollments/${id}`, data),
  // Yopish — "o'quvchi maktabdan ketdi" (sana + toifa + izoh)
  close: (id, data) => http.patch(`/student-enrollments/${id}/close`, data),
  // Saqlashdan OLDIN: ketish oyi va bekor qilinadigan hisob-fakturalar.
  // Hech narsa yozmaydi — POST, chunki tana (yangi sanalar) bilan ketadi.
  preview: (id, data) => http.post(`/student-enrollments/${id}/preview`, data),
  delete: (id) => http.delete(`/student-enrollments/${id}`),
};
