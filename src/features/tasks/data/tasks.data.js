// Topshiriqlar bo'limining statik ma'lumotlari: tablar, holatlar, filtrlar,
// hisobot kartalari, ranglar va payload'ni ko'rsatishga tayyorlaydigan
// yig'gichlar.
//
// Komponentlar RAQAM O'YLAB TOPMAYDI — foizlar va sanoqlar serverdan
// (`taskReport.service.js`), bu yerda faqat ko'rinish va sodda matn.
//
// ⚠️ `null` va `0` bir xil emas: `null` — "o'lchanmagan" ("—"), `0` —
// "o'lchandi, natija nol".

// Icons
import {
  Ban,
  Eye,
  Flame,
  Timer,
  Hourglass,
  PencilLine,
  RotateCcw,
  ListChecks,
  CalendarClock,
  ClipboardList,
  TriangleAlert,
  CircleCheckBig,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Trophy,
  Clock,
  Plus,
} from "lucide-react";

// Utils
import { formatDurationUz } from "@/shared/utils/date.utils";

// ─────────────────────────────────────────────
// TABLAR
// ─────────────────────────────────────────────

/**
 * Bo'lim tablari. `permission` — tab ko'rinishi uchun kalit (berilmasa
 * `tasks.view` yetarli). Route prefikslari `permissions.data.js` da.
 */
export const TASK_TABS = [
  {
    to: "/tasks",
    label: "Asosiy",
    title: "Topshiriqlar",
    description: "Kimga qanday ish berilgan va u qay holatda",
    exact: true,
  },
  {
    to: "/tasks/reports",
    label: "Hisobotlar",
    title: "Topshiriqlar hisoboti",
    description: "Ishlar qanchalik tez va o'z vaqtida bajarilyapti — oddiy tilda",
    permission: "tasks.reports",
    exact: false,
  },
  {
    to: "/tasks/settings",
    label: "Sozlamalar",
    title: "Topshiriq sozlamalari",
    description: "Topshiriq yaratish va yakunlash qoidalari",
    permission: "tasks.settings",
    exact: false,
  },
];

// ─────────────────────────────────────────────
// HOLATLAR
// ─────────────────────────────────────────────

export const taskStatusLabels = {
  pending: "Bajarilmoqda",
  extended: "Muddati uzaytirilgan",
  pending_rejected: "Qayta ishlashga qaytarilgan",
  stopped: "To'xtatilgan",
  completed: "Yakunlangan",
  pending_review: "Tekshiruvda",
};

export const taskStatusColors = {
  pending: "bg-blue-50 text-blue-700 ring-blue-100",
  extended: "bg-sky-50 text-sky-700 ring-sky-100",
  pending_rejected: "bg-orange-50 text-orange-700 ring-orange-100",
  stopped: "bg-gray-100 text-gray-600 ring-gray-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  pending_review: "bg-amber-50 text-amber-700 ring-amber-100",
};

export const taskStatusIcons = {
  pending: Hourglass,
  extended: CalendarClock,
  pending_rejected: RotateCcw,
  stopped: Ban,
  completed: CircleCheckBig,
  pending_review: Eye,
};

export const taskStatusOptions = [
  { value: "all", label: "Barcha holatlar" },
  { value: "pending", label: "Bajarilmoqda" },
  { value: "extended", label: "Muddati uzaytirilgan" },
  { value: "pending_rejected", label: "Qayta ishlashga qaytarilgan" },
  { value: "pending_review", label: "Tekshiruvda" },
  { value: "completed", label: "Yakunlangan" },
  { value: "stopped", label: "To'xtatilgan" },
];

export const ACTIVE_TASK_STATUSES = [
  "pending",
  "extended",
  "pending_rejected",
  "pending_review",
];

// Ijrochi hali ishlayotgan holatlar (tekshiruvdagi ish bunga kirmaydi)
export const WORKING_TASK_STATUSES = ["pending", "extended", "pending_rejected"];

/**
 * Topshiriq hayot yo'li — detal sahifadagi qadamlar chizig'i.
 * `pending_rejected` va `extended` alohida qadam emas: ular "Bajarilmoqda"
 * ning ko'rinishlari.
 */
export const TASK_STEPS = [
  { key: "created", label: "Berildi" },
  { key: "working", label: "Bajarilmoqda" },
  { key: "review", label: "Tekshiruvda" },
  { key: "completed", label: "Yakunlandi" },
];

export const getStepIndex = (status) => {
  if (status === "completed") return 3;
  if (status === "pending_review") return 2;
  return 1;
};

