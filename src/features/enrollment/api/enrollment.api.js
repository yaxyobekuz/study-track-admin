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

  create: (data) => http.post("/student-enrollments", data),
  update: (id, data) => http.put(`/student-enrollments/${id}`, data),
  // Yopish — "o'quvchi maktabdan ketdi" (sana + toifa + izoh)
  close: (id, data) => http.patch(`/student-enrollments/${id}/close`, data),
  delete: (id) => http.delete(`/student-enrollments/${id}`),
};
