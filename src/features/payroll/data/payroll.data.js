// Xodimlar oyligi bo'limining statik ma'lumotlari.
//
// Oylik — CHIQIM tomonining o'quvchi registriga o'xshashi: qoida belgilanadi,
// har oy majburiyat hisoblanadi, to'lov uni yopadi.

/** Bo'limning ichki tablari. */
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
  "Hisoblangan",
  "To'langan",
  "Qoldiq",
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