// ─────────────────────────────────────────────
// RO'YXAT FILTRLARI
// ─────────────────────────────────────────────

export const DUE_FILTER_OPTIONS = [
  { value: "all", label: "Har qanday muddat" },
  { value: "overdue", label: "Muddati o'tgan" },
  { value: "due_soon", label: "Muddati yaqin" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Avval yangilari" },
  { value: "oldest", label: "Avval eskilari" },
  { value: "due_asc", label: "Muddati yaqinroq" },
  { value: "due_desc", label: "Muddati uzoqroq" },
];

export const TASKS_PAGE_LIMIT = 20;

/**
 * "Asosiy" tab tepasidagi tezkor kartalar. Bosilganda ro'yxat shu kesimga
 * filtrlanadi (`filter` — URL parametrlari).
 */
export const STAT_CARDS = [
  {
    key: "inProgress",
    label: "Bajarilmoqda",
    icon: Hourglass,
    tone: "blue",
    filter: { status: "pending" },
  },
  {
    key: "review",
    label: "Tekshiruvni kutyapti",
    icon: Eye,
    tone: "amber",
    filter: { status: "pending_review" },
  },
  {
    key: "overdue",
    label: "Muddati o'tgan",
    icon: Flame,
    tone: "rose",
    filter: { due: "overdue" },
  },
  {
    key: "dueSoon",
    label: "Muddati yaqin",
    icon: Timer,
    tone: "violet",
    filter: { due: "due_soon" },
  },
  {
    key: "completed",
    label: "Yakunlangan",
    icon: CircleCheckBig,
    tone: "green",
    filter: { status: "completed" },
  },
];

// ─────────────────────────────────────────────
// RANG TIZIMI
// ─────────────────────────────────────────────
//
// Tailwind sinflari TO'LIQ yoziladi — yig'ilgan satrni build topa olmaydi.

export const TONES = {
  blue: {
    card: "from-blue-50 ring-blue-100",
    chip: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
    soft: "bg-blue-50 text-blue-700",
  },
  green: {
    card: "from-emerald-50 ring-emerald-100",
    chip: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-600",
    soft: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    card: "from-amber-50 ring-amber-100",
    chip: "bg-amber-100 text-amber-600",
    text: "text-amber-600",
    soft: "bg-amber-50 text-amber-800",
  },
  rose: {
    card: "from-rose-50 ring-rose-100",
    chip: "bg-rose-100 text-rose-600",
    text: "text-rose-600",
    soft: "bg-rose-50 text-rose-700",
  },
  violet: {
    card: "from-violet-50 ring-violet-100",
    chip: "bg-violet-100 text-violet-600",
    text: "text-violet-600",
    soft: "bg-violet-50 text-violet-700",
  },
  slate: {
    card: "from-slate-50 ring-slate-200",
    chip: "bg-slate-100 text-slate-500",
    text: "text-slate-500",
    soft: "bg-slate-100 text-slate-600",
  },
};

/**
 * Diagramma ranglari — MA'NO biriktirilgan: yashil DOIM "bajarildi",
 * qizil DOIM "muddati o'tdi", kulrang DOIM "to'xtatildi". Palitra rang
 * ko'rligi tekshiruvidan o'tkazilgan (ko'k-binafsha juftligi ajralmas edi,
 * shuning uchun "tekshiruvda" — sariq).
 */
export const CHART_COLORS = {
  completed: "#059669",
  review: "#d97706",
  inProgress: "#2563eb",
  overdue: "#e11d48",
  stopped: "#94a3b8",
  created: "#2563eb",
  grid: "#f1f5f9",
  axis: "#94a3b8",
};

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: CHART_COLORS.axis },
};

/** Holat bo'linishi — donut va afsona. `hint` — bola ham tushunadigan izoh. */
export const BREAKDOWN_META = {
  completed: {
    label: "Bajarildi",
    hint: "Ish qabul qilindi",
    color: CHART_COLORS.completed,
  },
  review: {
    label: "Tekshiruvda",
    hint: "Ish topshirilgan, javob kutyapti",
    color: CHART_COLORS.review,
  },
  inProgress: {
    label: "Bajarilmoqda",
    hint: "Hali vaqt bor",
    color: CHART_COLORS.inProgress,
  },
  overdue: {
    label: "Kechikyapti",
    hint: "Muddati o'tib ketdi",
    color: CHART_COLORS.overdue,
  },
  stopped: {
    label: "To'xtatildi",
    hint: "Kerak bo'lmay qoldi",
    color: CHART_COLORS.stopped,
  },
};

