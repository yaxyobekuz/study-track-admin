// HTTP
import http from "@/shared/api/http";

/**
 * TA'LIM DASHBOARDI — moliya dashboardining akademik ko'zgusi.
 *
 * Hammasi `/education/*` ostida: bu alohida modul, hisobotlarning kesimi
 * emas. ⚠️ Yozadigan uchta joy bor va uchalasi ham DASHBOARD RAQAMINI
 * O'ZGARTIRMAYDI — ular manba ma'lumotini kiritadi (reja, yutuq,
 * to'garak), raqam esa har safar qaytadan hisoblanadi.
 */
export const academicDashboardAPI = {
  /** Butun akademik manzara. Params: { month, compareMonth, trendMonths } */
  getOverview: (params) => http.get("/education/overview", { params }),

  /** Oylik akademik reja. Params: { month } */
  getTargets: (params) => http.get("/education/targets", { params }),

  /** Rejani saqlash. Body: { month, items: [{ metric, planValue }] } */
  saveTargets: (data) => http.put("/education/targets", data),

  /** Yutuqlar ro'yxati. Params: { page, limit, month, level, place, search } */
  getAchievements: (params) => http.get("/education/achievements", { params }),

  /** Daraja va o'rin toifalari (katalog serverda). */
  getAchievementOptions: () => http.get("/education/achievements/options"),

  createAchievement: (data) => http.post("/education/achievements", data),
  updateAchievement: ({ id, ...data }) => http.put(`/education/achievements/${id}`, data),
  deleteAchievement: (id) => http.delete(`/education/achievements/${id}`),

  /** To'garaklar ro'yxati. Params: { page, limit, search, isActive } */
  getClubs: (params) => http.get("/education/clubs", { params }),

  /** Bitta to'garak — a'zolari bilan. */
  getClub: (id) => http.get(`/education/clubs/${id}`),

  createClub: (data) => http.post("/education/clubs", data),
  updateClub: ({ id, ...data }) => http.put(`/education/clubs/${id}`, data),
  deleteClub: (id) => http.delete(`/education/clubs/${id}`),

  /** A'zo qo'shish. Body: { studentIds: [], startDate? } */
  addClubMembers: ({ clubId, ...data }) => http.post(`/education/clubs/${clubId}/members`, data),

  /** A'zolikni yopish. Body: { endDate? } */
  closeClubMember: ({ clubId, memberId, ...data }) =>
    http.put(`/education/clubs/${clubId}/members/${memberId}/close`, data),

  /** Xato kiritilgan a'zolikni butunlay o'chirish. */
  removeClubMember: ({ clubId, memberId }) =>
    http.delete(`/education/clubs/${clubId}/members/${memberId}`),
};

export default academicDashboardAPI;
