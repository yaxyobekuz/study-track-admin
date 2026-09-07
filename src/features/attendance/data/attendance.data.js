export const STATUS_LABELS = {
  present: "Keldi",
  late: "Kech keldi",
  absent: "Kelmadi",
  excused: "Sababli",
};

export const STATUS_COLORS = {
  present: "bg-green-100 text-green-700",
  late: "bg-yellow-100 text-yellow-700",
  absent: "bg-red-100 text-red-700",
  excused: "bg-blue-100 text-blue-700",
};

export const STATUS_DOT_COLORS = {
  present: "bg-green-500",
  late: "bg-yellow-500",
  absent: "bg-red-500",
  excused: "bg-blue-500",
};

// Oylik davomat (o'quvchi va xodim) uchun yig'indi kartalari - holatlar bo'yicha
export const STATUS_SUMMARY_CARDS = [
  { key: "present", label: "Keldi", color: "bg-green-100 text-green-700" },
  { key: "late", label: "Kech keldi", color: "bg-yellow-100 text-yellow-700" },
  { key: "absent", label: "Kelmadi", color: "bg-red-100 text-red-700" },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
];

// Xodimlar kunlik davomati uchun yig'indi kartalari
export const STAFF_SUMMARY_CARDS = [
  { key: "total", label: "Jami", color: "bg-gray-100 text-gray-700" },
  { key: "present", label: "Keldi", color: "bg-green-100 text-green-700" },
  { key: "late", label: "Kech keldi", color: "bg-yellow-100 text-yellow-700" },
  { key: "absent", label: "Kelmadi", color: "bg-red-100 text-red-700" },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
  { key: "notMarked", label: "Belgilanmagan", color: "bg-gray-50 text-gray-400" },
];

// Xodimlar uchun rol filtri yordamchisi: rollardan select optionlari yasaydi
export const buildRoleOptions = (roles = []) => [
  { label: "Barcha rollar", value: "all" },
  ...roles.map((r) => ({ label: r.name, value: r.value })),
];

// Rol value -> label (name) xaritasi. Jadvallarda value emas, tushunarli label ko'rsatish uchun.
export const buildRoleLabelMap = (roles = []) =>
  Object.fromEntries(roles.map((r) => [r.value, r.name]));

// Holat filtri optionlari - 4 ta asosiy holat (oylik davomat sahifalari uchun)
export const STATUS_FILTER_OPTIONS = [
  { label: "Barcha holatlar", value: "all" },
  { label: "Keldi", value: "present" },
  { label: "Kech keldi", value: "late" },
  { label: "Kelmadi", value: "absent" },
  { label: "Sababli", value: "excused" },
];

// Xodimlar kunlik davomati - "Belgilanmagan" (not_marked) ham qo'shiladi
export const STAFF_DAILY_STATUS_OPTIONS = [
  ...STATUS_FILTER_OPTIONS,
  { label: "Belgilanmagan", value: "not_marked" },
];

// O'quvchilar kunlik davomati - holat filtri.
// "Kelganlar (jami)" = keldi + kech keldi (kech kelgan ham kelgan hisoblanadi),
// "Keldi (o'z vaqtida)" esa faqat `present`. "Belgilanmagan" - yozuvi yo'qlar.
export const STUDENT_DAILY_STATUS_OPTIONS = [
  { label: "Barcha holatlar", value: "all" },
  { label: "Kelganlar (jami)", value: "came" },
  { label: "Keldi (o'z vaqtida)", value: "present" },
  { label: "Kech keldi", value: "late" },
  { label: "Kelmadi", value: "absent" },
  { label: "Sababli", value: "excused" },
  { label: "Belgilanmagan", value: "unmarked" },
];

// Belgilash sahifasi filtri - kunlik bilan bir xil. Filtr SAQLANGAN (serverdagi)
// holat bo'yicha ishlaydi: foydalanuvchi qatorni o'zgartirganda u ro'yxatdan
// g'oyib bo'lmaydi.
export const MARK_FILTER_OPTIONS = STUDENT_DAILY_STATUS_OPTIONS;

/**
 * Saqlangan holat filtrga mos keladimi (kunlik va belgilash sahifalari uchun
 * umumiy). `came` = present | late, `unmarked` = yozuv yo'q (null).
 * @param {string|null} status - bazadagi holat yoki null
 * @param {string} filter - filtr qiymati ("all" / "" = hammasi)
 */
export const matchesStatusFilter = (status, filter) => {
  if (!filter || filter === "all") return true;
  if (filter === "came") return status === "present" || status === "late";
  if (filter === "unmarked") return !status;
  return status === filter;
};

// Davomat belgilash uchun holat tugmalari (segmented control)
export const MARK_STATUS_OPTIONS = [
  { value: "present", label: "Keldi" },
  { value: "late", label: "Kech keldi" },
  { value: "absent", label: "Kelmadi" },
  { value: "excused", label: "Sababli" },
];

// Belgilash tugmasining tanlangan/aktiv ko'rinishi.
// hover: ranglari ham saqlanadi (Button outline varianti hover:bg-accent ni bermasligi uchun).
export const MARK_SELECTED_COLORS = {
  present: "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700",
  late: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-700",
  absent: "bg-red-100 text-red-700 hover:bg-red-100 hover:text-red-700",
  excused: "bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700",
};

export const MONTH_OPTIONS = [
  { label: "Yanvar", value: 1 },
  { label: "Fevral", value: 2 },
  { label: "Mart", value: 3 },
  { label: "Aprel", value: 4 },
  { label: "May", value: 5 },
  { label: "Iyun", value: 6 },
  { label: "Iyul", value: 7 },
  { label: "Avgust", value: 8 },
  { label: "Sentyabr", value: 9 },
  { label: "Oktyabr", value: 10 },
  { label: "Noyabr", value: 11 },
  { label: "Dekabr", value: 12 },
];

export const EXCUSE_TYPE_LABELS = {
  advance: "Oldindan",
  after: "Keyindan",
};

export const EXCUSE_STATUS_LABELS = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlandi",
  rejected: "Rad etildi",
};

export const EXCUSE_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export const REVIEW_ACTION_OPTIONS = [
  { label: "Tasdiqlash", value: "approved" },
  { label: "Rad etish", value: "rejected" },
];

export const WORK_DAYS_OPTIONS = [
  { label: "Ya", value: 0 },
  { label: "Du", value: 1 },
  { label: "Se", value: 2 },
  { label: "Ch", value: 3 },
  { label: "Pa", value: 4 },
  { label: "Ju", value: 5 },
  { label: "Sh", value: 6 },
];

/** Hafta kuni raqami → to'liq nom (JS `getDay()` tartibida). */
export const WEEK_DAY_NAMES = {
  0: "Yakshanba",
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
};
