import http from "@/shared/api/http";

export const branchesAPI = {
  getAll: (params) => http.get("/branches", { params }),
  getById: (id) => http.get(`/branches/${id}`),
  create: (data) => http.post("/branches", data),
  update: (id, data) => http.put(`/branches/${id}`, data),
  archive: (id, data) => http.post(`/branches/${id}/archive`, data),
  restore: (id) => http.post(`/branches/${id}/restore`),
  // Baza tayyorlanishi xato bilan tugagan bo'lsa qayta urinish
  retry: (id) => http.post(`/branches/${id}/retry`),
};