export const TIMING_META = [
  {
    key: "early",
    label: "Erta topshirildi",
    hint: "Muddatdan 1 kundan ham oldin",
    emoji: "🚀",
    bar: "bg-emerald-500",
  },
  {
    key: "lastDay",
    label: "Oxirgi kunda",
    hint: "Muddatga 24 soat qolganda",
    emoji: "⏰",
    bar: "bg-amber-500",
  },
  {
    key: "late",
    label: "Kechikib",
    hint: "Muddat o'tgandan keyin",
    emoji: "🐢",
    bar: "bg-rose-500",
  },
];

/** Hafta kunlari — server `index` i: 0 = dushanba. */
export const WEEKDAY_SHORT = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
export const WEEKDAY_FULL = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

// ─────────────────────────────────────────────
// HISOBOT DAVRI
// ─────────────────────────────────────────────

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
 * @param {string} value
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
    case "month":
      return {
        from: toKey(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toKey(today),
      };
    case "prev_month":
      return {
        from: toKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: toKey(new Date(today.getFullYear(), today.getMonth(), 0)),
      };
    case "30d":
    default:
      return { from: toKey(daysBack(30)), to: toKey(today) };
  }
};

// ─────────────────────────────────────────────
// MATN YORDAMCHILARI
// ─────────────────────────────────────────────

export const percentText = (value) =>
  value == null ? "—" : `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

/** Bajarilish foizi chizig'ining rangi: ≥80 yashil, ≥50 sariq, aks holda qizil. */
export const getRateBarClass = (rate) => {
  if (rate == null) return "bg-gray-300";
  if (rate >= 80) return "bg-emerald-500";
  if (rate >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

export const fullName = (user) =>
  user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "—";

export const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

/**
 * Davomiylik — kun/soat. `formatDurationUz` soatdan kattasini bilmaydi,
 * topshiriqlar esa ko'pincha bir necha kun yashaydi.
 * @param {number|null} minutes
 */
export const durationText = (minutes) => {
  if (minutes == null) return "—";
  const days = Math.floor(minutes / 1440);
  if (days >= 1) {
    const hours = Math.round((minutes - days * 1440) / 60);
    return hours ? `${days} kun ${hours} soat` : `${days} kun`;
  }
  return formatDurationUz(minutes);
};

/**
 * Muddatga nisbatan jonli yorliq: "2 kun qoldi" / "3 soat kechikdi".
 * Yakunlangan va to'xtatilgan topshiriqda yorliq yo'q (`null`).
 *
 * @param {string|Date} dueDate
 * @param {string} status
 * @param {number} [dueSoonHours=24]
 * @returns {{ text: string, tone: "rose"|"amber"|"slate"|"blue", overdue: boolean } | null}
 */
export const getDeadlineInfo = (dueDate, status, dueSoonHours = 24) => {
  if (!dueDate || ["completed", "stopped"].includes(status)) return null;

  const diffMin = Math.round((new Date(dueDate).getTime() - Date.now()) / 60000);
  const abs = Math.abs(diffMin);
  const amount =
    abs >= 1440
      ? `${Math.floor(abs / 1440)} kun`
      : abs >= 60
        ? `${Math.floor(abs / 60)} soat`
        : `${Math.max(1, abs)} daqiqa`;

  if (status === "pending_review") {
    return { text: "Javob kutyapti", tone: "amber", overdue: false };
  }
  if (diffMin < 0) {
    return { text: `${amount} kechikdi`, tone: "rose", overdue: true };
  }
  if (diffMin <= dueSoonHours * 60) {
    return { text: `${amount} qoldi`, tone: "amber", overdue: false };
  }
  return { text: `${amount} qoldi`, tone: "blue", overdue: false };
};

// ─────────────────────────────────────────────
// HISOBOT YIG'GICHLARI
// ─────────────────────────────────────────────

/** Oldingi davrga nisbatan o'zgarish chipi (foiz punktida). */
const buildDelta = (current, previous, { suffix = "", invert = false } = {}) => {
  if (current == null || previous == null) return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) {
    return { text: "O'tgan davr bilan bir xil", className: "text-gray-500", icon: null };
  }
  const good = invert ? diff < 0 : diff > 0;
  return {
    text: `O'tgan davrga nisbatan ${diff > 0 ? "+" : "−"}${Math.abs(diff)}${suffix}`,
    className: good ? "text-emerald-600" : "text-rose-600",
    icon: diff > 0 ? TrendingUp : TrendingDown,
  };
};

