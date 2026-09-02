// Xodimlar hisobotining statik ma'lumotlari: kartalar, ranglar, ikonkalar
// va serverdan kelgan payload'ni ko'rsatishga tayyorlaydigan yig'gichlar.
//
// Komponentlar RAQAM O'YLAB TOPMAYDI — hammasi shu yerdan yoki to'g'ridan
// to'g'ri payload'dan keladi. Foizlarni ham server hisoblaydi: bitta
// ko'rsatkich ikki panelda har xil maxraj bilan chiqib qolmasligi kerak.
//
// ⚠️ `null` va `0` BIR XIL EMAS: `null` — "o'lchanmagan", `0` — "o'lchandi,
// natija nol". Shu farq butun fayl bo'ylab saqlanadi (`percentText`,
// `buildRadarRows`, `getDelta`), chunki uni yo'qotish hisobotni yolg'onga
// aylantiradi — o'lchanmagan ko'rsatkich "nol natija" bo'lib ko'rinadi.

// Icons
import {
  Ban,
  Star,
  Users,
  Award,
  Clock,
  Archive,
  Activity,
  UserPlus,
  UserMinus,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  TriangleAlert,
  CircleCheckBig,
} from "lucide-react";

// ─────────────────────────────────────────────
// RANG TIZIMI
// ─────────────────────────────────────────────
//
// Tailwind sinf nomlari TO'LIQ yozilishi shart — `bg-${color}-50` kabi
// yig'ilgan satrni build vaqtida skanerlash topa olmaydi va rang yo'qoladi.

/** KPI kartaning rang varianti: fon, ikonka chipi va yorliq rangi. */
export const KPI_ACCENTS = {
  blue: {
    card: "from-blue-50 ring-blue-100",
    chip: "bg-blue-100 text-blue-600",
    label: "text-blue-600",
  },
  green: {
    card: "from-emerald-50 ring-emerald-100",
    chip: "bg-emerald-100 text-emerald-600",
    label: "text-emerald-600",
  },
  amber: {
    card: "from-amber-50 ring-amber-100",
    chip: "bg-amber-100 text-amber-600",
    label: "text-amber-600",
  },
  // Arxiv — NEYTRAL holat, muvaffaqiyatsizlik emas. Ilgari u qizil edi va
  // pastdagi doiraviy diagrammada kulrang bo'lib, bitta so'z ikki xil
  // ma'no bilan bo'yalgan ekranda turardi.
  slate: {
    card: "from-slate-50 ring-slate-200",
    chip: "bg-slate-100 text-slate-500",
    label: "text-slate-500",
  },
  violet: {
    card: "from-violet-50 ring-violet-100",
    chip: "bg-violet-100 text-violet-600",
    label: "text-violet-600",
  },
};

/**
 * Diagramma ranglari. Ma'no biriktirilgan — yashil DOIM "faol", kulrang
 * DOIM "arxivlangan". Aks holda bir sahifada bir xil rang ikki narsani
 * bildirib qolardi (`financeReports.data.js` bilan bir xil qoida).
 */
export const CHART_COLORS = {
  active: "#22c55e",
  inactive: "#f59e0b",
  archived: "#94a3b8",
  headcount: "#3b82f6",
  current: "#3b82f6",
  previous: "#c4b5fd",
  grid: "#f1f5f9",
  axis: "#94a3b8",
};

/** Ulush diagrammalari uchun (rol taqsimoti) — aylanib takrorlanadi. */
export const CHART_PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#ef4444",
];

/** Recharts o'qlarining umumiy ko'rinishi — barcha diagrammalarda bir xil. */
export const AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: CHART_COLORS.axis },
};

/** Shtat oqimi chiplari — diagramma emas, matn, shuning uchun Tailwind. */
export const FLOW_CHIPS = {
  joined: "bg-blue-50 text-blue-600",
  left: "bg-rose-50 text-rose-600",
};

// ── Nishonlar ─────────────────────────────────

