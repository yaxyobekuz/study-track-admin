import http from "@/shared/api/http";

export const studentAttendanceAPI = {
  getAllRecords: (params) => http.get("/student-attendance", { params }),
  getTodayClass: (classId, date) =>
    http.get(`/student-attendance/today/${classId}`, { params: { date } }),
  // Barcha sinflar (sahifalangan): { date, status, search, page, limit }
  getTodayAll: (params) => http.get("/student-attendance/today", { params }),
  // Belgilash uchun to'liq ro'yxat (sahifalanmaydi): { date, status, search, classId }
  getMarkList: (params) =>
    http.get("/student-attendance/mark-list", { params }),
  mark: (data) => http.post("/student-attendance/mark", data),
  updateRecord: (id, data) => http.put(`/student-attendance/${id}`, data),
  getClasses: () => http.get("/student-attendance/classes"),
  getClassMonthRecords: (classId, month, year) =>
    http.get(`/student-attendance/class/${classId}`, { params: { month, year } }),
  getStudentMonthRecords: (studentId, month, year) =>
    http.get(`/student-attendance/student/${studentId}`, {
      params: { month, year },
    }),
};
