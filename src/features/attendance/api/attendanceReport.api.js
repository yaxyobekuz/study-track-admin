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
