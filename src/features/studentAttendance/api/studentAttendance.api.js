import http from "@/shared/api/http";

export const studentAttendanceAPI = {
  getAllRecords: (params) => http.get("/student-attendance", { params }),
  getTodayClass: (classId) => http.get(`/student-attendance/today/${classId}`),
  getClasses: () => http.get("/student-attendance/classes"),
  getClassMonthRecords: (classId, month, year) =>
    http.get(`/student-attendance/class/${classId}`, { params: { month, year } }),
  getStudentMonthRecords: (studentId, month, year) =>
    http.get(`/student-attendance/student/${studentId}`, {
      params: { month, year },
    }),
};
