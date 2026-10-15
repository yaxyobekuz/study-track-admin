import http from "@/shared/api/http";

// ⚠️ Jadval versiyalari va tiklash bu yerda EMAS — ular butun maktab
// jadvali bo'yicha `schedule-sync` bo'limida (`/schedule-sync/snapshots`).
// Eski sinf-bo'yicha "tarix" endpointlari serverda hech qachon bo'lmagan.
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
  // payload: { schedules } — sinfning butun haftasi.
  // ⚠️ Sheet rejimida server 409 (`details.reason: "sheet_mode"`) qaytaradi.
  saveClassSchedule: (classId, payload) =>
    http.put(`/schedules/class/${classId}`, payload),
  updateCurrentTopic: (classId, subjectId, topicNumber) =>
    http.patch(`/schedules/class/${classId}/subject/${subjectId}/topic`, {
      topicNumber,
    }),
  delete: (id) => http.delete(`/schedules/${id}`),

  // ── DARS JADVALI MAVZULARI ──
  //
  // Jadval haftalik SHABLON (sanasiz), mavzu esa sanaga bog'liq — shuning
  // uchun so'rovda hafta bor. `week` — haftaning istalgan kuni ("YYYY-MM-DD",
  // mashina qiymati: `dates.md` §3 dagi istisno), bo'sh bo'lsa joriy hafta.
  getWeekTopics: (classId, week) =>
    http.get(`/schedules/class/${classId}/topics`, { params: week ? { week } : {} }),
  // payload: { subjectId, date, lessonOrder, topicOrder, note? }
  bindTopic: (classId, payload) =>
    http.post(`/schedules/class/${classId}/topics`, payload),
  // O'chirilmaydi — bekor qilinadi (tarixda qoladi)
  unbindTopic: (bindingId) =>
    http.delete(`/schedules/topics/bindings/${bindingId}`),
  getTopicBindings: (classId, params = {}) =>
    http.get(`/schedules/class/${classId}/topics/bindings`, { params }),

  // QORALAMA — tugallanmagan tahrirning zaxirasi. Faqat uni yozgan odam
  // ko'radi; o'quvchi, o'qituvchi va hisobotlarga chiqmaydi.
  getDraft: (classId) => http.get(`/schedules/class/${classId}/draft`),
  saveDraft: (classId, data) =>
    http.put(`/schedules/class/${classId}/draft`, data),
  deleteDraft: (classId) => http.delete(`/schedules/class/${classId}/draft`),
};
