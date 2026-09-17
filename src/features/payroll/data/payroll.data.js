// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Xodimlar oyligi bo'limining statik ma'lumotlari.
//
// Oylik — CHIQIM tomonining o'quvchi registriga o'xshashi: qoida belgilanadi,
// har oy majburiyat hisoblanadi, to'lov uni yopadi.

/** Yo'nalish (payroll ko'rinishi). */
export const DIRECTION_OPTIONS = [
  { value: "salary", label: "Oylik maosh" },
];

/** Struktura tablari. */
export const PAYROLL_MAIN_TABS = [
  { value: "structure", label: "Struktura" },
  { value: "allowances", label: "Ustama" },
  { value: "obligations", label: "Majburiyatlar" },
];

/** Staff bo'lim xodimlari jadvali. */
export const STAFF_PAYROLL_COLUMNS = ["Xodim", "Lavozim", "Bazaviy maosh", "Ustama", "Yakuniy oylik", ""];

/** Lavozimlar jadvali. */
export const POSITION_COLUMNS = ["Lavozim", "Bazaviy maosh", "Xodimlar", ""];

/** Ustama haq registri jadvali (Yo'nalish -> Ustama haq). */
export const ALLOWANCE_VIEW_COLUMNS = [
  "Xodim",
  "Bo'lim",
  "Ustamalari",
  { label: "Oylik", align: "right" },
  { label: "Ustama", align: "right" },
  { label: "Jami", align: "right" },
  "Holat",
  "",
];

export const ALLOWANCE_STATUS_OPTIONS = [
  { label: "Barchasi", value: "" },
  { label: "Faol", value: "active" },
  { label: "Kutilmoqda", value: "pending" },
];

/** Teaching toifalar jadvali (reference). */
export const CATEGORY_V2_COLUMNS = [
  "Toifa turi",
  "Bir soat uchun",
  "Bir oy uchun",
  "Dars soati / stavka",
  "Asosiy maosh",
  "O'qituvchilar",
  "",
];

/** Toifa o'qituvchilari jadvali. */
export const TEACHER_PAYROLL_COLUMNS = ["O'qituvchi", "Dars soati", "Soatbay hisob", "Ustama", "Yakuniy oylik", ""];

/** Bo'limning ichki tablari (eski). */
export const PAYROLL_TABS = [
  { value: "entries", label: "Oyliklar" },
  { value: "rules", label: "Qoidalar" },
  { value: "categories", label: "Toifalar" },
];

/** Malaka toifalari jadvali (soatlik KPI stavka). */
export const CATEGORY_TABLE_COLUMNS = ["Toifa", "Soat narxi (KPI)", "Oyliklar", "Holat", ""];

export const CATEGORY_STATUS_OPTIONS = [
  { label: "Faol", value: "active" },
  { label: "Nofaol", value: "inactive" },
  { label: "Arxivlangan", value: "archived" },
];

/** Ustama qoidasi turi. */
export const ALLOWANCE_TYPE_OPTIONS = [
  { label: "Qat'iy summa (so'm)", value: "fixed" },
  { label: "Foiz (fiksadan)", value: "percent" },
];

export const CATEGORY_HINT =
  "Har malaka toifasi soatiga har xil summa oladi. Xodim toifasiga qarab " +
  "uning KPI oyligi (dars soati × toifa stavkasi) hisoblanadi.";

