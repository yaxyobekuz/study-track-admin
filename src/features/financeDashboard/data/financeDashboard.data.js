// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * Rahbar dashboardining statik ma'lumotlari: ranglar, yorliqlar,
 * formatlovchilar. Komponent ichida hardcode qilinmaydi.
 *
 * ⚠️ Summalar backenddan 2 xonali STRING bo'lib keladi. Diagrammaga
 * berishdan oldin `Number()` ga o'giriladi (recharts faqat son bilan
 * ishlaydi), lekin ARIFMETIKA qilinmaydi — yig'indi, ulush va foizlarni
 * backend hisoblab beradi.
 */

/**
 * Ma'no biriktirilgan ranglar. Bir ekranda yashil doim "kirim/foyda",
 * qizil doim "chiqim/qarz" bo'lishi kerak — aks holda ko'z ularni
 * boshqa-boshqa joyda boshqacha o'qiydi.
 */
export const COLORS = {
  income: "#22c55e",
  expense: "#ef4444",
  profit: "#3b82f6",
  balance: "#6366f1",
  debt: "#f97316",
  clear: "#22c55e",
  plan: "#94a3b8",
};

/** Ulush diagrammalari uchun (yo'nalish, kategoriya, hisob). */
export const PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#a3a3a3",
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

/** Diagramma o'qlarining umumiy uslubi. */
export const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
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

/**
 * Backend qiymatini turiga qarab matnga o'giradi.
 *
 * Uch tur bor va ularni aralashtirib bo'lmaydi: pul ("1 404 000 000 so'm"),
 * foiz ("25%") va sanoq ("118 ta"). Server har qatorda `unit` yuboradi,
 * shuning uchun komponentlar o'zicha taxmin qilmaydi.
 */
export const formatByUnit = (value, unit, { fallback = "—" } = {}) => {
  if (value == null || value === "") return fallback;
  if (unit === "percent") return `${Number(value)}%`;
  if (unit === "count") return `${Number(value)} ta`;
  return formatMoney(value, { fallback });
};

/**
 * O'zgarish belgisi va rangi.
 *
 * `inverse` — o'sishi YOMON ko'rsatkichlar uchun (xarajat, qarz): ularda
 * yashil va qizil o'rin almashadi. Aks holda "xarajat +12%" yashil bo'lib,
 * yaxshi yangilikdek ko'rinardi.
 */
export const trendTone = (change, { inverse = false } = {}) => {
  const value = Number(change ?? 0);
  if (!Number.isFinite(value) || value === 0) {
    return { direction: "flat", className: "text-gray-400", sign: "" };
  }

  const good = inverse ? value < 0 : value > 0;
  return {
    direction: value > 0 ? "up" : "down",
    className: good ? "text-green-600" : "text-red-600",
    sign: value > 0 ? "+" : "",
  };
};

/** O'zgarish matni: foiz yoki punkt (marginning o'zgarishi punktda). */
export const formatChange = (change, changeUnit = "percent") => {
  if (change == null) return null;
  const value = Number(change);
  const sign = value > 0 ? "+" : "";
  return changeUnit === "point" ? `${sign}${value} p.p.` : `${sign}${value}%`;
};

/**
 * Reja bajarilishining "sog'lomligi".
 * Chegara biznes qarori: 95% dan yuqorisi yaxshi, 80% dan pasti xavotirli.
 */
export const planTone = (rate, { inverse = false } = {}) => {
  if (rate == null) return "text-gray-400";
  const value = Number(rate);

  // Xarajatda REJADAN OSHMASLIK yaxshi, tushumda esa aksincha
  const healthy = inverse ? value <= 100 : value >= 95;
  const warning = inverse ? value <= 110 : value >= 80;

  if (healthy) return "text-green-600";
  if (warning) return "text-amber-600";
  return "text-red-600";
};

/**
 * Bajarilish chizig'ining rangi.
 *
 * ⚠️ Sinf nomlari TO'LIQ yoziladi (`planTone` natijasini `replace()` bilan
 * o'zgartirib emas): Tailwind sinflarni manba matnidan skanerlaydi va
 * yig'ilgan nom bilan hosil qilingan sinf CSS'ga umuman tushmaydi.
 */
export const planBarTone = (rate, { inverse = false } = {}) => {
  const tone = planTone(rate, { inverse });
  if (tone === "text-green-600") return "bg-green-600";
  if (tone === "text-amber-600") return "bg-amber-600";
  if (tone === "text-red-600") return "bg-red-600";
  return "bg-gray-300";
};

/** KPI kartalarining rangli fon urg'usi — tartib dizayndagi bilan bir xil. */
export const KPI_CARDS = [
  { key: "income", label: "Jami tushum", accent: "bg-blue-500", tone: "text-gray-900" },
  { key: "expense", label: "Jami xarajat", accent: "bg-rose-500", tone: "text-gray-900", inverse: true },
  { key: "profit", label: "Sof foyda", accent: "bg-green-500", tone: "text-green-700" },
  { key: "margin", label: "Rentabellik", accent: "bg-violet-500", tone: "text-violet-700" },
  { key: "cashBalance", label: "Pul qoldig'i", accent: "bg-amber-500", tone: "text-gray-900" },
];
