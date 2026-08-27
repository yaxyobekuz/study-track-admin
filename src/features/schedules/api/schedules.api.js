import http from "@/shared/api/http";

export const schedulesAPI = {
  // asOf — qaysi sanada amaldagi jadval (bo'sh → bugun)
  getByClass: (classId, asOf) =>
    http.get(`/schedules/class/${classId}`, { params: asOf ? { asOf } : {} }),
  // Barcha versiyalar (tarix)
  getVersions: (classId) => http.get(`/schedules/class/${classId}/versions`),
  getByDay: (classId, day) => http.get(`/schedules/class/${classId}/day/${day}`),
  getBySubject: (subjectId) => http.get(`/schedules/subject/${subjectId}`),
  getMyToday: () => http.get("/schedules/my-today"),
  getAllToday: () => http.get("/schedules/all-today"),
  exportByClass: (classId) =>
    http.get(`/schedules/class/${classId}/export`, { responseType: "blob" }),
  createOrUpdate: (data) => http.post("/schedules", data),
  // payload: { schedules, effectiveFrom, effectiveTo }
  saveClassSchedule: (classId, payload) =>
    http.put(`/schedules/class/${classId}`, payload),
  updateCurrentTopic: (classId, subjectId, topicNumber) =>
    http.patch(`/schedules/class/${classId}/subject/${subjectId}/topic`, {
      topicNumber,
    }),
  delete: (id) => http.delete(`/schedules/${id}`),
};
