/**
 * DARS SOATLARI BO'LIMI — STATIK MA'LUMOT.
 *
 * ⚠️ Ustunlar, yorliqlar va sabab toifalari komponent ichida yozilmaydi:
 * bir xil ro'yxat ikki joyda paydo bo'lsa, biri o'zgarib ikkinchisi
 * eskirardi (`payroll.data.js` bilan bir xil qoida).
 */

import { MODE } from "./ledger.tokens";

/* ─────────────────────── TABLAR ─────────────────────── */

/**
 * ⚠️ `monthScoped` — tab OY KESIMIDAMI. Oy tanlagichi layoutdagi tablar
 * qatorida turadi (joyni tejash uchun), lekin u faqat oy bo'yicha
 * o'lchanadigan ekranlarda ma'noli. O'rinbosarlik ro'yxati sana oralig'i
 * bilan ishlaydi, oy bilan emas — u yerda tanlagich chalg'itardi.
 */
export const HOURS_TABS = [
  {
    to: "/lesson-hours/overview",
    label: "Ko'rsatkichlar",
    title: "Dars soatlari",
    can: "payroll.hours",
    monthScoped: true,
    exact: false,
  },
  {
    to: "/lesson-hours/ledger",
    label: "Vedomost",
    title: "Dars soatlari",
    can: "payroll.hours",
    monthScoped: true,
    exact: false,
  },
  {
    to: "/lesson-hours/substitutions",
    label: "O'rinbosarlik",
    title: "Dars soatlari",
    can: "substitutions.view",
    monthScoped: false,
    exact: false,
  },
];

/* ─────────────────────── O'RINBOSARLIK ─────────────────────── */

/**
 * Sabab TOIFASI — server `SubstitutionReason` enumining ko'zgusi.
 *
 * ⚠️ Toifa erkin izohdan ALOHIDA va bu ataylab: "bu yil nechta dars
 * kasallik sababli ko'chirildi" degan savolga erkin matndan javob
 * bo'lmasdi.
 */
export const SUBSTITUTION_REASONS = [
  { value: "illness", label: "Kasallik" },
  { value: "business_trip", label: "Xizmat safari" },
  { value: "personal", label: "Shaxsiy sabab" },
  { value: "training", label: "Malaka oshirish" },
  { value: "other", label: "Boshqa sabab" },
];

export const REASON_LABELS = Object.fromEntries(
  SUBSTITUTION_REASONS.map((r) => [r.value, r.label]),
);

/** Yozuvning VAQT holati — `status` (qaror) dan alohida. */
export const PHASE_META = {
  ongoing: { label: "Davom etmoqda", chip: "bg-indigo-50 text-indigo-700", rail: "taken" },
  upcoming: { label: "Kutilmoqda", chip: "bg-slate-100 text-slate-600", rail: "planned" },
  finished: { label: "Yakunlangan", chip: "bg-emerald-50 text-emerald-700", rail: "settled" },
  cancelled: { label: "Bekor qilingan", chip: "bg-slate-100 text-slate-500", rail: "neutral" },
};

/* ─────────────────────── JADVAL USTUNLARI ─────────────────────── */

export const LEDGER_COLUMNS = [
  "O'qituvchi",
  "Rejim",
  { label: "Haftasiga", align: "right" },
  { label: "Oyiga", align: "right" },
  { label: "O'tildi", align: "right" },
  { label: "O'rinbosarlik", align: "center" },
  { label: "Hisoblanmoqda", align: "right" },
  { label: "Oy oxirida", align: "right" },
  "",
];

export const SUBSTITUTION_COLUMNS = [
  "Kim o'rniga",
  "O'rinbosar",
  "Davr",
  "Sabab",
  { label: "Darslar", align: "center" },
  "Holat",
  "",
];

/* ─────────────────────── REJIM TANLOVI ─────────────────────── */

/**
 * Rejim tanlash kartochkalari — modal ichida.
 * `MODE` tokendan keladi, bu yerda faqat TARTIB va tanlov matni.
 */
export const MODE_OPTIONS = [
  {
    ...MODE.fixed,
    fields: ["amount"],
    example: "5 000 000 so'm/oy — dars soati summaga ta'sir qilmaydi",
  },
  {
    ...MODE.hourly,
    fields: ["hourlyRate"],
    example: "60 000 so'm × o'tilgan soat",
  },
  {
    ...MODE.mixed,
    fields: ["amount", "hourlyRate", "monthlyHourNorm"],
    example: "4 000 000 so'm + 80 soatdan ortig'i uchun 70 000 so'm/soat",
  },
];

/* ─────────────────────── YORDAMCHILAR ─────────────────────── */

/**
 * Soat — BUTUN son (domenda "soat" = dars soni), guruhlash bilan.
 *
 * ⚠️ `formatMoney` ning ko'zgusi: bitta formatlovchi modul darajasida
 * yaratiladi, har chaqiruvda emas — `Intl.NumberFormat` qimmat obyekt va
 * jadvalda u yuzlab marta chaqiriladi.
 *
 * Bo'sh qiymat → em-dash: bo'sh katak "nol" deb o'qilardi.
 */
const hourFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 0,
});

export const formatHours = (value) =>
  value == null ? "—" : `${hourFormatter.format(value)} soat`;

/** Faqat raqam — jadval ustuni uchun ("soat" so'zi sarlavhada turadi). */
export const formatHourNumber = (value) =>
  value == null ? "—" : hourFormatter.format(value);

/**
 * Progress halqasi uchun ulush (0..1). Norma oshib ketsa 1 da to'xtaydi —
 * halqa aylanib ketmasligi kerak; oshgani ALOHIDA yozuv bilan ko'rsatiladi.
 */
export const normRatio = (progress) =>
  progress == null ? null : Math.max(0, Math.min(1, progress / 100));
