export const leadStatusLabels = {
  new: "Yangi",
  contacted: "Bog'lanildi",
  interested: "Qiziqmoqda",
  visited: "Tashrif buyurdi",
  trial: "Sinov darsi",
  negotiation: "Muzokara",
  enrolled: "Ro'yxatdan o'tdi",
  rejected: "Rad etdi",
  lost: "Yo'qoldi",
  postponed: "Keyinga qoldirildi",
};

export const leadStatusColors = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-cyan-100 text-cyan-700",
  interested: "bg-indigo-100 text-indigo-700",
  visited: "bg-purple-100 text-purple-700",
  trial: "bg-amber-100 text-amber-700",
  negotiation: "bg-orange-100 text-orange-700",
  enrolled: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  lost: "bg-gray-100 text-gray-500",
  postponed: "bg-yellow-100 text-yellow-700",
};

export const leadStatusOptions = [
  { value: "all", label: "Barcha statuslar" },
  { value: "new", label: "Yangi" },
  { value: "contacted", label: "Bog'lanildi" },
  { value: "interested", label: "Qiziqmoqda" },
  { value: "visited", label: "Tashrif buyurdi" },
  { value: "trial", label: "Sinov darsi" },
  { value: "negotiation", label: "Muzokara" },
  { value: "enrolled", label: "Ro'yxatdan o'tdi" },
  { value: "rejected", label: "Rad etdi" },
  { value: "lost", label: "Yo'qoldi" },
  { value: "postponed", label: "Keyinga qoldirildi" },
];

export const leadStatusChartColors = {
  new: "#3b82f6",
  contacted: "#06b6d4",
  interested: "#6366f1",
  visited: "#a855f7",
  trial: "#f59e0b",
  negotiation: "#f97316",
  enrolled: "#22c55e",
  rejected: "#ef4444",
  lost: "#6b7280",
  postponed: "#eab308",
};

export const periodOptions = [
  { value: "7", label: "Oxirgi 7 kun" },
  { value: "30", label: "Oxirgi 30 kun" },
  { value: "90", label: "Oxirgi 90 kun" },
  { value: "180", label: "Oxirgi 6 oy" },
  { value: "365", label: "Oxirgi 1 yil" },
  { value: "custom", label: "Maxsus muddat" },
];

export const groupByOptions = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];

// Status tabs for analytics breakdown
export const analyticsTabOptions = [
  { value: "overview", label: "Umumiy" },
  { value: "funnel", label: "Funnel" },
  { value: "sources", label: "Manbalar" },
  { value: "directions", label: "Yo'nalishlar" },
  { value: "categories", label: "Toifalar" },
  { value: "trends", label: "Trendlar" },
];

// Chart bar colors (consistent palette)
export const chartBarColors = [
  "#3b82f6",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#f59e0b",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

export const leadActivityTypeLabels = {
  call: "Qo'ng'iroq",
  meeting: "Uchrashuv",
  note: "Izoh",
  status_change: "Status o'zgarishi",
  visit: "Tashrif",
};

export const leadActivityTypeColors = {
  call: "bg-blue-100 text-blue-700",
  meeting: "bg-purple-100 text-purple-700",
  note: "bg-gray-100 text-gray-700",
  status_change: "bg-amber-100 text-amber-700",
  visit: "bg-green-100 text-green-700",
};