/**
 * Beshta KPI kartasi. Qiymat raqam (jonli sanaladi) yoki tayyor satr.
 * @param {object} report
 */
export const buildReportKpis = (report) => {
  const { kpis, previous } = report;

  return [
    {
      key: "total",
      label: "Berilgan topshiriqlar",
      value: kpis.total,
      icon: ClipboardList,
      tone: "blue",
      delta: buildDelta(kpis.total, previous.total),
      hint: `${kpis.assignees} kishiga`,
    },
    {
      key: "completed",
      label: "Bajarildi",
      value: kpis.completed,
      icon: CircleCheckBig,
      tone: "green",
      hint: `Har 10 tadan ${kpis.completionRate == null ? "—" : Math.round(kpis.completionRate / 10)} tasi`,
    },
    {
      key: "completionRate",
      label: "Bajarilish darajasi",
      value: percentText(kpis.completionRate),
      icon: Trophy,
      tone: "violet",
      delta: buildDelta(kpis.completionRate, previous.completionRate, { suffix: "%" }),
      hint: "To'xtatilganlar hisobga olinmaydi",
    },
    {
      key: "onTimeRate",
      label: "O'z vaqtida topshirildi",
      value: percentText(kpis.onTimeRate),
      icon: Clock,
      tone: "amber",
      hint: "Bajarilganlar ichida",
    },
    {
      key: "overdue",
      label: "Kechikyapti",
      value: kpis.overdue,
      icon: Flame,
      tone: "rose",
      hint: kpis.overdue > 0 ? "Muddati o'tgan, hali topshirilmagan" : "Kechikkan ish yo'q",
    },
  ];
};

/**
 * "Qisqacha xulosa" — raqamlarni oddiy gaplarga aylantiradi. Har bir gap
 * bitta savolga javob: yaxshimi, yomonmi, nima qilish kerak.
 * @param {object} report
 * @returns {Array<{ key: string, icon: object, tone: string, text: string }>}
 */
export const buildInsights = (report) => {
  const { kpis, previous, leaders, attention, live, weekday, timing } = report;
  const items = [];

  if (kpis.total === 0) {
    return [
      {
        key: "empty",
        icon: Sparkles,
        tone: "slate",
        text: "Bu davrda hech kimga topshiriq berilmagan.",
      },
    ];
  }

  // Umumiy baho
  const rate = kpis.completionRate;
  if (rate != null) {
    const per10 = Math.round(rate / 10);
    const mood =
      rate >= 80 ? "Zo'r natija!" : rate >= 50 ? "Yomon emas, lekin yaxshilash mumkin." : "Diqqat: ishlarning ko'pi hali bajarilmagan.";
    items.push({
      key: "rate",
      icon: rate >= 80 ? ThumbsUp : rate >= 50 ? ListChecks : ShieldAlert,
      tone: rate >= 80 ? "green" : rate >= 50 ? "amber" : "rose",
      text: `Har 10 ta topshiriqdan ${per10} tasi bajarildi. ${mood}`,
    });
  }

  // Dinamika
  if (rate != null && previous.completionRate != null) {
    const diff = Math.round((rate - previous.completionRate) * 10) / 10;
    if (Math.abs(diff) >= 1) {
      items.push({
        key: "trend",
        icon: diff > 0 ? TrendingUp : TrendingDown,
        tone: diff > 0 ? "green" : "rose",
        text:
          diff > 0
            ? `O'tgan davrga qaraganda ${Math.abs(diff)}% yaxshiroq ishlanmoqda.`
            : `O'tgan davrga qaraganda ${Math.abs(diff)}% sustroq ishlanmoqda.`,
      });
    }
  }

  // Kechikish
  if (live.counts.overdue > 0) {
    items.push({
      key: "overdue",
      icon: Flame,
      tone: "rose",
      text: `Hozir ${live.counts.overdue} ta topshiriqning muddati o'tib ketgan — ularni tezroq ko'rib chiqing.`,
    });
  }

  // Tekshiruv navbati
  if (live.counts.review > 0) {
    items.push({
      key: "review",
      icon: Eye,
      tone: "amber",
      text: `${live.counts.review} ta bajarilgan ish sizning tekshiruvingizni kutyapti.`,
    });
  }

  // O'z vaqtida
  const submitted = timing.early + timing.lastDay + timing.late;
  if (submitted > 0 && timing.late > 0) {
    items.push({
      key: "late",
      icon: Timer,
      tone: "amber",
      text: `Bajarilgan ${submitted} ta ishdan ${timing.late} tasi kechikib topshirilgan.`,
    });
  }

  // Yetakchi
  if (leaders[0]) {
    items.push({
      key: "leader",
      icon: Trophy,
      tone: "violet",
      text: `Eng yaxshi natija — ${leaders[0].name}: ${leaders[0].completed} ta ish, ${percentText(leaders[0].rate)} bajarilgan.`,
    });
  }

  // E'tibor
  if (attention[0] && attention[0].overdue > 0) {
    items.push({
      key: "attention",
      icon: TriangleAlert,
      tone: "rose",
      text: `${attention[0].name}da ${attention[0].overdue} ta kechikkan topshiriq bor — gaplashib ko'ring.`,
    });
  }

  // Eng faol kun
  const best = [...weekday].sort((a, b) => b.completed - a.completed)[0];
  if (best && best.completed > 0) {
    items.push({
      key: "weekday",
      icon: Sparkles,
      tone: "blue",
      text: `Ishlar eng ko'p ${WEEKDAY_FULL[best.index].toLowerCase()} kuni yakunlanadi.`,
    });
  }

  return items.slice(0, 6);
};

