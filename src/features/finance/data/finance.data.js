// Moliya bo'limining qayta ishlatiladigan statik ma'lumotlari
// (yorliqlar, variantlar, ranglar). Sahifalar ichida hardcode qilinmaydi.
//
// Valyuta yo'q — barcha summalar so'mda.

/** Ro'yxatdagi holat filtri. */
export const TARIFF_STATUS_OPTIONS = [
  { label: "Barchasi", value: "all" },
  { label: "Faol", value: "active" },
  { label: "Nofaol", value: "inactive" },
  { label: "Arxivlangan", value: "archived" },
];

/**
 * Holat filtri qiymatini API query paramlariga o'giradi.
 * @param {string} value
 * @returns {{isActive?: string, isArchived?: string}}
 */
export const statusToParams = (value) => {
  switch (value) {
    case "active":
      return { isActive: "true" };
    case "inactive":
      return { isActive: "false" };
    case "archived":
      return { isArchived: "true" };
    default:
      return { isArchived: "all" };
  }
};

/** Tarif holati uchun badge ko'rinishi. */
export const getTariffStatus = (tariff) => {
  if (tariff.isArchived) {
    return { label: "Arxivlangan", className: "bg-gray-100 text-gray-600" };
  }
  if (!tariff.isActive) {
    return { label: "Nofaol", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Faol", className: "bg-green-100 text-green-700" };
};

/**
 * Narx hal qilinmagan hollar uchun izoh (server `reason` maydoni).
 * `no_price` — konfiguratsiya xatosi, shuning uchun ogohlantirish rangida.
 */
export const RESOLVE_REASON_LABELS = {
  no_assignment: {
    label: "Tarif biriktirilmagan",
    className: "bg-gray-100 text-gray-600",
  },
  no_price: {
    label: "Bu oyga narx belgilanmagan",
    className: "bg-red-100 text-red-700",
  },
};

/** Biriktirish davri holati (o'tgan / amaldagi / kelajakdagi). */
export const getPeriodStatus = (startMonth, endMonth, currentMonth) => {
  if (startMonth > currentMonth) {
    return { label: "Kelajakda", className: "bg-blue-100 text-blue-700" };
  }
  if (endMonth != null && endMonth < currentMonth) {
    return { label: "Tugagan", className: "bg-gray-100 text-gray-600" };
  }
  return { label: "Amalda", className: "bg-green-100 text-green-700" };
};

/** Tariflar ro'yxati jadvalining sarlavhalari. */
export const TARIFF_TABLE_COLUMNS = [
  "Tarif",
  "Joriy oylik narx",
  "Amal qilish davri",
  "O'quvchilar",
  "Holat",
  "",
];

/** Narx tarixi jadvalining sarlavhalari. */
export const VERSION_TABLE_COLUMNS = ["Davr", "Oylik summa", "Holat", ""];

/** Tarif detalidagi biriktirilgan o'quvchilar jadvali. */
export const ASSIGNED_STUDENT_TABLE_COLUMNS = [
  "O'quvchi",
  "Davr",
  "Joriy oydagi summa",
  "Holat",
  "",
];

// ── Hisob-fakturalar ─────────────────────────

/** Majburiyat holati uchun badge. */
export const INVOICE_STATUS_META = {
  unpaid: { label: "To'lanmagan", className: "bg-red-100 text-red-700" },
  partial: { label: "Qisman to'langan", className: "bg-amber-100 text-amber-700" },
  paid: { label: "To'langan", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-600" },
};

export const INVOICE_STATUS_OPTIONS = [
  { label: "Barchasi", value: "all" },
  { label: "To'lanmagan", value: "unpaid" },
  { label: "Qisman to'langan", value: "partial" },
  { label: "To'langan", value: "paid" },
  { label: "Bekor qilingan", value: "cancelled" },
];

export const INVOICE_TABLE_COLUMNS = [
  "O'quvchi",
  "Tarif",
  "Summa",
  "To'langan",
  "Qarz",
  "Holat",
  "",
];

/** To'lov usullari. */
export const PAYMENT_METHOD_OPTIONS = [
  { label: "Naqd", value: "cash" },
  { label: "Plastik", value: "card" },
  { label: "O'tkazma", value: "transfer" },
  { label: "Boshqa", value: "other" },
];

// ── O'quvchi moliyaviy holati ────────────────

/** Faol / Muzlatilgan / Chetlatilgan uchun badge. */
export const FINANCE_STATUS_META = {
  active: { label: "Faol", className: "bg-green-100 text-green-700" },
  frozen: { label: "Muzlatilgan", className: "bg-blue-100 text-blue-700" },
  expelled: { label: "Chetlatilgan", className: "bg-red-100 text-red-700" },
};

export const FINANCE_STATUS_OPTIONS = [
  { label: "Faol", value: "active" },
  { label: "Muzlatilgan", value: "frozen" },
  { label: "Chetlatilgan", value: "expelled" },
];

/** O'quv yili boshlanish oyi (sozlamalar sahifasi uchun). */
export const MONTH_OF_YEAR_OPTIONS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
].map((label, index) => ({ label, value: String(index + 1) }));

/** O'quv yili davomiyligi — serverda faqat shu ikkisi qabul qilinadi. */
export const ACADEMIC_MONTH_COUNT_OPTIONS = [
  { label: "9 oy", value: "9" },
  { label: "11 oy", value: "11" },
];
