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
  getStaffReport: (month, year) =>
    http.get("/attendance-reports/staff", { params: { month, year } }),
};
