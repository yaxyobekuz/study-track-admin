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

  /**
   * KUNNI YOPISH DARVOZASI — "Men ketdim" dan oldingi bugungi ishlar
   * (`checkoutGate.service.js`). Darvoza `teacher` roli (asosiy YOKI
   * qo'shimcha) bor xodimga tegishli, ya'ni admin panelga kiradigan
   * rahbar/ma'mur ham unga tushib qolishi mumkin — shuning uchun ro'yxat
   * va ruxsat so'rovi shu panelda ham bo'lishi SHART (`education.md` §12).
   * Aks holda server 409 qaytarib, odam ketolmay qolardi.
   */
  getCheckoutReadiness: () => http.get("/attendance/checkout-readiness"),
  createCheckoutRequest: (data) => http.post("/attendance/checkout-requests", data),
  cancelCheckoutRequest: (id) => http.delete(`/attendance/checkout-requests/${id}`),

  createExcuseRequest: (data) => http.post("/attendance/excuse", data),
  getMyExcuses: (params) => http.get("/attendance/excuse/my", { params }),
  cancelExcuseRequest: (id) => http.delete(`/attendance/excuse/${id}`),

  // O'z roliga tegishli "Kelmaslik sabablari"
  getAbsenceReasons: () => http.get("/absence-reasons/applicable"),
};
