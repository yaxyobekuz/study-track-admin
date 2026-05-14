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

export const SUMMARY_CARDS = [
  { key: "present", label: "Keldi", color: "bg-green-100 text-green-700" },
  { key: "late", label: "Kech keldi", color: "bg-yellow-100 text-yellow-700" },
  { key: "absent", label: "Kelmadi", color: "bg-red-100 text-red-700" },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
  { key: "unmarked", label: "Belgilanmagan", color: "bg-gray-100 text-gray-500" },
];
