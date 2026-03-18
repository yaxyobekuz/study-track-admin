import http from "@/shared/api/http";

export const holidaysAPI = {
  getAll: () => http.get("/holidays"),
  create: (data) => http.post("/holidays", data),
  update: (id, data) => http.put(`/holidays/${id}`, data),
  delete: (id) => http.delete(`/holidays/${id}`),
  checkToday: () => http.get("/holidays/check/today"),
  checkDate: (date) => http.get(`/holidays/check/${date}`),
};
