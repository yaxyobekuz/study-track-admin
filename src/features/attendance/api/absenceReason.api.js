import http from "@/shared/api/http";

export const absenceReasonAPI = {
  // Boshqaruv (owner) - sahifalangan ro'yxat
  getAll: (params) => http.get("/absence-reasons", { params }),
  // Barcha aktiv sabablar (belgilashda rol bo'yicha filtrlash uchun)
  getActive: () => http.get("/absence-reasons/active"),
  // O'z roliga tegishli sabablar (o'zini belgilash panellari uchun)
  getApplicable: () => http.get("/absence-reasons/applicable"),
  create: (data) => http.post("/absence-reasons", data),
  update: (id, data) => http.put(`/absence-reasons/${id}`, data),
  remove: (id) => http.delete(`/absence-reasons/${id}`),
};
