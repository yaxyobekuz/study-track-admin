// Moliya hisobotlarining statik ma'lumotlari: tablar, ranglar, yorliqlar.
// Sahifa va diagramma ichida hardcode qilinmaydi.
//
// Valyuta yo'q — barcha summalar so'mda va backenddan 2 xonali STRING bo'lib
// keladi. Diagrammaga berishdan oldin `Number()` ga o'giriladi (recharts
// faqat son bilan ishlaydi), lekin ARIFMETIKA qilinmaydi — yig'indi va
// foizlarni backend hisoblab beradi.

/** Sahifa tablari. Tartib — savolning tabiiy ketma-ketligi bo'yicha:
 *  qancha hisobladik → qancha pul kirdi → qancha qoldi → qayerdan keladi. */
export const REPORT_TABS = [
  { value: "overview", label: "Umumiy" },
  { value: "cashflow", label: "Tushum" },
  { value: "debt", label: "Qarzdorlik" },
  { value: "tariffs", label: "Tarif va chegirma" },
  { value: "external", label: "Tashqi kirim" },
  { value: "expenses", label: "Chiqim" },
];

/** Oylar oralig'i tanlagichi. */
export const PERIOD_OPTIONS = [
  { label: "Oxirgi 6 oy", value: "6" },
  { label: "Oxirgi 12 oy", value: "12" },
  { label: "Oxirgi 24 oy", value: "24" },
];

/** Kunlik tushum guruhlash darajasi. */
export const CASHFLOW_GROUP_OPTIONS = [
  { label: "Kunlik", value: "day" },
  { label: "Haftalik", value: "week" },
  { label: "Oylik", value: "month" },
];

/**
 * Diagramma ranglari.
 *
 * Ma'no biriktirilgan ranglar (pastda) o'zgarmaydi: yashil doim "yig'ilgan",
 * qizil doim "qarz". Aks holda bir sahifada yashil ustun bir joyda tushum,
 * boshqa joyda qarzni bildirib qolardi.
 */
export const CHART_COLORS = {
  invoiced: "#3b82f6", // ko'k — hisoblangan
  collected: "#22c55e", // yashil — yig'ilgan
  debt: "#ef4444", // qizil — qarz
  discount: "#a855f7", // binafsha — chegirma
  proration: "#f59e0b", // sariq — proratsiya
  rate: "#6366f1", // indigo — undirish foizi
};

/** Ulush diagrammalari uchun (tarif, to'lov turi, sinf) — takrorlanadi. */
export const CHART_PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#f97316",
  "#14b8a6",
  "#ef4444",
];

/**
 * Qarz yoshi guruhlari rangi — eskirgani qanchalik qizilroq.
 * Kalitlar server `AGING_BUCKETS` bilan bir xil.
 */
export const AGING_COLORS = {
  current: "#22c55e",
  m1: "#84cc16",
  m2_3: "#f59e0b",
  m4_6: "#f97316",
  m7plus: "#ef4444",
};

/** O'sish/pasayish belgisi. */
export const getTrend = (changePercent) => {
  const value = Number(changePercent ?? 0);
  if (value > 0) return { direction: "up", className: "text-green-600", sign: "+" };
  if (value < 0) return { direction: "down", className: "text-red-600", sign: "" };
  return { direction: "flat", className: "text-gray-400", sign: "" };
};

/**
 * Undirish foizining "sog'lomligi" — kassirga bir qarashda tushunarli bo'lsin.
 * Chegara biznes qarori: 80% dan yuqorisi yaxshi, 50% dan pasti xavotirli.
 */
export const getCollectionTone = (rate) => {
  const value = Number(rate ?? 0);
  if (value >= 80) return "text-green-600";
  if (value >= 50) return "text-amber-600";
  return "text-red-600";
};

/** Katta summani o'qi uchun qisqartirish: 538170000 → "538 mln". */
export const compactMoney = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)} mlrd`;
  if (abs >= 1e6) return `${Math.round(n / 1e6)} mln`;
  if (abs >= 1e3) return `${Math.round(n / 1e3)} ming`;
  return String(Math.round(n));
};
