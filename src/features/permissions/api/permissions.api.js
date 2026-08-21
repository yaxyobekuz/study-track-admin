import http from "@/shared/api/http";

export const permissionsAPI = {
  getStaff: () => http.get("/permissions/staff"),
  getCatalog: () => http.get("/permissions/catalog"),
  // `branchId` ixtiyoriy: berilmasa server JORIY filialga yozadi.
  // Ruxsatlar har filialda alohida — bir odam Chilonzorda kassir,
  // Yunusobodda o'qituvchi bo'lishi mumkin.
  updateUser: (id, permissions, branchId) =>
    http.put(`/permissions/users/${id}`, { permissions, branchId }),
};
