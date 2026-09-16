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

  /**
   * Vedomostni Excel'ga yuklab olish.
   *
   * ⚠️ `responseType: "blob"` MAJBURIY — usiz axios ikkilik faylni
   * matn deb o'qib buzib yuboradi.
   *
   * ⚠️ Parametrlar EKRANDAGI filtrlar bilan AYNI yuboriladi: fayl
   * ko'rinib turgan ro'yxatning nusxasi bo'lishi kerak.
   */
  exportLedger: (params) =>
    http.get("/lesson-hours/ledger/export", { params, responseType: "blob" }),

  /** Bitta o'qituvchining oyi: soat, sinf kesimi, o'rinbosarlik, tarix. */
  getTeacher: (teacherId, params) =>
    http.get(`/lesson-hours/teacher/${teacherId}`, { params }),
};

/**
 * SHARTNOMA SHARTI — vedomost oynasidan oylikni to'g'ridan-to'g'ri yozish.
 *
 * ⚠️ Manzil `/payroll/salaries` ostida: yoziladigan narsa oylik qoidasi va
 * toifa, ruxsat ham `payroll.assign`. Bo'lim faqat uni CHAQIRADI.
 */
export const contractAPI = {
  /** Forma qiymatlari: amaldagi qoida, toifa, lavozim, toifalar katalogi. */
  get: (staffId, params) =>
    http.get(`/payroll/salaries/staff/${staffId}/contract`, { params }),

  /** Jonli hisob — hech narsa yozilmaydi. */
  preview: (staffId, data) =>
    http.post(`/payroll/salaries/staff/${staffId}/contract/preview`, data),

  /** Qoida va toifa bitta tranzaksiyada. */
  save: (staffId, data) =>
    http.put(`/payroll/salaries/staff/${staffId}/contract`, data),
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

  /** Tahrirlash — server faqat hali BOSHLANMAGAN yozuvga ruxsat beradi. */
  update: (id, data) => http.put(`/lesson-hours/substitutions/${id}`, data),

  /**
   * O'chirish — faqat hali boshlanmagan yozuv.
   *
   * ⚠️ `cancel` BILAN CHALKASHMASIN: bu yerda yozuv hech qachon kuchga
   * kirmagan (xato kiritilgan reja), bekor qilish esa AMALDA bo'lgan
   * yozuvni sababi bilan yopadi va tarixda qoldiradi.
   */
  remove: (id) => http.delete(`/lesson-hours/substitutions/${id}`),

  cancel: (id, reason) =>
    http.post(`/lesson-hours/substitutions/${id}/cancel`, { reason }),
};

/**
 * O'TGAN KUNLAR DARSIGA BAHO QO'YISH OYNASI.
 *
 * ⚠️ Manzil `/grades/unlocks` ostida (ruxsat `grades.unlock`): boshliq kunlar
 * oralig'ini hammaga yoki tanlangan o'qituvchilarga ochadi. Ochilgan kunda
 * baho qo'yilgan dars o'tilgan hisoblanib, soati oylikka yoziladi.
 */
export const gradingUnlockAPI = {
  /** `?status=active|expired|revoked&page&limit` → `{ data, pagination, totals }` */
  getList: (params) => http.get("/grades/unlocks", { params }),

  /** Tanlov uchun o'qituvchilar (haftalik dars soni bilan). */
  getTeachers: () => http.get("/grades/unlocks/teachers"),

  /**
   * `{ dateFrom, dateTo: "YYYY-MM-DD", scope: "all"|"selected", teacherIds,
   *    preset: "3d"|"1w"|"monthEnd"|"custom", until, reason }`
   */
  create: (data) => http.post("/grades/unlocks", data),

  revoke: (id) => http.post(`/grades/unlocks/${id}/revoke`),
};