/**
 * Nishonning O'LCHAMI bitta joyda: ilgari yonma-yon turgan panellarda
 * `px-2` va `px-2.5` aralashib, bir xil ma'nodagi ikki nishon har xil
 * kenglikda ko'rinardi.
 */
export const PILL =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

/** Reyting o'rinlari — YAXSHI ro'yxatlar uchun (medal mantiqi). */
export const RANK_STYLES = {
  1: "bg-amber-100 text-amber-700 ring-amber-200",
  2: "bg-slate-100 text-slate-600 ring-slate-200",
  3: "bg-orange-100 text-orange-700 ring-orange-200",
};

export const RANK_DEFAULT = "bg-gray-50 text-gray-400 ring-gray-100";

/**
 * Jarima ro'yxati uchun — MEDAL EMAS, jiddiylik shkalasi.
 *
 * Medal rangi eng ko'p jarima olgan xodimni "birinchi o'rin" qilib
 * ko'rsatardi: oltin nishon yonida qizil "15 ball" nishoni turib,
 * ikkalasi qarama-qarshi tomonga ishora qilardi.
 */
export const SEVERITY_STYLES = {
  1: "bg-rose-100 text-rose-700 ring-rose-200",
  2: "bg-rose-50 text-rose-600 ring-rose-100",
  3: "bg-orange-50 text-orange-600 ring-orange-100",
};

export const SEVERITY_DEFAULT = "bg-gray-50 text-gray-400 ring-gray-100";

/** Tezkor statistika qatorining ohangi → nishon rangi. */
export const TONE_STYLES = {
  good: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  bad: "bg-rose-100 text-rose-700",
  neutral: "bg-gray-100 text-gray-600",
};

/** Tezkor statistika kaliti → ikonka (serverdan faqat raqam va yorliq keladi). */
export const QUICK_STAT_ICONS = {
  todayAttended: CalendarCheck,
  todayLate: Clock,
  todayNotMarked: TriangleAlert,
  withTasks: ClipboardList,
  withPenalty: TriangleAlert,
  joined: UserPlus,
  left: UserMinus,
};

/** Kalit noma'lum bo'lsa (server yangi qator qo'shsa) — neytral ikonka. */
export const QUICK_STAT_FALLBACK_ICON = Activity;

// ── Yig'ma katakchalar ────────────────────────

/** Jarima va topshiriq panellaridagi rangli katakchalarning umumiy palitrasi. */
export const STAT_CELL_TONES = {
  neutral: "bg-gray-50 text-gray-700",
  good: "bg-emerald-50 text-emerald-700",
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
};

/**
 * Topshiriq katakchalari.
 *
 * ⚠️ "Muddati o'tgan" — "Jarayonda" ning ICHIDAGI qism, uning yonidagi
 * mustaqil toifa emas (server: muddati o'tgan = yakunlanmagan + muddat
 * o'tgan). Yorliq shuni aytib turadi, aks holda to'rt katak qo'shilib
 * "Berilgan" ni berishi kerakdek ko'rinardi. Haqiqiy bo'linish:
 * berilgan = bajarilgan + jarayonda + to'xtatilgan.
 */
export const TASK_STAT_CELLS = [
  { key: "assigned", label: "Berilgan", tone: "neutral" },
  { key: "completed", label: "Bajarilgan", tone: "good" },
  { key: "active", label: "Jarayonda", tone: "info" },
  { key: "overdue", label: "Shundan muddati o'tgan", tone: "bad" },
];

/** Jarima katakchalari. */
export const PENALTY_STAT_CELLS = [
  { key: "count", label: "Jarimalar", tone: "bad" },
  { key: "points", label: "Jami ball", tone: "warn" },
  { key: "reductionPoints", label: "Kamaytirilgan", tone: "good" },
];

/**
 * Fan qamrovi katakchalari.
 *
 * Qamrov faqat AMALDAGI fanlar bo'yicha o'lchanadi: o'chirilgan fan o'quv
 * rejasida yo'q, uning o'qituvchisiz turgani kamchilik emas.
 */
