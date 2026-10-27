import http from "@/shared/api/http";

export const dormAttendanceAPI = {
  // Kunlik ro'yxat — `{ date, classId, status, search }` (sahifalanmaydi)
  getDay: (params) => http.get("/dorm-attendance", { params }),

  // "Qaysi sinfdan nechta qoldi" — `{ date }`
  getClasses: (params) => http.get("/dorm-attendance/classes", { params }),

  // Bitta sinf — kunlik ro'yxat + har o'quvchining oxirgi kunlari + kunlar
  // kesimi (`{ date, status, search, days }`)
  getClassDetail: (classId, params) =>
    http.get(`/dorm-attendance/class/${classId}`, { params }),

  // Bitta o'quvchining kun-ba-kun tarixi (`{ date, days }`)
  getStudentHistory: (studentId, params) =>
    http.get(`/dorm-attendance/student/${studentId}`, { params }),

  // Belgilash — `{ date, records: [{ studentId, status, note }] }`
  mark: (payload) => http.post("/dorm-attendance/mark", payload),

  // Boshlanish vaqti
  getSettings: () => http.get("/dorm-attendance/settings"),
  updateSettings: (payload) => http.patch("/dorm-attendance/settings", payload),

  /**
   * Excel — `{ date, classId, status }`.
   *
   * ⚠️ `responseType: "blob"` MAJBURIY — usiz axios ikkilik faylni matn deb
   * o'qib buzib yuborardi.
   */
  exportExcel: (params) =>
    http.get("/dorm-attendance/export", { params, responseType: "blob" }),
};
