import http from "@/shared/api/http";

export const authAPI = {
  register: (data) => http.post("auth/register", data),
  login: (data) => http.post("auth/login", data),

  /**
   * FILIALNI TANLASH — login'ning ikkinchi qadami.
   *
   * ⚠️ Access token BERILMAGAN holat uchun: hakam — `selectionToken`
   * (5 daqiqa, alohida kalit bilan imzolangan). Shuning uchun so'rov
   * `Authorization` sarlavhasiga tayanmaydi.
   */
  selectLoginBranch: ({ selectionToken, branchId }) =>
    http.post("auth/login/branch", { selectionToken, branchId }),
  getMe: () => http.get("auth/me"),
  // Filial almashtirish — javobda YANGI token keladi (filial token ichida,
  // header'da emas: shunda uni mijoz tomondan o'zgartirib bo'lmaydi).
  switchBranch: (branchId) => http.post("auth/switch-branch", { branchId }),
};
