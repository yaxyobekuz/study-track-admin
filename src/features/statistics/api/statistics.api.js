import http from "@/shared/api/http";

/**
 * Reyting yo'llari.
 *
 * ⚠️ Yo'llardagi "weekly" — TARIXIY NOM, davrni esa `period` so'rov
 * parametri aytadi ("day" | "week" | "month"). Yo'l nomi o'zgartirilmadi:
 * ayni endpointlarni o'quvchi paneli, bot va monitor ham o'qiydi va ular
 * `period` yubormaganda avvalgidek haftalik javobni oladi.
 */
export const statisticsAPI = {
  getStudentWeekly: (studentId, period, date) =>
    http.get(`/statistics/weekly/current/${studentId}`, {
      params: { ...(period ? { period } : {}), ...(date ? { date } : {}) },
    }),
  getClassRankings: (classId, params) =>
    http.get(`/statistics/weekly/class/${classId}/rankings`, { params }),
  getSchoolRankings: (params) =>
    http.get("/statistics/weekly/school/rankings", { params }),
  export: (params) =>
    http.get("/statistics/weekly/export", { params, responseType: "blob" }),
};
