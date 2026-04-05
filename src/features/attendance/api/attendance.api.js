import http from "@/shared/api/http";

export const attendanceAPI = {
  getSettings: () => http.get("/attendance/settings"),
  updateSettings: (data) => http.put("/attendance/settings", data),
  getAllRecords: (params) => http.get("/attendance", { params }),
  getUserMonthRecords: (userId, month, year) =>
    http.get(`/attendance/user/${userId}`, { params: { month, year } }),
  getRecord: (id) => http.get(`/attendance/${id}`),
  getAllExcuses: (params) => http.get("/attendance/excuse", { params }),
  getExcuse: (id) => http.get(`/attendance/excuse/${id}`),
  reviewExcuse: (id, data) => http.put(`/attendance/excuse/${id}/review`, data),
};
