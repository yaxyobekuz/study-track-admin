import http from "@/shared/api/http";

/**
 * O'QUVCHINING SHAXSIY MAVZU REJASI.
 *
 * ⚠️ Ruxsat — `topics.view` / `topics.assign` (alohida kalit YO'Q): bu
 * AYNI qaror, faqat o'quvchi kesimida. "Darsga mavzu biriktirish" va "bu
 * bola qaysi mavzuda" bitta ishning ikki tomoni.
 */
export const studentTopicsAPI = {
  /** Guruh + fan → o'quvchilar va har birining mavzu o'rni. */
  byClass: (classId, subjectId) =>
    http.get("/student-topic-plans", { params: { classId, subjectId } }),

  /**
   * Mavzu o'rni va QADAMNI belgilash (bitta yoki bir nechta o'quvchiga).
   *
   * ⚠️ Ankorning kuni va darsini SERVER tanlaydi — guruhning keyingi
   * darsi. Panel "qaysi darsga" degan savolni bermaydi.
   */
  set: (payload) => http.post("/student-topic-plans", payload),

  /** Shaxsiy rejani bekor qilish — o'quvchi SINFDAN MEROS olishga qaytadi. */
  revoke: (id) => http.delete(`/student-topic-plans/${id}`),

  /** Bitta o'quvchining reja tarixi. */
  history: (studentId, subjectId = null) =>
    http.get("/student-topic-plans/history", {
      params: { studentId, ...(subjectId ? { subjectId } : {}) },
    }),
};