// ─────────────────────────────────────────────
// VAQT CHIZIG'I (detal sahifa)
// ─────────────────────────────────────────────

export const TIMELINE_KIND_META = {
  edit: { icon: PencilLine, tone: "violet", label: "Tahrirlandi" },
  deadline: { icon: CalendarClock, tone: "blue", label: "Muddat o'zgardi" },
  penalty: { icon: ShieldAlert, tone: "rose", label: "Jarima" },
  created: { icon: Plus, tone: "blue", label: "Yaratildi" },
};

// ─────────────────────────────────────────────
// SOZLAMALAR
// ─────────────────────────────────────────────

export const FILE_TYPE_OPTIONS = [
  { value: "image", label: "Rasm", hint: "JPG, PNG, WEBP" },
  { value: "video", label: "Video", hint: "MP4, WEBM, MOV" },
  { value: "document", label: "Hujjat", hint: "PDF, DOC, XLS, TXT" },
];

/** Fayl turlari → `<input accept>` qiymati. */
export const FILE_ACCEPT = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm,video/quicktime",
  document:
    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain",
};

export const buildAccept = (types = ["image", "video", "document"]) =>
  types.map((t) => FILE_ACCEPT[t]).filter(Boolean).join(",");

/** Sozlamalar formasining boshlang'ich qiymatlari (server default'lari bilan bir xil). */
export const DEFAULT_TASK_SETTINGS = {
  minTitleLength: 3,
  minDescriptionLength: 10,
  requireCreateAttachments: false,
  minLeadHours: 1,
  defaultPenaltyPoints: 1,
  maxPenaltyPoints: 10,
  minCompletionFiles: 1,
  maxCompletionFiles: 5,
  requireCompletionNote: false,
  minCompletionNoteLength: 0,
  completionFileTypes: ["image", "video", "document"],
  allowLateSubmission: true,
  requireApproveReason: false,
  autoPenaltyEnabled: true,
  dueSoonHours: 24,
};

/**
 * Sozlamalar sahifasining bo'limlari. `type: "number"` — butun son
 * (`min`/`max` server chegarasi bilan QO'LDA sinxron, `task.service.js` →
 * `SETTINGS_INT_FIELDS`), `type: "switch"` — ha/yo'q.
 */
