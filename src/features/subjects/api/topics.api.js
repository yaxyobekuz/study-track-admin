import http from "@/shared/api/http";

export const topicsAPI = {
  upload: (file, subjectId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (subjectId) formData.append("subjectId", subjectId);

    return http.post("/topics/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBySubject: (subjectId) => http.get(`/topics/subject/${subjectId}`),

  /**
   * Mavzular rejasini Excel'ga yuklab olish.
   *
   * ⚠️ Fayl — QAYTA YUKLASH SHABLONI (`upload` bilan AYNI ustunlar va
   * varaq nomlari): platformada mavzuni tahrirlash yo'li yo'q, ro'yxat
   * faqat fayl bilan almashtiriladi. `subjectId` berilmasa — mavzusi bor
   * hamma fan, har biri alohida varaqda.
   */
  export: (subjectId = null) =>
    http.get("/topics/export", {
      params: subjectId ? { subjectId } : undefined,
      responseType: "blob",
    }),
  deleteBySubject: (subjectId) => http.delete(`/topics/subject/${subjectId}`),
};
