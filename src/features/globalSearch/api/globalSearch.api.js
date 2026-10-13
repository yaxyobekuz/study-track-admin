import http from "@/shared/api/http";

export const globalSearchAPI = {
  // Foydalanuvchilar — BUTUN PLATFORMA bo'yicha (platformadagi katalogdan).
  // Qaysi filiallar qidirilishi serverda kesiladi: owner — hammasi,
  // qolgan xodim — faqat o'zi kira oladigan filiallar.
  searchUsers: (params) => http.get("/search/users", { params }),
};
