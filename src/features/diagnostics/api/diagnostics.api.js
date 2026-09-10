import http from "@/shared/api/http";

/**
 * DIAGNOSTIKA API.
 *
 * ⚠️ ALOHIDA KIRISH YO'Q. Diagnostika bizning tizimning bir bo'limi:
 * token `http.js` interceptor'i orqali qo'shiladi va u panelga kirishda
 * olingan o'sha token. Asl loyihada diagnostika o'z login/refresh
 * oqimiga ega edi — u BUTUNLAY olib tashlangan.
 *
 * Server tomonda yo'llar to'rtga bo'lingan:
 *   `/diagnostics`          — tahlil, sozlamalar, AI yordamchilari
 *   `/diagnostic-questions` — savollar banki
 *   `/diagnostic-tests`     — test shablonlari
 *   `/diagnostic-attempts`  — urinishlar va natijalar
 */

/** Bo'sh qiymatlarni tashlab, query obyektini tozalaydi. */
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const diagnosticQuestionsAPI = {
  getAll: (params) => http.get("/diagnostic-questions", { params: clean(params) }),
  getStats: () => http.get("/diagnostic-questions/stats"),
  getCoverage: (subjectId) =>
    http.get("/diagnostic-questions/coverage", { params: clean({ subjectId }) }),
  getOne: (id) => http.get(`/diagnostic-questions/${id}`),

  // ⚠️ `multipart/form-data` sarlavhasi MAJBURIY. `http` mijozining
  // standart sarlavhasi `application/json` va axios (v1) shu sarlavhani
  // ko'rsa `FormData` ni JSON'ga aylantirib yuboradi — fayl `{}` bo'lib
  // JIMGINA yo'qoladi. Bu kodbazadagi barcha yuklashlar uchun bir xil
  // qoida (`inventory`, `market`, `tasks`, `premium`… hammasida shunday).
  create: (formData) =>
    http.post("/diagnostic-questions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    http.put(`/diagnostic-questions/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateStatus: (id, status) =>
    http.patch(`/diagnostic-questions/${id}/status`, { status }),
  bulkStatus: (ids, status) =>
    http.patch("/diagnostic-questions/bulk-status", { ids, status }),
  delete: (id) => http.delete(`/diagnostic-questions/${id}`),

  import: (formData) =>
    http.post("/diagnostic-questions/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  export: (params) =>
    http.get("/diagnostic-questions/export", {
      params: clean(params),
      responseType: "blob",
    }),
};

export const diagnosticTestsAPI = {
  getAll: (params) => http.get("/diagnostic-tests", { params: clean(params) }),
  getOne: (id) => http.get(`/diagnostic-tests/${id}`),
  getAvailability: (id) => http.get(`/diagnostic-tests/${id}/availability`),
  create: (data) => http.post("/diagnostic-tests", data),
  update: (id, data) => http.put(`/diagnostic-tests/${id}`, data),
  updateStatus: (id, status) =>
    http.patch(`/diagnostic-tests/${id}/status`, { status }),
  delete: (id) => http.delete(`/diagnostic-tests/${id}`),
  /** O'ziga ochiq testlar (panelga kirgan odamning o'zi uchun). */
  mine: () => http.get("/diagnostic-tests/me"),
};

export const diagnosticAttemptsAPI = {
  getAll: (params) => http.get("/diagnostic-attempts", { params: clean(params) }),
  getResult: (id) => http.get(`/diagnostic-attempts/${id}/result`),
  getInsights: (id) => http.get(`/diagnostic-attempts/${id}/insights`),
  explain: (id, questionId) =>
    http.post(`/diagnostic-attempts/${id}/questions/${questionId}/explain`),
  analyze: (id, kinds) => http.post(`/diagnostic-attempts/${id}/analyze`, { kinds }),
  delete: (id) => http.delete(`/diagnostic-attempts/${id}`),
  export: (params) =>
    http.get("/diagnostic-attempts/export", {
      params: clean(params),
      responseType: "blob",
    }),

  /**
   * BITTA natijaning to'liq hisoboti (Excel, 4 varaq).
   *
   * ⚠️ `responseType: "blob"` MAJBURIY — usiz axios ikkilik faylni
   * matn deb o'qib buzib qo'yardi.
   */
  exportResult: (id) =>
    http.get(`/diagnostic-attempts/${id}/result/export`, { responseType: "blob" }),

  // Test topshirish (panel ichidan sinab ko'rish uchun ham ishlaydi)
  mine: (limit) => http.get("/diagnostic-attempts/me", { params: clean({ limit }) }),
  start: (data) => http.post("/diagnostic-attempts/start", data),
  getActive: (id) => http.get(`/diagnostic-attempts/${id}/active`),
  saveAnswer: (id, questionId, data) =>
    http.put(`/diagnostic-attempts/${id}/answers/${questionId}`, data),
  submit: (id, data) => http.post(`/diagnostic-attempts/${id}/submit`, data),
};

export const diagnosticAnalyticsAPI = {
  summary: (params) =>
    http.get("/diagnostics/analytics/summary", { params: clean(params) }),
  trend: (params) =>
    http.get("/diagnostics/analytics/trend", { params: clean(params) }),
  subjects: (params) =>
    http.get("/diagnostics/analytics/subjects", { params: clean(params) }),
  topics: (params) =>
    http.get("/diagnostics/analytics/topics", { params: clean(params) }),
  classes: (params) =>
    http.get("/diagnostics/analytics/classes", { params: clean(params) }),
  students: (params) =>
    http.get("/diagnostics/analytics/students", { params: clean(params) }),
  participation: (params) =>
    http.get("/diagnostics/analytics/participation", { params: clean(params) }),
  /** Bitta sinfning tafsiloti — ko'rsatkichlar, testlar, o'quvchilar. */
  classDetail: (classId, params) =>
    http.get(`/diagnostics/analytics/classes/${classId}`, { params: clean(params) }),

  /** Fanlar kesimini Excel'ga yuklash (ekrandagi filtr bilan). */
  exportSubjects: (params) =>
    http.get("/diagnostics/analytics/subjects/export", {
      params: clean(params),
      responseType: "blob",
    }),

  /**
   * Mavzular kesimini Excel'ga yuklash.
   *
   * ⚠️ EKRANDAGI FILTR BILAN: server aynan shu parametrlar bo'yicha
   * hisoblaydi, ya'ni fayl jadvalning nusxasi bo'ladi.
   */
  exportTopics: (params) =>
    http.get("/diagnostics/analytics/topics/export", {
      params: clean(params),
      responseType: "blob",
    }),

  /** Sinflar bo'yicha qatnashuv va o'zlashtirish. */
  classParticipation: (params) =>
    http.get("/diagnostics/analytics/class-participation", {
      params: clean(params),
    }),

  /**
   * "Bugun" kartalari.
   *
   * ⚠️ PARAMETR YUBORILMAYDI. Bu blok sana filtridan ataylab mustaqil:
   * rahbar oraliqni "avgust" qilib qo'yganda ham "bugun nechta test
   * ishlandi" degan savolga BUGUNGI javob kerak.
   */
  today: () => http.get("/diagnostics/analytics/today"),

  studentProfile: (studentId, params) =>
    http.get(`/diagnostics/analytics/students/${studentId}`, {
      params: clean(params),
    }),

  /**
   * O'quvchining boshqaruv panelini XODIM ko'zi bilan ochish — o'quvchi
   * o'z panelida ko'radigan AYNI ma'lumot (bitta servisdan).
   */
  studentDashboard: (studentId) =>
    http.get(`/diagnostics/analytics/students/${studentId}/dashboard`),
};

export const diagnosticSettingsAPI = {
  get: () => http.get("/diagnostics/settings"),
  update: (data) => http.put("/diagnostics/settings", data),
};

export const diagnosticAiAPI = {
  tutor: (data) => http.post("/diagnostics/tutor", data),
  essayCoach: (text) => http.post("/diagnostics/essay-coach", { text }),
};
