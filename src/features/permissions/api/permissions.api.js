import http from "@/shared/api/http";

export const permissionsAPI = {
  getStaff: () => http.get("/permissions/staff"),
  getCatalog: () => http.get("/permissions/catalog"),
  updateUser: (id, permissions) =>
    http.put(`/permissions/users/${id}`, { permissions }),
};
