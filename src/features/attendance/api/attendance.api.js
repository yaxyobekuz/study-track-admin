import http from "@/shared/api/http";

export const attendanceAPI = {
  getSettings: () => http.get("/attendance/settings"),
  updateSettings: (data) => http.put("/attendance/settings", data),
  getTodayAll: (params) => http.get("/attendance/today/all", { params }),
  /** Darsga kelmaganlar — `?date=YYYY-MM-DD` (bo'lmasa bugun, faqat boshlangan darslar). */
  getLessonAbsentees: (params) => http.get("/attendance/lesson-absentees", { params }),
  markStaff: (data) => http.post("/attendance/mark", data),
  // Kelish/ketish vaqtini qo'lda tahrirlash (ketishni o'chirsa baho ochiladi)
  updateTimes: (userId, data) =>
    http.patch(`/attendance/user/${userId}/times`, data),
  getAllRecords: (params) => http.get("/attendance", { params }),
  getUserMonthRecords: (userId, month, year) =>
    http.get(`/attendance/user/${userId}`, { params: { month, year } }),
  getRecord: (id) => http.get(`/attendance/${id}`),
  getAllExcuses: (params) => http.get("/attendance/excuse", { params }),
  getRecentExcuses: () => http.get("/attendance/excuse/recent"),
  getExcuse: (id) => http.get(`/attendance/excuse/${id}`),
  reviewExcuse: (id, data) => http.put(`/attendance/excuse/${id}/review`, data),
};