export const SUBJECT_STAT_CELLS = [
  { key: "totalSubjects", label: "Amaldagi fanlar", tone: "neutral" },
  { key: "coveredSubjects", label: "Qamrab olingan", tone: "good" },
  { key: "uncoveredSubjects", label: "O'qituvchisiz fan", tone: "bad" },
  { key: "teachersWithoutSubject", label: "Fansiz o'qituvchi", tone: "warn" },
];

/** Kartadagi ro'yxatlar uzunligi — uchta panel bir xil balandlikda tursin. */
export const PANEL_ROW_LIMIT = 5;

/**
 * Fanlar jadvalidagi qatorlar soni.
 *
 * `PANEL_ROW_LIMIT` dan MUSTAQIL: u uchta yonma-yon panelni bir bo'yga
 * keltirish uchun, bu esa keng jadvalning uzunligi. Ilgari bu qiymat
 * `PANEL_ROW_LIMIT * 2` edi va uchta panelni tekislash uchun 6 ga
 * o'zgartirilsa, jadval jimgina 12 qatorga cho'zilardi.
 */
export const SUBJECT_ROW_LIMIT = 10;

/**
 * Yorug' sarlavhali jadval katakchasi.
 *
 * Global CSS har qanday `thead` ni ko'k fonli, oq katta harfli qiladi
 * (`src/styles/index.css`). Sinf selektorlari element selektorlaridan
 * kuchliroq bo'lgani uchun bu qatorlar uni yengadi — lekin ular ikkita
 * jadvalda bir xil bo'lishi shart, aks holda ikki panel ikki xil
 * sarlavha bilan chiqardi.
 */
export const TABLE_HEAD_CELL =
  "whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium normal-case text-gray-500";

/** Kartada nechta rol alohida ko'rsatiladi — qolgani "Boshqalar" ga yig'iladi. */
const ROLE_SLICE_LIMIT = 5;

/** Radar shakl bo'lib o'qilishi uchun kerakli eng kam o'qlar soni. */
export const MIN_RADAR_AXES = 3;

// ─────────────────────────────────────────────
// YORDAMCHILAR
// ─────────────────────────────────────────────

/**
 * Foizga qarab rang — davomat, topshiriq va reyting uchun bitta shkala.
 * @param {number|null} percent
 */
export const getRateColor = (percent) => {
  if (percent == null) return "bg-gray-100 text-gray-500";
  if (percent >= 90) return "bg-emerald-100 text-emerald-700";
  if (percent >= 75) return "bg-amber-100 text-amber-700";
  if (percent >= 50) return "bg-orange-100 text-orange-700";
  return "bg-rose-100 text-rose-700";
};

/** Progress chizig'ining rangi — `getRateColor` bilan bir xil chegaralar. */
export const getRateBar = (percent) => {
  if (percent == null) return "bg-gray-200";
  if (percent >= 90) return "bg-emerald-500";
  if (percent >= 75) return "bg-amber-500";
  if (percent >= 50) return "bg-orange-500";
  return "bg-rose-500";
};

/**
 * O'sish/pasayish belgisi — KPI kartaning izohi.
 *
 * ⚠️ `null` va `0` ALOHIDA: server o'zgarishni faqat oldingi oy shtati NOL
 * bo'lganda `null` qiladi, ya'ni "taqqoslash uchun asos yo'q". Uni
 * "O'zgarishsiz" deb yozish hech qachon hisoblanmagan taqqoslashni
 * bo'lgandek ko'rsatardi.
 *
 * @param {number|null} change - foizdagi o'zgarish
 */
