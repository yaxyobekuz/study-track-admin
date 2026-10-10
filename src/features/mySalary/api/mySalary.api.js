import http from "@/shared/api/http";

/**
 * MENING OYLIGIM — ruxsat kaliti TALAB QILMAYDIGAN endpointlar.
 *
 * ⚠️ `features/payroll/api/payroll.api.js` dan ATAYLAB ajratilgan: u yerdagi
 * hamma narsa `payroll.view` ortida turadi (butun shtatning oyligi), bu
 * yerdagilar esa faqat `protect` bilan himoyalangan — identifikator
 * TOKENDAN olinadi, ya'ni odam faqat O'ZINIKINI ko'radi. Ikkalasi bitta
 * faylda tursa, keyingi ishda "oylik = payroll.view" degan xulosa
 * chiqarilib, xodimning o'z oyligi ham ruxsat ortiga berkitilardi —
 * va rahbar o'z oyligini ko'rish uchun butun maktabning oyligiga huquq
 * olishi kerak bo'lardi.
 */
export const mySalaryAPI = {
  /** Oylik qoidam (amaldagi va tarix) → `{ current, items, currentMonth }`. */
  getRules: () => http.get("/payroll/salaries/my"),
  /** Oylik majburiyatlarim → `{ totals, items }`. */
  getEntries: () => http.get("/payroll/my"),
  /** Joriy oy jonli hisobi → `{ current, live, hours, totals }`. */
  getStats: () => http.get("/payroll/my-stats"),
  /** Oylikdan ushlab qolishlar → `{ items, totals }`. */
  getDeductions: () => http.get("/payroll/deductions/my"),
  /** To'xtatilgan oylik → `{ items, month, monthLabel }`. */
  getSuspensions: () => http.get("/payroll/suspensions/my"),
};
