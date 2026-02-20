import http from "@/shared/api/http";

export const classesAPI = {
  getAll: () => http.get("/classes"),
  getOne: (id) => http.get(`/classes/${id}`),
  create: (data) => http.post("/classes", data),
  update: (id, data) => http.put(`/classes/${id}`, data),
  delete: (id) => http.delete(`/classes/${id}`),
  exportStudents: (id) =>
    http.get(`/classes/${id}/export`, { responseType: "blob" }),
  exportAll: () => http.get("/classes/export", { responseType: "blob" }),
};
