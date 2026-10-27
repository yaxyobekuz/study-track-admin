import http from "@/shared/api/http";

/**
 * SINF RAHBARLARI — xodimga sinf biriktirish (PULSIZ).
 *
 * Biriktirishdan keladigan yagona huquq: shu sinfning kunlik davomatini
 * belgilash. ⚠️ Tyutor guruhlari bilan chalkashmasin — u yerda summa bor va
 * u oylikka ustama bo'lib muhrlanadi.
 */
export const classLeadersAPI = {
  getStaffClasses: (staffId) => http.get(`/class-leaders/staff/${staffId}`),
  getClassOptions: (params) => http.get("/class-leaders/class-options", { params }),
  getLeaders: (params) => http.get("/class-leaders", { params }),
  // `classIds` — bir yoki bir nechta sinf (hammasi yoki hech narsa)
  assign: (data) => http.post("/class-leaders", data),
  update: (id, data) => http.patch(`/class-leaders/${id}`, data),
  remove: (id) => http.delete(`/class-leaders/${id}`),
};
