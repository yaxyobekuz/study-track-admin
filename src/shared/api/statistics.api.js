import http from "@/shared/api/http";

export const statisticsAPI = {
  getStudentWeekly: (studentId) =>
    http.get(`/statistics/weekly/current/${studentId}`),
  getClassRankings: (classId, params) =>
    http.get(`/statistics/weekly/class/${classId}/rankings`, { params }),
  getSchoolRankings: (params) =>
    http.get("/statistics/weekly/school/rankings", { params }),
  export: (params) =>
    http.get("/statistics/weekly/export", { params, responseType: "blob" }),
};
