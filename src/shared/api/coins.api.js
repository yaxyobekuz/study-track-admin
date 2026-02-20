import http from "@/shared/api/http";

export const coinsAPI = {
  getSettings: () => http.get("/coins/settings"),
  updateSettings: (data) => http.put("/coins/settings", data),
  getStats: () => http.get("/coins/stats"),
  getStudentTransactions: (studentId, params) =>
    http.get(`/coins/transactions/${studentId}`, { params }),
};
