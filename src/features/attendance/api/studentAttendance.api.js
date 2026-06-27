import http from "@/shared/api/http";

export const studentAttendanceAPI = {
  getAllRecords: (params) => http.get("/student-attendance", { params }),
  getTodayClass: (classId, date) =>
    http.get(`/student-attendance/today/${classId}`, { params: { date } }),
  getTodayAll: (params) => http.get("/student-attendance/today", { params }),
  mark: (data) => http.post("/student-attendance/mark", data),
  getClasses: () => http.get("/student-attendance/classes"),
  getClassMonthRecords: (classId, month, year) =>
    http.get(`/student-attendance/class/${classId}`, { params: { month, year } }),
  getStudentMonthRecords: (studentId, month, year) =>
    http.get(`/student-attendance/student/${studentId}`, {
      params: { month, year },
    }),
};
