import http from "@/shared/api/http";

export const attendanceReportAPI = {
  /**
   * @param {number} month
   * @param {number} year
   * @param {{day?: string, compareDay?: string, compareMonth?: number,
   *          compareYear?: number}} [compare] - taqqoslash parametrlari.
   *   Sanalar ISO ("2026-09-06") — bu MASHINA qiymati, ekranga chiqmaydi
   *   (`.claude/rules/dates.md` §3): yorliqni server tayyor qaytaradi.
   */
  getStudentReport: (month, year, compare = {}) =>
    http.get("/attendance-reports/students", {
      params: { month, year, ...compare },
    }),
  /**
   * So'nggi N kundagi davomat trendi (bosh sahifadagi grafik) →
   * `{ byDay, summary }`. Foiz SERVERDAN KELMAYDI — sanoqlardan
   * hisoblanadi (umumiy ko'rinishda foiz o'rtachalanib, sanoq esa
   * qo'shilib ketardi).
   * @param {number} [days=30]
   */
  getStudentTrend: (days = 30) =>
    http.get("/attendance-reports/students/trend", { params: { days } }),
  /**
   * Bitta sinf hisoboti.
   * @param {string} classId
   * @param {{period: "day"|"month"|"year", date?: string, month?: number,
   *          year?: number}} params - `date` ISO ("2026-09-06"), mashina qiymati
   */
  getClassReport: (classId, params) =>
    http.get(`/attendance-reports/students/classes/${classId}`, { params }),
  getStaffReport: (month, year) =>
    http.get("/attendance-reports/staff", { params: { month, year } }),
};
