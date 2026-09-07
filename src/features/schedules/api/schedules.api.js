import http from "@/shared/api/http";

export const schedulesAPI = {
  getByClass: (classId) => http.get(`/schedules/class/${classId}`),
  getByDay: (classId, day) => http.get(`/schedules/class/${classId}/day/${day}`),
  getBySubject: (subjectId) => http.get(`/schedules/subject/${subjectId}`),
  // Dars biriktirish uchun o'qituvchilar ma'lumotnomasi: id, ism va
  // biriktirilgan fanlar. `/users` dan farqli — telefon, parol holati va
  // ruxsatlar yo'q, shuning uchun `users.view` talab qilinmaydi.
  getTeacherOptions: () => http.get("/schedules/teachers"),
  // O'qituvchining haftalik yuklamasi — profil sahifasi uchun
  getTeacherWorkload: (teacherId) => http.get(`/schedules/teacher/${teacherId}`),
  getMyToday: () => http.get("/schedules/my-today"),
  getAllToday: () => http.get("/schedules/all-today"),
  exportByClass: (classId) =>
    http.get(`/schedules/class/${classId}/export`, { responseType: "blob" }),
  createOrUpdate: (data) => http.post("/schedules", data),
  saveClassSchedule: (classId, schedules) =>
    http.put(`/schedules/class/${classId}`, { schedules }),
  updateCurrentTopic: (classId, subjectId, topicNumber) =>
    http.patch(`/schedules/class/${classId}/subject/${subjectId}/topic`, {
      topicNumber,
    }),
  delete: (id) => http.delete(`/schedules/${id}`),

  // QORALAMA — tugallanmagan tahrirning zaxirasi. Faqat uni yozgan odam
  // ko'radi; o'quvchi, o'qituvchi va hisobotlarga chiqmaydi.
  getDraft: (classId) => http.get(`/schedules/class/${classId}/draft`),
  saveDraft: (classId, data) =>
    http.put(`/schedules/class/${classId}/draft`, data),
  deleteDraft: (classId) => http.delete(`/schedules/class/${classId}/draft`),
};
