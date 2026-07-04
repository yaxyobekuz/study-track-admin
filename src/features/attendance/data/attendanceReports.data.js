// Hafta kunlari (server: 0=Yakshanba ... 6=Shanba)
export const WEEKDAY_LABELS = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  0: "Yakshanba",
};

// Umumiy davomat foizi kartalari (qiymatlar sahifada to'ldiriladi)
export const OVERALL_PERCENT_CARDS = [
  { key: "daily", label: "Bugun" },
  { key: "weekly", label: "Shu hafta" },
  { key: "monthly", label: "Tanlangan oy" },
];

// Foizga qarab rang: yashil (yaxshi) -> qizil (yomon)
export const getPercentColor = (percent) => {
  if (percent == null) return "bg-gray-100 text-gray-400";
  if (percent >= 90) return "bg-green-100 text-green-700";
  if (percent >= 75) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

// Grafik ustunlari uchun hex rang (recharts uchun)
export const getPercentHex = (percent) => {
  if (percent == null) return "#d1d5db";
  if (percent >= 90) return "#22c55e";
  if (percent >= 75) return "#eab308";
  return "#ef4444";
};

// Reyting (1-3 o'rin) badge ranglari
export const RANK_COLORS = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-gray-200 text-gray-700",
  3: "bg-orange-100 text-orange-700",
};
