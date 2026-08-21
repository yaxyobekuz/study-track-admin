import http from "@/shared/api/http";

export const authAPI = {
  register: (data) => http.post("auth/register", data),
  login: (data) => http.post("auth/login", data),
  getMe: () => http.get("auth/me"),
  // Filial almashtirish — javobda YANGI token keladi (filial token ichida,
  // header'da emas: shunda uni mijoz tomondan o'zgartirib bo'lmaydi).
  switchBranch: (branchId) => http.post("auth/switch-branch", { branchId }),
};
