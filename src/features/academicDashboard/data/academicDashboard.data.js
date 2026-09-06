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
 * Baholar taqsimoti rangi — 5 dan 1 gacha.
 *
 * ⚠️ Kalitlar server qaytaradigan `grade` raqami bilan bir xil.
 *
 * ⚠️ Ma'no biriktirilgan shkala: yashil doim "yaxshi natija", qizil doim
 * "past natija". Halqa diagramma AYNAN SHU xaritani o'qiydi — bir vaqtlar
 * `ChartCards.jsx` da o'z nusxasi turardi va u yerda "5" sariq, "1" esa
 * binafsha edi: bitta ekranda ikkita bir-biriga zid shkala paydo bo'lib,
 * bu yerdagi rangni to'g'rilagan odam diagrammada hech narsa
 * o'zgarmaganini ko'rardi.
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
  // ⚠️ BALL — FOIZ EMAS. O'qituvchilar KPI ustuni 0-100 oralig'idagi
  // vaznlangan ball: uni "%" bilan yozsak, yonidagi "davomat 92%" bilan
  // bir xil ma'noda o'qilib, "rejaning 87.3% i bajarilgan" degan yo'q
  // faktga aylanardi.
  if (unit === "score") return number.toFixed(1);

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
    className: good ? "text-green-700" : "text-red-600",
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
 * ⚠️ Ton ranglari 700 pog'onada (600 emas): oq fonda 10-12.5px semibold
 * matn uchun WCAG AA (≥4.5:1) — green-600 3.3:1, amber-600 3.2:1
 * o'qilmasdi; green-700 5.0:1, amber-700 5.0:1, red-600 4.8:1.
 * `dashboard.tokens.js` dagi `TONE.*.text` bilan bir pog'onada.
 */

/**
 * Reja bajarilishining "sog'lomligi".
 * Chegara moliya dashboardidagi bilan bir xil: 95% dan yuqorisi yaxshi,
 * 80% dan pasti xavotirli. Ikki ekranda ikki xil chegara bo'lsa, bir xil
 * rangdagi ikki raqam boshqa narsani anglatib qolardi.
 */
export const planTone = (planRate) => {
  if (planRate == null) return "text-gray-400";

  const value = Number(planRate);
  if (value >= 95) return "text-green-700";
  if (value >= 80) return "text-amber-700";
  return "text-red-600";
};

/**
 * Baho darajasining rangi — 4.5 dan yuqorisi yashil, 3.5 dan pasti qizil.
 * Jadvaldagi o'rtacha baho ustuni shu bilan bo'yaladi.
 */
export const gradeTone = (value) => {
  if (value == null) return "text-gray-400";

  const number = Number(value);
  if (number >= 4.5) return "text-green-700";
  if (number >= 4) return "text-blue-600";
  if (number >= 3.5) return "text-amber-700";
  return "text-red-600";
};

/** Foizli ko'rsatkich rangi (davomat, sifat, topshiriq). */
export const percentTone = (value) => {
  if (value == null) return "text-gray-400";

  const number = Number(value);
  if (number >= 90) return "text-green-700";
  if (number >= 75) return "text-amber-700";
  return "text-red-600";
};

/**
 * KPI kartalarining tartibi, rangli fon urg'usi va qiymat rangi.
 *
 * ⚠️ BU YAGONA MANBA. `KpiCards.jsx` da bir vaqtlar o'z `ACCENTS` xaritasi
 * turardi va ikkalasi allaqachon ajralib ketgan edi (olimpiada: bu yerda
 * pushti, u yerda sariq) — rangni bu fayldan to'g'rilagan odam ekranda
 * hech qanday o'zgarish ko'rmasdi. `accent` — kvadrat ikonkaning foni,
 * `tone` — katta qiymatning rangi.
 *
 * ⚠️ Sinf nomlari TO'LIQ yoziladi: Tailwind sinflarni manba matnidan
 * skanerlaydi va `bg-${x}-500` kabi yig'ilgan nom CSS'ga tushmaydi.
 *
 * ⚠️ Kalitlar server `kpi` obyektidagi kalitlar bilan bir xil.
 */
export const KPI_CARDS = [
  { key: "students", label: "Jami o'quvchilar", accent: "bg-blue-500", tone: "text-gray-900" },
  { key: "averageGrade", label: "O'rtacha baho", accent: "bg-emerald-500", tone: "text-gray-900" },
  { key: "qualityRate", label: "A'lo va yaxshi", accent: "bg-violet-500", tone: "text-violet-700" },
  { key: "attendanceRate", label: "Davomat", accent: "bg-amber-500", tone: "text-gray-900" },
  {
    key: "taskCompletion",
    label: "Topshiriq bajarish",
    accent: "bg-cyan-500",
    tone: "text-gray-900",
  },
  {
    key: "achievements",
    label: "Olimpiada / musobaqa",
    accent: "bg-rose-500",
    tone: "text-gray-900",
  },
];

/** Reja oynasidagi o'lchov birligi qo'shimchasi. */
export const UNIT_SUFFIX = {
  percent: "%",
  count: "ta",
  grade: "ball",
};

/**
 * KESILGAN RO'YXAT SONINING YAGONA YOZILISHI (`CardLink` matni uchun).
 *
 * ⚠️ Son har doim YASHIRILGANLAR soni ("yana 4 ta"), JAMI emas. Ilgari
 * jadval kartalari "yana N ta", yutuq va AI kartalari esa "(N ta)" deb
 * yozardi: bir qatorda turgan ikki havolaning qavsi bir xil ko'rinib,
 * maxraji boshqa bo'lardi — foydalanuvchi ikkalasini ham "yana shuncha
 * bor" deb o'qirdi.
 *
 * Kesilmagan holatda son YOZILMAYDI: "(0 ta)" hech qanday yangi ma'lumot
 * bermay, havolani shovqinga aylantirardi.
 *
 * ⚠️ Bu yerda (komponent faylida emas) — `CardLink.jsx` dan funksiya
 * eksport qilinsa, Fast Refresh o'sha faylni qayta yuklay olmay qoladi.
 *
 * @param {string} label - havola matni
 * @param {number} hidden - kartada KO'RINMAYOTGAN yozuvlar soni
 * @returns {string}
 */
export const linkLabel = (label, hidden) =>
  hidden > 0 ? `${label} (yana ${hidden} ta)` : label;
