/**
 * Ta'lim dashboardining statik ma'lumotlari: ranglar, yorliqlar,
 * formatlovchilar. Komponent ichida hardcode qilinmaydi.
 *
 * ⚠️ Moliya dashboardining `financeDashboard.data.js` fayli bilan BIR XIL
 * SHAKLDA tuzilgan (`formatByUnit`, `trendTone`, `planTone`, `AXIS`), lekin
 * o'z nusxasi: u yerdagi birliklar pul, bu yerdagi esa baho. Bittasini
 * ikkinchisiga import qilsak, "so'm" formatlovchisi akademik ekranga
 * sudralib kirardi.
 */

/**
 * Ma'no biriktirilgan ranglar. Bir ekranda yashil doim "yaxshi natija",
 * qizil doim "past natija" bo'lishi kerak — aks holda ko'z ularni
 * boshqa-boshqa joyda boshqacha o'qiydi.
 */
export const COLORS = {
  grade: "#3b82f6",
  previous: "#cbd5e1",
  attendance: "#22c55e",
  quality: "#8b5cf6",
  task: "#06b6d4",
  plan: "#94a3b8",
};

/** Ulush diagrammalari uchun (fan, sinf, daraja). */
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
 * Baholar taqsimoti rangi — 5 dan 1 gacha.
 * ⚠️ Kalitlar server qaytaradigan `grade` raqami bilan bir xil.
 */
export const GRADE_COLORS = {
  5: "#22c55e",
  4: "#3b82f6",
  3: "#f59e0b",
  2: "#f97316",
  1: "#ef4444",
};

/** Olimpiada darajalari rangi — bosqich qanchalik baland, shunchalik to'q. */
export const LEVEL_COLORS = {
  school: "#94a3b8",
  district: "#06b6d4",
  city: "#3b82f6",
  region: "#8b5cf6",
  republic: "#f59e0b",
  international: "#ef4444",
};

/** Diagramma o'qlarining umumiy uslubi — moliya dashboardi bilan bir xil. */
export const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
};

/**
 * Backend qiymatini turiga qarab matnga o'giradi.
 *
 * Uch tur bor va ularni aralashtirib bo'lmaydi: sanoq ("1 255"), foiz
 * ("93.7%") va baho ("4.32"). Server har qatorda `unit` yuboradi, shuning
 * uchun komponentlar o'zicha taxmin qilmaydi.
 */
export const formatByUnit = (value, unit, { fallback = "—" } = {}) => {
  if (value == null || value === "") return fallback;

  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;

  if (unit === "percent") return `${number}%`;
  if (unit === "grade") return number.toFixed(2);

  // Sanoq — mingliklar ajratilgan holda ("1 255"). ⚠️ `toLocaleString`
  // ISHLATILMAYDI: natija muhit locale'iga bog'liq bo'lib qolardi
  // (`.claude/rules/dates.md` dagi bilan bir xil sabab).
  return String(Math.round(number)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * O'zgarish belgisi va rangi.
 *
 * `inverse` — o'sishi YOMON ko'rsatkichlar uchun. Akademik tomonda
 * hozircha bunday ko'rsatkich yo'q, lekin parametr saqlanadi: "chetlatilgan
 * o'quvchilar" kabi qator qo'shilganda rang mantig'i shu yerda hal qilinishi
 * kerak, komponent ichida emas.
 */
export const trendTone = (change, { inverse = false } = {}) => {
  const value = Number(change ?? 0);
  if (!Number.isFinite(value) || value === 0) {
    return { direction: "flat", className: "text-gray-400" };
  }

  const good = inverse ? value < 0 : value > 0;
  return {
    direction: value > 0 ? "up" : "down",
    className: good ? "text-green-600" : "text-red-600",
  };
};

/**
 * O'zgarish matni.
 *
 * ⚠️ Foizli va ballik ko'rsatkichda o'zgarish PUNKTDA o'lchanadi
 * ("+1.6 p.p."), sanoqda esa foizda ("+27.8%"). Server `changeUnit`
 * yuboradi — bu farq raqamning ma'nosini butunlay o'zgartiradi.
 */
export const formatChange = (change, changeUnit = "percent") => {
  if (change == null) return null;

  const value = Number(change);
  const sign = value > 0 ? "+" : "";
  return changeUnit === "point" ? `${sign}${value} p.p.` : `${sign}${value}%`;
};

/**
 * Reja bajarilishining "sog'lomligi".
 * Chegara moliya dashboardidagi bilan bir xil: 95% dan yuqorisi yaxshi,
 * 80% dan pasti xavotirli. Ikki ekranda ikki xil chegara bo'lsa, bir xil
 * rangdagi ikki raqam boshqa narsani anglatib qolardi.
 */
export const planTone = (planRate) => {
  if (planRate == null) return "text-gray-400";

  const value = Number(planRate);
  if (value >= 95) return "text-green-600";
  if (value >= 80) return "text-amber-600";
  return "text-red-600";
};

/**
 * Bajarilish chizig'ining rangi.
 *
 * ⚠️ Sinf nomlari TO'LIQ yoziladi (`planTone` natijasini `replace()` bilan
 * o'zgartirib emas): Tailwind sinflarni manba matnidan skanerlaydi va
 * yig'ilgan nom bilan hosil qilingan sinf CSS'ga umuman tushmaydi.
 */
export const planBarTone = (planRate) => {
  const tone = planTone(planRate);
  if (tone === "text-green-600") return "bg-green-600";
  if (tone === "text-amber-600") return "bg-amber-600";
  if (tone === "text-red-600") return "bg-red-600";
  return "bg-gray-300";
};

/**
 * Baho darajasining rangi — 4.5 dan yuqorisi yashil, 3.5 dan pasti qizil.
 * Jadvaldagi o'rtacha baho ustuni shu bilan bo'yaladi.
 */
export const gradeTone = (value) => {
  if (value == null) return "text-gray-400";

  const number = Number(value);
  if (number >= 4.5) return "text-green-600";
  if (number >= 4) return "text-blue-600";
  if (number >= 3.5) return "text-amber-600";
  return "text-red-600";
};

/** Foizli ko'rsatkich rangi (davomat, sifat, topshiriq). */
export const percentTone = (value) => {
  if (value == null) return "text-gray-400";

  const number = Number(value);
  if (number >= 90) return "text-green-600";
  if (number >= 75) return "text-amber-600";
  return "text-red-600";
};

/**
 * KPI kartalarining tartibi va rangli fon urg'usi.
 * ⚠️ Kalitlar server `kpi` obyektidagi kalitlar bilan bir xil.
 */
export const KPI_CARDS = [
  { key: "students", label: "Jami o'quvchilar", accent: "bg-blue-500", tone: "text-gray-900" },
  { key: "averageGrade", label: "O'rtacha baho", accent: "bg-emerald-500", tone: "text-gray-900" },
  { key: "qualityRate", label: "A'lo va yaxshi", accent: "bg-violet-500", tone: "text-violet-700" },
  { key: "attendanceRate", label: "Davomat", accent: "bg-amber-500", tone: "text-gray-900" },
  { key: "taskCompletion", label: "Topshiriq bajarish", accent: "bg-cyan-500", tone: "text-gray-900" },
  { key: "achievements", label: "Olimpiada / musobaqa", accent: "bg-rose-500", tone: "text-gray-900" },
];

/** Reja oynasidagi o'lchov birligi qo'shimchasi. */
export const UNIT_SUFFIX = {
  percent: "%",
  count: "ta",
  grade: "ball",
};
