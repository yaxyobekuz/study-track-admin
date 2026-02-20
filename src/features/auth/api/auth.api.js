import http from "@/shared/api/http";

export const authAPI = {
  register: (data) => http.post("auth/register", data),
  login: (data) => http.post("auth/login", data),
  getMe: () => http.get("auth/me"),
};
