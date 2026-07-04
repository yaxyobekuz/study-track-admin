import http from "@/shared/api/http";

export const attendanceReportAPI = {
  getStudentReport: (month, year) =>
    http.get("/attendance-reports/students", { params: { month, year } }),
  getStaffReport: (month, year) =>
    http.get("/attendance-reports/staff", { params: { month, year } }),
};
