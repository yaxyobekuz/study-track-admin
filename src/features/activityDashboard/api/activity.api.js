// HTTP
import http from "@/shared/api/http";

/**
 * FAOLLIK — FAQAT O'QISH.
 *
 * ⚠️ Yozadigan amal YO'Q va bo'lmaydi ham: faollik hodisalarini bot va
 * `auth.middleware` yozadi. Bu yerga "qo'lda qo'shish" tugmasi
 * qo'yilsa, u hisobotni soxtalash yo'liga aylanardi.
 */
export const activityAPI = {
  /** Butun manzara. Params: { days } */
  getOverview: (params) => http.get("/activity/overview", { params }),

  /** Bitta odamning faollik tarixi. Params: { userId | telegramId, days } */
  getSubject: (params) => http.get("/activity/subject", { params }),

  /**
   * Bitta sinfning kesimi — kim foydalanadi, kim yo'q. Params: { days }
   *
   * ⚠️ `classId` YO'L SEGMENTIDA, `params` da emas: server uni
   * `validateObjectId` bilan tekshiradi va ruxsati boshqa
   * (`ACTIVITY_ROSTER`). Query parametriga ko'chirilsa, tekshiruv
   * jimgina chetlab o'tilardi.
   */
  getClass: (classId, params) =>
    http.get(`/activity/classes/${classId}`, { params }),
};

export default activityAPI;
