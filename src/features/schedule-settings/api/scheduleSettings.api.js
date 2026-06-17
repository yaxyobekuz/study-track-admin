import http from "@/shared/api/http";

export const scheduleSettingsAPI = {
  getSettings: () => http.get("/schedule-settings"),
  updateSettings: (data) => http.put("/schedule-settings", data),
};
