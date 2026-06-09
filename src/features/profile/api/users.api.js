import http from "@/shared/api/http";

export const usersAPI = {
  // baseURL allaqachon `/api` bilan tugaydi, shuning uchun bu yerda qo'shilmaydi
  updateProfile: (data) => http.put("users/me", data),
};
