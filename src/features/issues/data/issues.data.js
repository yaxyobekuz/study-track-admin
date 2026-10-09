// Muammolar bo'limining statik ma'lumotlari: tablar, holatlar, ranglar,
// filtr variantlari va hisobot davri presetlari.
//
// Komponentlar RAQAM O'YLAB TOPMAYDI — sanoqlar va foizlar serverdan
// (`issueReport.service.js`), bu yerda faqat ko'rinish va sodda matn.
//
// ⚠️ `null` va `0` bir xil emas: `null` — "o'lchanmagan" ("—"), `0` —
// "o'lchandi, natija nol".

// Icons
import {
  Inbox,
  Eye,
  Timer,
  CircleSlash,
  CircleCheckBig,
  MessageSquareWarning,
} from "lucide-react";

// ─────────────────────────────────────────────
// TABLAR
// ─────────────────────────────────────────────

/**
 * Bo'lim tablari. `permission` — tab ko'rinishi uchun kalit (berilmasa
 * `issues.view` yetarli). Route prefikslari `permissions.data.js` da.
 */
export const ISSUE_TABS = [
  {
    to: "/issues",
    label: "Muammolar",
    title: "Muammolar",
    description: "Botdan kelgan murojaatlar — kim nimadan shikoyat qilyapti",
    exact: true,
  },
  {
    to: "/issues/reports",
    label: "Hisobotlar",
    title: "Muammolar hisoboti",
    description: "Qaysi yo'nalishda ko'p, qanchasi javobsiz, qancha vaqtda yopilyapti",
    permission: "issues.reports",
    exact: false,
  },
  {
    to: "/issues/categories",
    label: "Kategoriyalar",
    title: "Muammo kategoriyalari",
    description: "Botdagi tugmalar aynan shu ro'yxatdan chiziladi",
    permission: "issues.categories",
    exact: false,
  },
];

// ─────────────────────────────────────────────
// HOLATLAR
// ─────────────────────────────────────────────

/**
 * Holat kalitlari — serverdagi `IssueStatus` enum bilan AYNI ro'yxat
 * (`server/src/services/issue.service.js#ISSUE_STATUSES`).
 */
export const ISSUE_STATUSES = ["new", "in_review", "resolved", "rejected"];

/**
 * YAKUNIY HOLATLAR — javob botga shu ikkisida ketadi, shuning uchun
 * server javob matnini MAJBURIY qiladi. Forma ham shu ro'yxatga qarab
 * javob maydonini talab qiladi: ikkisi birga o'zgaradi.
 */
export const ISSUE_FINAL_STATUSES = ["resolved", "rejected"];

export const issueStatusLabels = {
  new: "Yangi",
  in_review: "Ko'rilmoqda",
  resolved: "Hal qilindi",
  rejected: "Rad etildi",
};

export const issueStatusColors = {
  new: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-600",
};

export const issueStatusIcons = {
  new: Inbox,
  in_review: Eye,
  resolved: CircleCheckBig,
  rejected: CircleSlash,
};

/** Holat filtri — "Barchasi" birinchi. */
export const issueStatusOptions = [
  { label: "Barcha holatlar", value: "all" },
  ...ISSUE_STATUSES.map((value) => ({
    value,
    label: issueStatusLabels[value],
  })),
];

/** Ro'yxat ustidagi holat tablari (sanoq bilan). */
export const ISSUE_STATUS_TABS = [
  { value: "all", label: "Barchasi", countKey: "total" },
  ...ISSUE_STATUSES.map((value) => ({
    value,
    label: issueStatusLabels[value],
    countKey: value,
  })),
];

// ─────────────────────────────────────────────
// MUALLIF TURI
// ─────────────────────────────────────────────

/**
 * ⚠️ "O'quvchi (ota-ona)" — ATAYLAB SHUNDAY YOZILGAN. Muammo o'quvchining
 * hisobi orqali keladi (`authorKind = "student"`), lekin botdan
 * foydalanadigan odam uning OTA-ONASI: tizimda ota-ona foydalanuvchi emas.
 * Faqat "O'quvchi" deb yozilsa ma'muriyat bolaga javob yozib qo'yardi.
 */
export const issueAuthorKindLabels = {
  student: "O'quvchi (ota-ona)",
  staff: "Xodim",
};

export const issueAuthorKindColors = {
  student: "bg-violet-100 text-violet-700",
  staff: "bg-sky-100 text-sky-700",
};

export const issueAuthorKindOptions = [
  { label: "Barchasi", value: "all" },
  { label: issueAuthorKindLabels.student, value: "student" },
  { label: issueAuthorKindLabels.staff, value: "staff" },
];

// ─────────────────────────────────────────────
// HISOBOT
// ─────────────────────────────────────────────

/**
 * DIAGRAMMA RANGLARI — holat nishonlari (`issueStatusColors`) bilan
 * BIR XIL ohangda. Tanlanganlari panelning boshqa hisobotlaridagi
 * ranglar (`tasks.data.js#CHART_COLORS`): bitta tizim ikki bo'limda
 * boshqa-boshqa yashil ishlatmasligi kerak.
 */
export const ISSUE_CHART_COLORS = {
  new: "#2563eb",
  in_review: "#d97706",
  resolved: "#059669",
  rejected: "#94a3b8",
  total: "#2563eb",
  closed: "#059669",
  grid: "#f1f5f9",
  axis: "#94a3b8",
};

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: ISSUE_CHART_COLORS.axis },
};

