import http from "@/shared/api/http";

/**
 * Filiallararo ko'chirish — server `branchTransfer.service.js`.
 *
 * Har amal IKKI QADAM: `preview*` hech narsa yozmaydi va reja + `planHash`
 * qaytaradi; asosiy yo'l AYNI xesh va tasdiqlangan oqibatlar
 * (`acknowledged`) bilan chaqiriladi. Oraliqda ma'lumot o'zgarsa — 409
 * (`details.reason === "stale_plan"`).
 */
export const branchTransfersAPI = {
  // `{ targetBranchId, effectiveDate, studentIds, targetClassId, tariffMode, keepDiscounts }`
  previewStudents: (payload) => http.post("/branch-transfers/students/preview", payload),
  transferStudents: (payload) => http.post("/branch-transfers/students", payload),

  // `{ targetBranchId, effectiveDate, staffIds, mode, keepSource, permissionsMode }`
  previewStaff: (payload) => http.post("/branch-transfers/staff/preview", payload),
  transferStaff: (payload) => http.post("/branch-transfers/staff", payload),

  // `{ targetBranchId, effectiveDate, classIds, tariffMode, keepDiscounts }`
  previewClasses: (payload) => http.post("/branch-transfers/classes/preview", payload),
  transferClasses: (payload) => http.post("/branch-transfers/classes", payload),

  // Maqsad filialning faol sinflari
  getTargetClasses: (branchId) =>
    http.get("/branch-transfers/target-classes", { params: { branchId } }),

  // Jurnal — `{ page, limit, kind, search, direction }`
  getAll: (params) => http.get("/branch-transfers", { params }),

  // Bitta odamning ko'chirish tarixi va oyligi filiallar kesimida
  getUserTransfers: (userId) => http.get(`/branch-transfers/users/${userId}`),
  getUserPayroll: (userId, params) =>
    http.get(`/branch-transfers/users/${userId}/payroll`, { params }),
};
