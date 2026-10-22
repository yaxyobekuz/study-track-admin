import http from "@/shared/api/http";

export const classesAPI = {
  getAll: () => http.get("/classes"),
  getOne: (id) => http.get(`/classes/${id}`),
  create: (data) => http.post("/classes", data),
  update: (id, data) => http.put(`/classes/${id}`, data),
  delete: (id) => http.delete(`/classes/${id}`),
  addStudents: (id, studentIds) =>
    http.post(`/classes/${id}/students/add`, { studentIds }),
  // `payload` — `{ studentIds | all, reason }`: sabab MAJBURIY (jurnalga yoziladi)
  removeStudents: (id, payload) =>
    http.post(`/classes/${id}/students/remove`, payload),
  // `payload` — `{ studentIds, targetClassId, reason }`: sabab MAJBURIY
  moveStudents: (id, payload) =>
    http.post(`/classes/${id}/students/move`, payload),
  // Sinf o'zgarishlari jurnali (`classes.history`) — `{ type, search, classId, studentId, page, limit }`
  getChanges: (params) => http.get("/classes/changes", { params }),
  exportStudents: (id) =>
    http.get(`/classes/${id}/export`, { responseType: "blob" }),
  exportAll: () => http.get("/classes/export", { responseType: "blob" }),
};
