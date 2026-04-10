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
