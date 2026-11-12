import http from "@/shared/api/http";

export const topicsAPI = {
  /**
   * Mavzular rejasini yuklash — BITTA FAYL, BITTA TIL.
   *
   * ⚠️ `language` ham `FormData` ga qo'shiladi: yuklash faqat O'SHA
   * tildagi ro'yxatni almashtiradi (rus rejasini yuklash o'zbek rejasiga
   * tegmaydi). Tilni varaq nomidan taxmin qilish `education.md` §10
   * moslash doktrinasini buzardi.
   *
   * ⚠️ `multipart/form-data` sarlavhasi MAJBURIY: usiz axios standart
   * JSON turini qo'yib, faylni tashlab yuboradi.
   */
  upload: (file, subjectId = null, language = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (subjectId) formData.append("subjectId", subjectId);
    if (language) formData.append("language", language);

    return http.post("/topics/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBySubject: (subjectId, language = null) =>
    http.get(`/topics/subject/${subjectId}`, {
      params: language ? { language } : undefined,
    }),

  /**
   * Fanlar bo'yicha mavzu holati: qaysi fanga yuklangan, qaysiga yo'q
   * (har fanda nechta mavzu, TIL KESIMIDA va oxirgi yuklash vaqti).
   *
   * ⚠️ `language` filtri IXTIYORIY va uning yo'qligi ALOHIDA savol:
   * "qaysi fanga umuman reja bor" bilan "qaysi fanga RUS rejasi bor"
   * ikki boshqa savol va ikkalasi ham kerak.
   */
  subjectStatus: (language = null) =>
    http.get("/topics/subjects", {
      params: language ? { language } : undefined,
    }),

  /** O'quv tillari katalogi (tanlagich uchun; paneldagi ro'yxat — zaxira). */
  languages: () => http.get("/topics/languages"),

  /**
   * Mavzular rejasini Excel'ga yuklab olish.
   *
   * ⚠️ Fayl — QAYTA YUKLASH SHABLONI (`upload` bilan AYNI ustunlar va
   * varaq nomlari): platformada mavzuni tahrirlash yo'li yo'q, ro'yxat
   * faqat fayl bilan almashtiriladi. `subjectId` berilmasa — mavzusi bor
   * hamma fan, har biri alohida varaqda.
   */
  export: (subjectId = null, language = null) =>
    http.get("/topics/export", {
      params: {
        ...(subjectId ? { subjectId } : {}),
        ...(language ? { language } : {}),
      },
      responseType: "blob",
    }),
  deleteBySubject: (subjectId, language = null) =>
    http.delete(`/topics/subject/${subjectId}`, {
      params: language ? { language } : undefined,
    }),
};
