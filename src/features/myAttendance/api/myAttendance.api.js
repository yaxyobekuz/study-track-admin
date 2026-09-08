import http from "@/shared/api/http";

/**
 * O'Z DAVOMATI — ruxsat talab qilmaydigan endpointlar.
 *
 * ⚠️ `features/attendance/api/attendance.api.js` dan ATAYLAB ajratilgan:
 * u yerdagi hamma narsa `attendance.view` ruxsatiga tayanadi (boshqa
 * odamlarning davomati), bu yerdagilar esa faqat `protect` bilan himoyalangan
 * — xodim o'zining kelgan-ketganini ruxsatsiz qayd etadi. Ikkalasi bitta
 * faylda tursa, keyingi ishda "davomat = attendance.view" degan xulosa
 * chiqarilib, o'z davomati ham ruxsat ortiga berkitilardi.
 */
export const myAttendanceAPI = {
  checkIn: (data) => http.post("/attendance/check-in", data),
  checkOut: (data) => http.post("/attendance/check-out", data),
  getToday: () => http.get("/attendance/today"),
  getMySchedule: () => http.get("/attendance/my-schedule"),
  getMyHistory: (month, year) =>
    http.get("/attendance/my", { params: { month, year } }),

  createExcuseRequest: (data) => http.post("/attendance/excuse", data),
  getMyExcuses: (params) => http.get("/attendance/excuse/my", { params }),
  cancelExcuseRequest: (id) => http.delete(`/attendance/excuse/${id}`),

  // O'z roliga tegishli "Kelmaslik sabablari"
  getAbsenceReasons: () => http.get("/absence-reasons/applicable"),
};
