import http from "@/shared/api/http";

export const teacherAssignmentsAPI = {
  getAll: (params = {}) => http.get("/teacher-assignments", { params }),
  create: (data) => http.post("/teacher-assignments", data),
  bulkCreate: (data) => http.post("/teacher-assignments/bulk", data),
  update: (id, data) => http.put(`/teacher-assignments/${id}`, data),
  delete: (id) => http.delete(`/teacher-assignments/${id}`),
};
