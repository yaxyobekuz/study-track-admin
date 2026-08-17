// HTTP
import http from "@/shared/api/http";

export const changelogAPI = {
  getAll: (params) => http.get("/changelogs", { params }),
  getVersions: () => http.get("/changelogs/versions"),
  getById: (id) => http.get(`/changelogs/${id}`),
  create: (data) => http.post("/changelogs", data),
  update: (id, data) => http.put(`/changelogs/${id}`, data),
  delete: (id) => http.delete(`/changelogs/${id}`),
};

// Xabarnoma sozlamalari alohida route'da (serverda ham alohida router)
export const changelogSettingsAPI = {
  get: () => http.get("/changelog-settings"),
  update: (data) => http.put("/changelog-settings", data),
  getNotifications: (params) => http.get("/changelog-settings/notifications", { params }),
  sendNow: (data) => http.post("/changelog-settings/send", data),
};
