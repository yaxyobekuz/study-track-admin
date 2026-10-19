/**
 * SERTIFIKAT REJALARI — panel doimiylari.
 *
 * ⚠️ Holat va moslashtirish kalitlari SERVER bilan qo'lda sinxron
 * (`certificate.helpers.js` → `PLAN_STATUS`, `certificateImport.service.js`
 * → `MATCH`). Yangi qiymat qo'shilsa ikkalasi ham ko'rib chiqiladi.
 */

export const CERTIFICATES_PAGE_LIMIT = 50;

/** Sinf filtri: sinfga biriktirilmagan o'quvchilar. */
export const NO_CLASS = "none";

export const ALL = "all";

/* ─────────────────────────── HOLAT ─────────────────────────── */

export const PLAN_STATUS = Object.freeze({
  PLANNED: "planned",
  PASSED: "passed",
  CANCELLED: "cancelled",
  SUPERSEDED: "superseded",
});

export const PLAN_STATUS_LABELS = Object.freeze({
  [PLAN_STATUS.PLANNED]: "Rejada",
  [PLAN_STATUS.PASSED]: "Topshirdi",
  [PLAN_STATUS.CANCELLED]: "Bekor qilindi",
  [PLAN_STATUS.SUPERSEDED]: "Almashtirildi",
});

export const PLAN_STATUS_VARIANTS = Object.freeze({
  [PLAN_STATUS.PLANNED]: "default",
  [PLAN_STATUS.PASSED]: "secondary",
  [PLAN_STATUS.CANCELLED]: "destructive",
  [PLAN_STATUS.SUPERSEDED]: "outline",
});

export const statusOptions = [
  { value: PLAN_STATUS.PLANNED, label: PLAN_STATUS_LABELS[PLAN_STATUS.PLANNED] },
  { value: PLAN_STATUS.PASSED, label: PLAN_STATUS_LABELS[PLAN_STATUS.PASSED] },
  { value: PLAN_STATUS.CANCELLED, label: PLAN_STATUS_LABELS[PLAN_STATUS.CANCELLED] },
  { value: PLAN_STATUS.SUPERSEDED, label: PLAN_STATUS_LABELS[PLAN_STATUS.SUPERSEDED] },
];

/* ─────────────────────────── MUDDAT ─────────────────────────── */

export const DUE_FILTERS = Object.freeze({
  OVERDUE: "overdue",
  UPCOMING: "upcoming",
  NONE: "none",
});

export const dueOptions = [
  { value: ALL, label: "Hamma muddat" },
  { value: DUE_FILTERS.OVERDUE, label: "Muddati o'tgan" },
  { value: DUE_FILTERS.UPCOMING, label: "Muddati kelmagan" },
  { value: DUE_FILTERS.NONE, label: "Muddati yo'q" },
];

/* ─────────────────────── MOSLASHTIRISH (import) ─────────────────────── */

export const MATCH = Object.freeze({
  AUTO: "auto",
  AUTO_SCHOOL: "school",
  LEARNED: "learned",
  SUGGESTED: "suggested",
  AMBIGUOUS: "ambiguous",
  NONE: "none",
});

/** Avtomatik ulangan holatlar — tasdiqlash shart emas. */
export const RESOLVED_MATCHES = new Set([
  MATCH.AUTO,
  MATCH.AUTO_SCHOOL,
  MATCH.LEARNED,
]);

export const MATCH_LABELS = Object.freeze({
  [MATCH.AUTO]: "Topildi",
  [MATCH.AUTO_SCHOOL]: "Topildi (boshqa sinf)",
  [MATCH.LEARNED]: "Avvalgi importdan",
  [MATCH.SUGGESTED]: "Tasdiqlash kerak",
  [MATCH.AMBIGUOUS]: "Bir xil nomli bir nechta",
  [MATCH.NONE]: "Topilmadi",
});

export const MATCH_VARIANTS = Object.freeze({
  [MATCH.AUTO]: "default",
  [MATCH.AUTO_SCHOOL]: "secondary",
  [MATCH.LEARNED]: "secondary",
  [MATCH.SUGGESTED]: "outline",
  [MATCH.AMBIGUOUS]: "destructive",
  [MATCH.NONE]: "destructive",
});

/* ─────────────────────────── SANA ─────────────────────────── */

/**
 * `@db.Date` qiymatini `<input type="date">` uchun kesib oladi.
 *
 * ⚠️ `toDateInputValue` ISHLATILMAYDI: u LOKAL vaqtga o'giradi, muddat esa
 * serverdan UTC yarim tuni bilan keladi ("2026-12-01T00:00:00.000Z").
 * Manfiy ofsetli brauzerda (UTC−5) u sanani bir kun orqaga surib yuborardi.
 * Bu — ISO QIYMAT, format emas: ekranda server bergan `dueDateLabel`
 * ko'rsatiladi (`dates.md` §3 istisnosi).
 *
 * @param {string|null} value
 * @returns {string} "YYYY-MM-DD" yoki ""
 */
export const dueToInputValue = (value) =>
  typeof value === "string" ? value.slice(0, 10) : "";

/**
 * ⚠️ "12 kun qoldi" MATNI BU YERDA YO'Q va qayta yozilmaydi: u SERVERDAN
 * `plan.daysLeftLabel` bo'lib keladi. Ikki panelda (admin va o'quvchi)
 * ikki nusxa bo'lsa, matnlar vaqt o'tishi bilan ajralib ketardi.
 */
