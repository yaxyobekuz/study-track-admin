import http from "@/shared/api/http";

export const classesAPI = {
  getAll: () => http.get("/classes"),
  getOne: (id) => http.get(`/classes/${id}`),
  create: (data) => http.post("/classes", data),
  update: (id, data) => http.put(`/classes/${id}`, data),
  delete: (id) => http.delete(`/classes/${id}`),
  addStudents: (id, studentIds) =>
    http.post(`/classes/${id}/students/add`, { studentIds }),
  removeStudents: (id, payload) =>
    http.post(`/classes/${id}/students/remove`, payload),
  moveStudents: (id, studentIds, targetClassId) =>
    http.post(`/classes/${id}/students/move`, { studentIds, targetClassId }),
  exportStudents: (id) =>
    http.get(`/classes/${id}/export`, { responseType: "blob" }),
  exportAll: () => http.get("/classes/export", { responseType: "blob" }),
};
