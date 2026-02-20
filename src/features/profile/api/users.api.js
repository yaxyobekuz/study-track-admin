import http from "@/shared/api/http";

export const usersAPI = {
  updateProfile: (data) => http.put("/api/users/me", data),
};
