import http from "@/shared/api/http";

export const testSettingsAPI = {
  getSettings: () => http.get("/test-settings"),
  updateSettings: (data) => http.put("/test-settings", data),
};
