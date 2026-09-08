// HTTP
import http from "@/shared/api/http";

/**
 * DARS SOATLARI VA MAOSH — endpointlar.
 *
 * ⚠️ `.data` bu yerda OCHILMAYDI — bu qatlamning ishi faqat manzil.
 * Ochish `queries` da bo'ladi (`payroll.api.js` bilan bir xil qoida).
 */
export const lessonHoursAPI = {
  /** Boshliq ko'rinishi: jami soat, prognoz, rejimlar kesimi, egri chiziq. */
  getOverview: (params) => http.get("/lesson-hours", { params }),

  /** Vedomost: barcha o'qituvchilar bir ro'yxatda (sahifalanmaydi). */
  getLedger: (params) => http.get("/lesson-hours/ledger", { params }),

  /** Bitta o'qituvchining oyi: soat, sinf kesimi, o'rinbosarlik, tarix. */
  getTeacher: (teacherId, params) =>
    http.get(`/lesson-hours/teacher/${teacherId}`, { params }),
};

/**
 * DARS O'RINBOSARLIGI.
 *
 * ⚠️ ATAMA: "almashtirish" EMAS. Tizimda bu so'z FILIAL almashtirishni
 * bildiradi, shuning uchun butun modulda "o'rinbosar".
 */
export const substitutionAPI = {
  getList: (params) => http.get("/lesson-hours/substitutions", { params }),

  getOne: (id) => http.get(`/lesson-hours/substitutions/${id}`),

  /**
   * O'qituvchilar ro'yxati (haftalik dars soni bilan).
   *
   * ⚠️ `/schedules/teachers` EMAS: u `schedules.view` talab qiladi va
   * o'rinbosarlik biriktiradigan xodimda jadval bo'limi ochilib ketardi.
   */
  getTeachers: () => http.get("/lesson-hours/substitutions/teachers"),

  /** Tanlov ekrani: o'qituvchining shu davrda ko'chirsa bo'ladigan darslari. */
  getAvailable: (teacherId, params) =>
    http.get(`/lesson-hours/substitutions/available/${teacherId}`, { params }),

  create: (data) => http.post("/lesson-hours/substitutions", data),

  cancel: (id, reason) =>
    http.post(`/lesson-hours/substitutions/${id}/cancel`, { reason }),
};
