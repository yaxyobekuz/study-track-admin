import http from "@/shared/api/http";

export const schedulesAPI = {
  getByClass: (classId) => http.get(`/schedules/class/${classId}`),
  getByDay: (classId, day) => http.get(`/schedules/class/${classId}/day/${day}`),
  getBySubject: (subjectId) => http.get(`/schedules/subject/${subjectId}`),
  getMyToday: () => http.get("/schedules/my-today"),
  getAllToday: () => http.get("/schedules/all-today"),
  exportByClass: (classId) =>
    http.get(`/schedules/class/${classId}/export`, { responseType: "blob" }),
  createOrUpdate: (data) => http.post("/schedules", data),
  updateCurrentTopic: (classId, subjectId, topicNumber) =>
    http.patch(`/schedules/class/${classId}/subject/${subjectId}/topic`, {
      topicNumber,
    }),
  delete: (id) => http.delete(`/schedules/${id}`),
};