export const ENTRY_TABLE_COLUMNS = [
  "Xodim",
  "Oy",
  { label: "Oylik", align: "right" },
  { label: "Ustama", align: "right" },
  { label: "Jami", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Holat",
  "",
];

export const RULE_TABLE_COLUMNS = ["Xodim", "Turi", "Oylik", "Davr", "Holat", ""];

/** Oylik turi badge'i (fiksa / KPI / ikkalasi). */
export const SALARY_TYPE_META = {
  fixed: { label: "Fiksa", className: "bg-gray-100 text-gray-700" },
  kpi: { label: "KPI", className: "bg-indigo-100 text-indigo-700" },
  mixed: { label: "Fiksa + KPI", className: "bg-violet-100 text-violet-700" },
};

/**
 * KPI oyligi tushuntirishi — forma va tooltip uchun.
 * Server bilan bir xil (server/src/services/lessonHours.service.js).
 */
export const KPI_HINT =
  "KPI oyligi dars soatlariga qarab hisoblanadi: 1 dars soati narxi × " +
  "o'sha oydagi jami dars soati (jadvaldan). Fiksa bilan birga ham bo'lishi " +
  "mumkin. Oylik soat shakllantirilganda muhrlanadi.";

/** Majburiyat holati uchun badge. */
export const ENTRY_STATUS_META = {
  unpaid: { label: "To'lanmagan", className: "bg-red-100 text-red-700" },
  partial: { label: "Qisman to'langan", className: "bg-amber-100 text-amber-700" },
  paid: { label: "To'langan", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-600" },
};

export const ENTRY_STATUS_OPTIONS = [
  { label: "Barchasi", value: "" },
  { label: "To'lanmagan", value: "unpaid" },
  { label: "Qisman to'langan", value: "partial" },
  { label: "To'langan", value: "paid" },
];

/** Qoida davri holati. */
export const getRuleStatus = (rule, currentMonth) => {
  if (rule.startMonth > currentMonth) {
    return { label: "Kelajakda", className: "bg-blue-100 text-blue-700" };
  }
  if (rule.endMonth != null && rule.endMonth < currentMonth) {
    return { label: "Tugagan", className: "bg-gray-100 text-gray-600" };
  }
  return { label: "Amalda", className: "bg-green-100 text-green-700" };
};

/**
 * Ustama qatori yorlig'i (`allowanceBreakdown` elementi).
 *
 * `tutor` — tyutor guruhi: sinf va o'quvchilar soni qatorda MUHRLANGAN, shuning
 * uchun "nega shuncha" degan savolga qatorning o'zi javob beradi.
 *
 * @param {{label: string, type: string, value: number, studentCount?: number}} item
 * @returns {string}
 */
export const allowanceLineLabel = (item) => {
  if (item.type === "percent") return `${item.label} · ${item.value}%`;
  if (item.type === "tutor" && item.studentCount != null) {
    return `${item.label} · ${item.studentCount} o'quvchi`;
  }
  return item.label;
};

/** Ustama tafsiloti — jadval katagining `title` matni (qator-qator). */
export const allowanceTooltip = (breakdown = []) =>
  breakdown.map((item) => `${allowanceLineLabel(item)}: ${formatMoney(item.amount)}`).join("\n");

/**
 * Oylik summasini o'zgartirish qoidasi — oynada ko'rsatiladi.
 * Server bilan bir xil (server/src/services/payroll.service.js).
 */
export const PAYROLL_SEAL_HINT =
  "Shakllantirilgan oylik summasi muhrlanadi: uni tahrirlab bo'lmaydi. " +
  "Xato bo'lsa majburiyat bekor qilinadi, qoida to'g'rilanadi va oy " +
  "qaytadan shakllantiriladi.";

export const NO_ADVANCE_HINT =
  "Avans qo'llab-quvvatlanmaydi: to'lov qarzdan ko'p bo'lishi mumkin emas. " +
  "Lekin bitta oylikni bir necha marta bo'lib to'lash mumkin.";

export const EDIT_SALARY_PAYMENT_HINT =
  "Yozuv o'chirilmaydi: eski to'lov bekor qilinadi va to'g'ri summa bilan " +
  "yangisi yoziladi, ikkalasi ham tarixda qoladi. Kassa qoldig'i va oylik " +
  "qarzi avtomatik to'g'rilanadi.";

// ── Oylik zayavkalari (admin ko'rib chiqadi) ──
export const REQUEST_KIND_LABELS = {
  category: "Toifa o'zgartirish",
  bonus: "Ustama haq",
};

export const REQUEST_STATUS_META = {
  pending: { label: "Kutilmoqda", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Tasdiqlangan", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rad etilgan", className: "bg-red-100 text-red-600" },
};

export const REQUEST_STATUS_OPTIONS = [
  { label: "Kutilmoqda", value: "pending" },
  { label: "Tasdiqlangan", value: "approved" },
  { label: "Rad etilgan", value: "rejected" },
  { label: "Barchasi", value: "" },
];

export const REQUEST_KIND_OPTIONS = [
  { label: "Barchasi", value: "" },
  { label: "Toifa o'zgartirish", value: "category" },
  { label: "Ustama haq", value: "bonus" },
];

// Zayavkalar bo'limining ichki tablari
export const REQUESTS_TABS = [
  { value: "requests", label: "Zayavkalar" },
  { value: "audit", label: "O'zgarishlar tarixi" },
];

// ── Oylikdan ushlab qolish ──

/** Ushlab qolishlar registri jadvali. */
export const DEDUCTION_COLUMNS = [
  "Xodim",
  "Sabab",
  { label: "Qiymati", align: "right" },
  "Davr",
  { label: "Shu oy", align: "right" },
  "Holat",
  "",
];

export const DEDUCTION_STATUS_META = {
  active: { label: "Faol", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-600" },
};

export const DEDUCTION_STATUS_OPTIONS = [
  { label: "Faol", value: "active" },
  { label: "Bekor qilingan", value: "cancelled" },
  { label: "Barchasi", value: "" },
];

/** Kimdan: hammasi / tanlab / bitta xodim. */
export const DEDUCTION_SCOPE_OPTIONS = [
  { value: "all", label: "Hammasi" },
  { value: "pick", label: "Tanlab" },
  { value: "one", label: "Bitta xodim" },
];

/** Server `TYPES` (`payrollDeduction.service.js`) ning ko'zgusi. */
export const DEDUCTION_TYPE_OPTIONS = [
  { value: "fixed", label: "So'mda" },
  { value: "percent", label: "Foizda" },
  { value: "hours", label: "Dars soatida" },
];

/** Server `MAX_HOURS` bilan AYNI. */
export const DEDUCTION_MAX_HOURS = 500;

/** Qiymat matni: "10%", "3 soat", "500 000 so'm". */
export const formatDeductionValue = (type, value) =>
  type === "percent"
    ? `${Number(value)}%`
    : type === "hours"
      ? `${Number(value)} soat`
      : formatMoney(value);

/**
 * Davr. Server `endMonth` ni shunday o'qiydi: son → oraliq, `null` →
 * muddatsiz, berilmasa → faqat boshlanish oyi.
 */
export const DEDUCTION_PERIOD_OPTIONS = [
  { value: "once", label: "Faqat shu oy" },
  { value: "range", label: "Oraliq" },
  { value: "open", label: "Muddatsiz" },
];

/**
 * Muhrlangan oylik holati — server `sealStateOf` bilan AYNI kalitlar.
 * `locked` — to'lov tushgan, muhr o'zgarmaydi.
 */
export const SEAL_STATE_META = {
  none: { label: "Shakllanmagan", className: "bg-slate-100 text-slate-600" },
  resync: { label: "Qayta hisoblanadi", className: "bg-amber-100 text-amber-700" },
  locked: { label: "To'langan — o'zgarmaydi", className: "bg-gray-100 text-gray-500" },
};

export const DEDUCTION_HINTS = {
  hours:
    "Summa = dars soati × xodimning soat narxi (oylik shartidagi toifa yoki qo'lda " +
    "yozilgan narx). Soat narxi yo'q (faqat fiksa oylik oladigan) xodimdan ushlanmaydi.",
  percent:
    "Foiz jami hisoblangan oylikdan (fiksa + dars soati + ustamalar) olinadi. " +
    "Ushlab qolish oylikdan oshmaydi — oylik 0 dan pastga tushmaydi.",
  all:
    "Keyin oyligi belgilangan xodimlardan ham avtomatik ushlanadi. Birortasini " +
    "chiqarish kerak bo'lsa — registrda o'sha xodimning qatorini bekor qiling.",
  sealed:
    "Shu oy oyligi shakllantirilgan, lekin hali to'lanmagan bo'lsa, u ushlab " +
    "qolish bilan qayta hisoblanadi. Qisman yoki to'liq to'langan oylik o'zgarmaydi.",
  cancel:
    "Yozuv o'chirilmaydi — bekor qilingan deb belgilanadi. To'lanmagan " +
    "muhrlangan oylik ushlab qolishsiz qayta hisoblanadi.",
};

