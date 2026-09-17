import http from "@/shared/api/http";

/**
 * TYUTOR GURUHLARI — tyutorga sinf biriktirish va o'quvchilar soniga qarab
 * qo'shimcha oylik. Summa serverda hisoblanadi (`preview` ham), frontend
 * faqat ko'rsatadi.
 */
export const tutorGroupsAPI = {
  getStaffGroups: (staffId) => http.get(`/tutor-groups/staff/${staffId}`),
  getClassOptions: (params) => http.get("/tutor-groups/class-options", { params }),
  getOverview: (id, params) => http.get(`/tutor-groups/${id}/overview`, { params }),
  preview: (data) => http.post("/tutor-groups/preview", data),
  create: (data) => http.post("/tutor-groups", data),
  update: (id, data) => http.patch(`/tutor-groups/${id}`, data),
  // `effective`: "next" — keyingi oydan, "current" — shu oydan
  remove: (id, data) => http.post(`/tutor-groups/${id}/remove`, data),
};
