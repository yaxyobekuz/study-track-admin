import http from "@/shared/api/http";

export const studentSystemsAPI = {
  // Ro'yxat — `{ search, classId, erp, kundalik, page, limit }`, javobda `summary`
  getAll: (params) => http.get("/student-systems", { params }),

  // "Bor" / "yo'q" belgisi — `{ studentIds, system, present }` (bitta yoki bir nechta)
  setMarks: (payload) => http.patch("/student-systems/marks", payload),

  /**
   * Excel — `{ list, scope, classIds }` (`classIds` vergul bilan).
   *
   * ⚠️ `responseType: "blob"` MAJBURIY — usiz axios ikkilik faylni matn deb
   * o'qib, buzib yuborardi.
   */
  exportExcel: (params) =>
    http.get("/student-systems/export", { params, responseType: "blob" }),
};
