import http from "@/shared/api/http";

export const socialNetworksAPI = {
  getAll: () => http.get("/social-networks"),
  create: (data) => http.post("/social-networks", data),
  update: (id, data) => http.put(`/social-networks/${id}`, data),
  delete: (id) => http.delete(`/social-networks/${id}`),
};