const getDelta = (change) => {
  if (change == null) {
    return {
      icon: null,
      className: "text-gray-400",
      text: "Taqqoslash uchun asos yo'q",
    };
  }
  if (change === 0) {
    return { icon: null, className: "text-gray-400", text: "O'tgan oyga teng" };
  }
  return change > 0
    ? {
        icon: ArrowUpRight,
        className: "text-emerald-600",
        text: `${change}% o'tgan oyga nisbatan`,
      }
    : {
        icon: ArrowDownRight,
        className: "text-rose-600",
        text: `${Math.abs(change)}% o'tgan oyga nisbatan`,
      };
};

/** Foiz matni — `null` bo'lsa chiziqcha (nol bilan adashtirmaslik uchun). */
export const percentText = (value, fallback = "—") =>
  value == null ? fallback : `${value}%`;

/**
 * Staj matni: 14 → "1 yil 2 oy". Bir yildan kam bo'lsa faqat oylar.
 * @param {number} months
 */
export const formatTenure = (months) => {
  if (!months) return "1 oydan kam";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} oy`;
  return rest ? `${years} yil ${rest} oy` : `${years} yil`;
};

/**
 * Ism-familiyadan bosh harflar. `users.data.js` dagi `getInitials` bilan
 * bir xil qoida, lekin hisobot qatorlarida faqat `name` bo'ladi.
 * @param {string} name
 */
export const initialsOf = (name = "") => {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

// ─────────────────────────────────────────────
// PAYLOAD → KO'RSATISHGA TAYYOR MA'LUMOT
// ─────────────────────────────────────────────

/**
 * Beshta KPI kartasi.
 *
 * Tarkib raqamlari JORIY holatga tegishli, o'zgarish esa TANLANGAN oyning
 * o'tgan oyga nisbatan farqi. O'tgan oyni ko'rayotganda bu ikkovi bir xil
 * narsa haqida gapirmaydi, shuning uchun o'zgarish faqat joriy oyda
 * chiziladi — aks holda bugungi raqam yonida tarixiy delta turardi.
 *
 * Oxirgi karta ATAYLAB moslashuvchan: davomat ruxsati bo'lsa o'rtacha
 * davomatni, bo'lmasa topshiriq bajarilishini ko'rsatadi — bo'sh karta
 * qoldirishdan ko'ra mavjud eng kuchli ko'rsatkichni chiqargani yaxshi.
 *
 * @param {object} report - serverdan kelgan payload
 */
export const buildKpiCards = (report) => {
  const { composition, previous, attendance, tasks, isCurrentMonth } = report;

  const headline = attendance
    ? {
        label: "O'rtacha davomat",
        value: percentText(attendance.percent),
        hint:
          attendance.percent == null
            ? "Bu oyda davomat belgilanmagan"
            : `O'tgan oy: ${percentText(previous.attendancePercent)}`,
      }
    : {
        label: "Topshiriq bajarilishi",
        value: percentText(tasks.completionRate),
        hint:
          tasks.completionRate == null
            ? "Bu oyda topshiriq berilmagan"
            : `O'tgan oy: ${percentText(previous.taskCompletionRate)}`,
      };

  return [
    {
      key: "total",
      label: "Jami xodimlar",
      value: composition.total,
      icon: Users,
      accent: "blue",
      ...(isCurrentMonth
        ? { delta: getDelta(previous.totalChangePercent) }
        : { hint: "Joriy holat" }),
    },
    {
      key: "active",
      label: "Faol xodimlar",
      value: composition.active,
      icon: CircleCheckBig,
      accent: "green",
      hint: `${percentText(composition.activePercent)} faollik`,
    },
    {
      key: "inactive",
      label: "Bloklangan",
      value: composition.inactive,
      icon: Ban,
      accent: "amber",
      hint: composition.inactive ? "Tizimga kira olmaydi" : "Barchasi ochiq",
    },
    {
      key: "archived",
      label: "Arxivlangan",
      value: composition.archived,
      icon: Archive,
      accent: "slate",
      hint: composition.archived ? "Ro'yxatdan yashirilgan" : "Arxiv bo'sh",
    },
    {
      key: "headline",
      label: headline.label,
      value: headline.value,
      icon: attendance ? Star : Award,
      accent: "violet",
      hint: headline.hint,
    },
  ];
};

