import http from "@/shared/api/http";

export const rolesAPI = {
  getAll: () => http.get("/roles"),
  getOptions: () => http.get("/roles/options"),
  create: (data) => http.post("/roles", data),
  update: (id, data) => http.put(`/roles/${id}`, data),
  delete: (id) => http.delete(`/roles/${id}`),
};
