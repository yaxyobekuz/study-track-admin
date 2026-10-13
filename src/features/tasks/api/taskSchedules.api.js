import http from "@/shared/api/http";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

/**
 * DOIMIY (takrorlanuvchi) topshiriq QOIDALARI — topshiriqlarning o'zi emas.
 * Qoidadan haqiqiy topshiriqlarni server vaqtidan oldin yaratadi.
 */
export const taskSchedulesAPI = {
  getAll: (params) => http.get("/task-schedules", { params }),

  // Yaratish / tahrirlash — multipart (namuna fayllari bilan)
  create: (formData) => http.post("/task-schedules", formData, multipart),
  update: (id, formData) => http.put(`/task-schedules/${id}`, formData, multipart),

  // To'xtatish — sabab majburiy; qayta yoqish sababsiz
  stop: (id, data) => http.put(`/task-schedules/${id}/stop`, data),
  resume: (id) => http.put(`/task-schedules/${id}/resume`),

  // O'chirish — faqat hali topshiriq yaratilmagan qoida
  remove: (id) => http.delete(`/task-schedules/${id}`),
};