/**
 * Doiraviy diagramma uchun xodimlar holati.
 *
 * Maxraj — ARXIV BILAN birga ("ro'yxatda nechta yozuv bor"), shuning uchun
 * ulushlar KPI kartadagi "faollik" foizidan farq qiladi va ikkalasi bir
 * ekranda turadi. Chalkashmasligi uchun foizlarni server hisoblab beradi
 * (`composition.statusShare`) va diagramma markazi "Jami" emas,
 * "Ro'yxatda" deb ataladi.
 */
export const buildStatusSlices = (composition) => [
  {
    key: "active",
    name: "Faol",
    value: composition.active,
    percent: composition.statusShare.active,
    color: CHART_COLORS.active,
  },
  {
    key: "inactive",
    name: "Bloklangan",
    value: composition.inactive,
    percent: composition.statusShare.inactive,
    color: CHART_COLORS.inactive,
  },
  {
    key: "archived",
    name: "Arxivlangan",
    value: composition.archived,
    percent: composition.statusShare.archived,
    color: CHART_COLORS.archived,
  },
];

/**
 * Rol taqsimoti diagrammasi uchun sektorlar.
 *
 * Uzun dumni "Boshqalar" ga yig'adi: 11 ta rolning har biri alohida sektor
 * bo'lsa, ularning yarmi bir pikselga aylanib, afsona o'qib bo'lmas edi.
 *
 * @param {Array} byRole
 * @param {number} [limit]
 */
export const buildRoleSlices = (byRole = [], limit = ROLE_SLICE_LIMIT) => {
  const head = byRole.slice(0, limit);
  const tail = byRole.slice(limit);

  const slices = head.map((row, index) => ({
    key: row.role,
    name: row.label,
    value: row.total,
    percent: row.percent,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  if (tail.length) {
    const value = tail.reduce((sum, row) => sum + row.total, 0);
    slices.push({
      key: "__rest",
      name: `Boshqalar (${tail.length} ta rol)`,
      value,
      // Ulush yig'indidan emas, xodimlar sonidan qayta hisoblanadi: server
      // foizlari bir kasr xonasiga yaxlitlangan va ularni qo'shish xatoni
      // to'plardi
      percent: byRole.length
        ? Math.round(
            (value / byRole.reduce((sum, r) => sum + r.total, 0)) * 1000,
          ) / 10
        : null,
      color: "#cbd5e1",
    });
  }

  return slices;
};

/**
 * Radar diagrammasi uchun qatorlar.
 *
 * ⚠️ Recharts `null` nuqtani MARKAZGA chizadi (`Radar.js`: nullish → radius 0),
 * ya'ni "o'lchanmagan" ko'rsatkich "0%" bilan piksel-bapiksel bir xil
 * ko'rinadi. Shuning uchun o'lchanmagan o'q diagrammaga umuman
 * qo'shilmaydi — u `missing` ro'yxatiga tushadi va diagramma ostida matn
 * bilan aytiladi.
 *
 * O'tgan oy chizig'i esa "hammasi bor yoki hech qaysi": bitta o'qda
 * ma'lumot yetishmasa, ko'pburchak o'sha yerda markazga tortilib, o'tgan
 * oyni bor-yo'g'idan yomon ko'rsatardi.
 *
 * @param {Array} indicators
 * @returns {{rows: Array, missing: string[], canCompare: boolean}}
 */
export const buildRadarRows = (indicators = []) => {
  const rows = [];
  const missing = [];

  for (const row of indicators) {
    if (row.current == null) {
      missing.push(row.label);
      continue;
    }
    rows.push({
      label: row.shortLabel || row.label,
      fullLabel: row.label,
      current: row.current,
      previous: row.previous,
    });
  }

  return {
    rows,
    missing,
    canCompare: rows.length > 0 && rows.every((row) => row.previous != null),
  };
};