export const SETTINGS_SECTIONS = [
  {
    key: "create",
    title: "Topshiriq yaratish",
    description: "Admin yangi topshiriq berayotganda nimalar majburiy",
    icon: Plus,
    tone: "blue",
    fields: [
      {
        key: "minTitleLength",
        type: "number",
        min: 1,
        max: 100,
        unit: "belgi",
        label: "Sarlavha kamida",
        hint: "Juda qisqa sarlavha (\"ish\") nima qilish kerakligini tushuntirmaydi",
      },
      {
        key: "minDescriptionLength",
        type: "number",
        min: 0,
        max: 2000,
        unit: "belgi",
        label: "Tavsif kamida",
        hint: "0 — tavsif ixtiyoriy",
      },
      {
        key: "minLeadHours",
        type: "number",
        min: 0,
        max: 720,
        unit: "soat",
        label: "Bajarish uchun eng kam vaqt",
        hint: "Muddat hozirdan kamida shuncha soat keyin bo'lishi kerak",
      },
      {
        key: "requireCreateAttachments",
        type: "switch",
        label: "Topshiriqqa fayl biriktirish majburiy",
        hint: "Masalan, namuna yoki ko'rsatma fayli",
      },
    ],
  },
  {
    key: "complete",
    title: "Topshiriqni yakunlash",
    description: "Ijrochi ishni topshirayotganda nimalar talab qilinadi",
    icon: CircleCheckBig,
    tone: "green",
    fields: [
      {
        key: "minCompletionFiles",
        type: "number",
        min: 1,
        max: 10,
        unit: "ta fayl",
        label: "Kamida yuklanadigan fayllar",
        hint: "Kamida 1 ta — fayl yuklamasdan ishni topshirib bo'lmaydi",
      },
      {
        key: "maxCompletionFiles",
        type: "number",
        min: 1,
        max: 10,
        unit: "ta fayl",
        label: "Ko'pi bilan yuklanadigan fayllar",
      },
      {
        key: "completionFileTypes",
        type: "fileTypes",
        label: "Qabul qilinadigan fayl turlari",
      },
      {
        key: "requireCompletionNote",
        type: "switch",
        label: "Izoh yozish majburiy",
        hint: "Ijrochi nima qilganini qisqacha yozib beradi",
      },
      {
        key: "minCompletionNoteLength",
        type: "number",
        min: 0,
        max: 2000,
        unit: "belgi",
        label: "Izoh kamida",
        hint: "0 — cheklov yo'q",
      },
      {
        key: "allowLateSubmission",
        type: "switch",
        label: "Muddat o'tgandan keyin ham topshirish mumkin",
        hint: "O'chirilsa, kechikkan ishni topshirish uchun muddat uzaytirilishi kerak",
      },
    ],
  },
  {
    key: "review",
    title: "Tekshirish va jarima",
    description: "Ishni qabul qilish va kechikish uchun jarima qoidalari",
    icon: ShieldAlert,
    tone: "rose",
    fields: [
      {
        key: "defaultPenaltyPoints",
        type: "number",
        min: 1,
        max: 100,
        unit: "ball",
        label: "Standart jarima bali",
        hint: "Yangi topshiriq formasida oldindan qo'yiladi",
      },
      {
        key: "maxPenaltyPoints",
        type: "number",
        min: 1,
        max: 100,
        unit: "ball",
        label: "Eng katta jarima bali",
      },
      {
        key: "autoPenaltyEnabled",
        type: "switch",
        label: "Muddat o'tsa avtomatik jarima",
        hint: "Har soatda tekshiriladi. O'chirilsa, jarimani faqat admin qo'lda beradi",
      },
      {
        key: "requireApproveReason",
        type: "switch",
        label: "Tasdiqlashda izoh majburiy",
        hint: "Rad etishda izoh har doim majburiy",
      },
    ],
  },
  {
    key: "alerts",
    title: "Ogohlantirishlar",
    description: "Ro'yxat va hisobotda nima \"yaqinlashgan\" deb belgilanadi",
    icon: Timer,
    tone: "amber",
    fields: [
      {
        key: "dueSoonHours",
        type: "number",
        min: 1,
        max: 168,
        unit: "soat",
        label: "\"Muddati yaqin\" oynasi",
        hint: "Muddatga shuncha soat qolgan topshiriqlar sariq rangda ko'rinadi",
      },
    ],
  },
];

// ─────────────────────────────────────────────
// IJROCHI TANLASH
// ─────────────────────────────────────────────

// Ijrochi tanlash oynasidagi guruhlar. `value` — serverdagi `role` filtri:
// "staff" rol emas, guruh (o'quvchidan boshqa hamma).
export const assigneeGroupTabs = [
  { value: "staff", label: "Xodimlar" },
  { value: "student", label: "O'quvchilar" },
];

// Bir so'rovda yuklanadigan ijrochilar soni. O'quvchilar yuzlab — qolgani
// qidiruv orqali topiladi.
export const ASSIGNEES_PAGE_LIMIT = 50;

// Bir martada tanlanadigan ijrochilar chegarasi — server bilan QO'LDA sinxron
// (`task.service.js` → `MAX_ASSIGNEES`)
export const MAX_ASSIGNEES = 500;

// Tanlanganlar panelida birdaniga ko'rsatiladigan ismlar soni
export const SELECTED_PREVIEW_LIMIT = 12;
