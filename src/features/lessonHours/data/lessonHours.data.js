/**
 * DARS SOATLARI BO'LIMI — STATIK MA'LUMOT.
 *
 * ⚠️ Ustunlar, yorliqlar va sabab toifalari komponent ichida yozilmaydi:
 * bir xil ro'yxat ikki joyda paydo bo'lsa, biri o'zgarib ikkinchisi
 * eskirardi (`payroll.data.js` bilan bir xil qoida).
 */

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

/* ─────────────────────── SHARTNOMA SHARTI ─────────────────────── */

/**
 * SOAT NARXI QAYERDAN — server `RATE_SOURCES` ning ko'zgusi
 * (`staffContract.service.js`).
 *
 * ⚠️ Rejim (Fiksa / KPI / Aralash) bu yerda TANLANMAYDI: u kiritilgan
 * qismlardan hosil bo'ladi. Alohida tanlov bo'lsa, "Fiksa" belgilanib
 * soat narxi ham yozilgan holat paydo bo'lardi va qaysi biri haqiqat
 * ekani noaniq qolardi.
 */
export const RATE_SOURCE_OPTIONS = [
  { value: "none", label: "Yo'q" },
  { value: "category", label: "Toifa bo'yicha" },
  { value: "manual", label: "Qo'lda" },
];

/** Ustama turi — server `ALLOWANCE_TYPES` (`salaryRules.helpers.js`). */
export const ALLOWANCE_KIND_OPTIONS = [
  { value: "fixed", label: "so'm" },
  { value: "percent", label: "%" },
];

export const CONTRACT_HINTS = {
  category: "Toifa oy bo'yicha saqlanmaydi: u hali shakllantirilmagan barcha oylarga ta'sir qiladi.",
  sealed:
    "Bu oylar majburiyati allaqachon shakllantirilgan va summasi muhrlangan — o'zgarish ularga ta'sir qilmaydi.",
  bonuses: "Zayavka orqali tasdiqlangan — \"Oylik zayavkalari\" bo'limida boshqariladi.",
  percent: "Foizli ustama fiksa va soatdan chiqqan summa yig'indisidan olinadi.",
};

/* ─────────────────────── O'TILMAGAN DARSLAR ─────────────────────── */

/**
 * Qoida matni — server `judgeLesson` (`helpers/lessonHours.js`) bilan AYNI.
 * Sabab yorliqlari serverdan keladi (`reasonLabel`), bu yerda nusxasi yo'q.
 */
export const MISSED_LESSONS_HINT = {
  rule:
    "O'qituvchi kelmagan yoki sababli kelmagan kun va hech kimga baho qo'yilmagan dars o'tilmagan hisoblanadi — soati oylikka yozilmaydi.",
  today: "Bugungi darslar ertaga tekshiriladi.",
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