/**
 * Holat bo'linishi — ustun va afsona. `hint` — bir qarashda tushunarli izoh.
 */
export const ISSUE_BREAKDOWN_META = {
  new: {
    label: "Yangi",
    hint: "Hali hech kim ko'rmagan",
    color: ISSUE_CHART_COLORS.new,
  },
  in_review: {
    label: "Ko'rilmoqda",
    hint: "Mas'ul oldi, javob kutyapti",
    color: ISSUE_CHART_COLORS.in_review,
  },
  resolved: {
    label: "Hal qilindi",
    hint: "Yopildi, javob yuborildi",
    color: ISSUE_CHART_COLORS.resolved,
  },
  rejected: {
    label: "Rad etildi",
    hint: "Yopildi, sabab aytildi",
    color: ISSUE_CHART_COLORS.rejected,
  },
};

/**
 * KPI kartalarining ohangi — panelning boshqa hisobotlaridagi tokenlar
 * bilan AYNI (`tasks.data.js#TONES`): bitta tizim ikki bo'limda boshqa-boshqa
 * yashil ishlatmasligi kerak.
 */
export const TONES = {
  blue: {
    card: "from-blue-50 ring-blue-100",
    chip: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
  },
  green: {
    card: "from-emerald-50 ring-emerald-100",
    chip: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-600",
  },
  amber: {
    card: "from-amber-50 ring-amber-100",
    chip: "bg-amber-100 text-amber-600",
    text: "text-amber-600",
  },
  violet: {
    card: "from-violet-50 ring-violet-100",
    chip: "bg-violet-100 text-violet-600",
    text: "text-violet-600",
  },
};

/**
 * Soat → o'qiladigan matn ("4 soat", "1 kun 3 soat").
 *
 * ⚠️ `null` — "o'lchanmagan" va "—" bo'lib qoladi: yakunlangan muammo
 * bo'lmasa o'rtacha vaqt YO'Q, nol emas.
 *
 * @param {number|null} hours
 * @returns {string}
 */
export const formatReplyHours = (hours) => {
  if (hours == null) return "—";
  if (hours < 1) return "1 soatdan kam";
  if (hours < 24) return `${Math.round(hours)} soat`;

  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);
  return rest ? `${days} kun ${rest} soat` : `${days} kun`;
};

/**
 * Foiz → matn. `null` → "—" (yuqoridagi bilan ayni qoida).
 * @param {number|null} rate
 * @returns {string}
 */
export const formatRate = (rate) => (rate == null ? "—" : `${rate}%`);

/**
 * KPI KARTALARI — hisobot sahifasining birinchi qatori.
 *
 * ⚠️ HECH BIR RAQAM BU YERDA HISOBLANMAYDI: hammasi `summary` dan keladi
 * (`issueReport.service.js`). Bu funksiya faqat "qaysi raqam qaysi kartada
 * va qanday nomlanadi" degan savolga javob beradi.
 *
 * ⚠️ Tayyor MATN qaytarilishi mumkin ("—", "4 soat"): `null` — "o'lchanmagan"
 * va uni nol deb ko'rsatish yolg'on bo'lardi.
 *
 * @param {object} report - `issuesQueries.report` payload'i
 */
export const buildIssueKpis = (report) => {
  const s = report?.summary || {};

  return [
    {
      key: "total",
      label: "Kelgan murojaat",
      value: s.total ?? 0,
      icon: MessageSquareWarning,
      tone: "blue",
      hint: "Davr ichida botdan yuborilgan",
    },
    {
      key: "pending",
      label: "Javobsiz turgan",
      value: s.pending ?? 0,
      icon: Inbox,
      tone: "amber",
      hint: "Shu davrdan hali yopilmaganlari",
    },
    {
      key: "closeRate",
      label: "Yopilgan ulushi",
      value: formatRate(s.closeRate),
      icon: CircleCheckBig,
      tone: "green",
      hint: `${s.closed ?? 0} ta murojaat yakunlangan`,
    },
    {
      key: "avgReply",
      label: "O'rtacha javob vaqti",
      value: formatReplyHours(s.avgReplyHours),
      icon: Timer,
      tone: "violet",
      hint: "Kelganidan yakunlangunicha",
    },
  ];
};

export const REPORT_PERIODS = [
  { value: "7d", label: "7 kun" },
  { value: "30d", label: "30 kun" },
  { value: "90d", label: "3 oy" },
  { value: "month", label: "Shu oy" },
  { value: "prev_month", label: "O'tgan oy" },
];

// "YYYY-MM-DD" — API parametri (format emas, ekranga chiqmaydi)
const toKey = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * Davr kaliti → `{ from, to }`. Har renderda hisoblanadi: modul darajasida
 * hisoblansa, ochiq qolgan tab kun chegarasidan o'tganda "bugun" eskirardi.
 *
 * @param {string} value
 * @returns {{from: string, to: string}}
 */
export const resolveReportPeriod = (value) => {
  const today = new Date();
  const daysBack = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1));
    return d;
  };

  switch (value) {
    case "7d":
      return { from: toKey(daysBack(7)), to: toKey(today) };
    case "90d":
      return { from: toKey(daysBack(90)), to: toKey(today) };
    case "month": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toKey(first), to: toKey(today) };
    }
    case "prev_month": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toKey(first), to: toKey(last) };
    }
    case "30d":
    default:
      return { from: toKey(daysBack(30)), to: toKey(today) };
  }
};

