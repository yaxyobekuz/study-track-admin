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
