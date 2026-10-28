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
  CalendarRange,
  CircleX,
  Layers,
  Link2,
  Repeat,
  PlayCircle,
  Users,
  Zap,
} from "lucide-react";

// Utils
import { formatDateTimeUz, formatDurationUz } from "@/shared/utils/date.utils";

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
    label: "Dashboard",
    title: "Lavozimlar markazi",
    description: "Kunlik, haftalik, oylik va yillik natijalar — bir ekranda",
    exact: true,
  },
  {
    to: "/tasks/list",
    label: "Topshiriqlar",
    title: "Topshiriqlar",
    description: "Kimga qanday ish berilgan va u qay holatda",
    exact: false,
  },
  {
    // XODIMLAR O'ZIGA BELGILAGAN TOPSHIRIQLAR — alohida kalit
    // (`tasks.self`): topshiriq registrini ko'rish huquqi xodimlarning
    // shaxsiy rejasini ochib bermasligi kerak.
    //
    // ⚠️ DASHBOARD VA RO'YXAT BITTA SAHIFADA: kesim bosilganda ro'yxat
    // SHU YERDA filtrlanadi, chunki bu bo'limda ish taqsimlanmaydi —
    // u faqat "kim o'zini qanday rejalashtirmoqda" degan savolga javob
    // beradi va ikkinchi tab ortiqcha bo'lardi.
    to: "/tasks/self",
    label: "O'ziga belgilagan",
    title: "Xodimlar o'ziga belgilagan topshiriqlar",
    description: "Kim o'ziga qanday reja qo'ydi va qanchasini bajardi — jarimasiz oqim",
    permission: "tasks.self",
    exact: false,
  },
  {
    to: "/tasks/schedules",
    label: "Doimiy topshiriqlar",
    title: "Doimiy topshiriqlar",
    description: "Takrorlanadigan ishlar — topshiriqlar ulardan avtomatik yoziladi",
    exact: false,
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

// ─────────────────────────────────────────────
// TOPSHIRIQ TURI
// ─────────────────────────────────────────────

/**
 * `main` — ASOSIY: lavozim bo'yicha doimiy ish ("har kuni jurnalni yuritish").
 * `extra` — QO'SHIMCHA: bir martalik vazifa ("bayramga zal tayyorlash").
 *
 * Tur — KO'RSATKICH, to'siq emas: qoidalar (jarima, fayl, muddat) ikkalasida
 * ham bir xil. U rahbarga "qo'shimcha ishlar asosiy ishni bosib
 * ketmayaptimi" degan savolga javob beradi.
 */
export const TASK_KIND_META = {
  main: {
    label: "Asosiy",
    hint: "Doimiy ish — belgilangan jadval bo'yicha takrorlanadi",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    dot: "bg-indigo-500",
    color: "#4f46e5",
    icon: Repeat,
  },
  extra: {
    label: "Qo'shimcha",
    hint: "Bir martalik vazifa — aniq sanaga",
    chip: "bg-teal-50 text-teal-700 ring-teal-100",
    dot: "bg-teal-500",
    color: "#0d9488",
    icon: Zap,
  },
};

export const TASK_KIND_OPTIONS = [
  { value: "all", label: "Barcha turlar" },
  { value: "main", label: "Asosiy" },
  { value: "extra", label: "Qo'shimcha" },
];

export const kindLabel = (kind) => TASK_KIND_META[kind]?.label || TASK_KIND_META.main.label;

// Bir topshiriqqa qo'shiladigan havolalar chegarasi — server bilan QO'LDA
// sinxron (`taskWindow.helpers.js` → `LINKS_MAX`)
export const LINKS_MAX = 10;

// ─────────────────────────────────────────────
// DOIMIY (TAKRORLANUVCHI) TOPSHIRIQ
// ─────────────────────────────────────────────

/**
 * ⚠️ "ASOSIY" = DOIMIY (takrorlanadi), "QO'SHIMCHA" = BIR MARTALIK
 * (biznes qarori). Shuning uchun tur tanlovi formaning shaklini
 * o'zgartiradi: asosiyda takrorlanish qoidasi so'raladi, qo'shimchada —
 * aniq sana.
 */
export const TASK_FREQUENCIES = [
  { value: "weekly", label: "Haftalik", hint: "Haftaning tanlangan kunlari" },
  { value: "days", label: "Kun oralig'ida", hint: "Har N kunda bir" },
  { value: "months", label: "Oylik", hint: "Har N oyda, oyning tanlangan kunlari" },
];

/**
 * Hafta kunlari — `value` JS `getDay()` konvensiyasida (0 = yakshanba).
 *
 * ⚠️ `WEEKDAY_SHORT` / `WEEKDAY_FULL` BILAN CHALKASHTIRMANG: ular HISOBOT
 * indeksida (0 = dushanba, server shunday yuboradi). Ikkalasi bir faylda
 * turgani uchun tuzoq aynan shu yerda — qoida kunlari serverdagi
 * `taskSchedule.helpers.js` bilan AYNI konvensiyada bo'lishi SHART.
 */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Du", full: "Dushanba" },
  { value: 2, label: "Se", full: "Seshanba" },
  { value: 3, label: "Ch", full: "Chorshanba" },
  { value: 4, label: "Pa", full: "Payshanba" },
  { value: 5, label: "Ju", full: "Juma" },
  { value: 6, label: "Sh", full: "Shanba" },
  { value: 0, label: "Ya", full: "Yakshanba" },
];

/**
 * Yangi doimiy topshiriq formasining boshlang'ich qiymatlari.
 *
 * ⚠️ `slots` — MASSIV: bir kunda bir nechta takrorlanish bo'lishi mumkin
 * ("ertalab 09:00 va tushdan keyin 15:00"), har biri o'z topshirig'ini
 * beradi. `start` bo'sh bo'lsa oyna emas, faqat muddat.
 */
export const DEFAULT_RECURRENCE = {
  frequency: "weekly",
  weekdays: [1],
  intervalDays: 7,
  intervalMonths: 1,
  monthDays: [1],
  slots: [{ start: "", due: "18:00", offsetDays: 0 }],
  leadDays: 1,
};

// Bir kundagi vaqtlar soni — server bilan QO'LDA sinxron
// (`taskSchedule.helpers.js` → `MAX_SLOTS`)
export const MAX_SLOTS = 12;

export const EMPTY_SLOT = { start: "", due: "", offsetDays: 0 };

export const SCHEDULE_STATUS_OPTIONS = [
  { value: "all", label: "Barchasi" },
  { value: "active", label: "Faol" },
  { value: "stopped", label: "To'xtatilgan" },
];

// Server bilan QO'LDA sinxron (`taskSchedule.helpers.js`)
export const MAX_LEAD_DAYS = 30;
export const MAX_DUE_OFFSET_DAYS = 30;

/**
 * Takrorlanish qoidasining qisqa matni. Server ham AYNI matnni quradi
 * (`describeSchedule`) — bu yerdagisi faqat forma hali saqlanmaganda,
 * "nima yoziladi" ni oldindan ko'rsatish uchun.
 *
 * @param {object} rule
 * @returns {string}
 */
export const describeRecurrence = (rule) => {
  if (!rule) return "—";

  const slots = (rule.slots || []).filter((slot) => slot.due);
  const time =
    slots.length === 0
      ? "—"
      : slots
          .slice()
          .sort((a, b) => a.due.localeCompare(b.due))
          .map((slot) => (slot.start ? `${slot.start}–${slot.due}` : slot.due))
          .join(", ");

  let text;
  if (rule.frequency === "weekly") {
    const days = WEEKDAY_OPTIONS.filter((d) => (rule.weekdays || []).includes(d.value))
      .map((d) => d.full.toLowerCase())
      .join(", ");
    text = days ? `Har ${days}` : "Har hafta";
  } else if (rule.frequency === "days") {
    const step = Number(rule.intervalDays) || 1;
    text = step === 1 ? "Har kuni" : `Har ${step} kunda`;
  } else {
    const step = Number(rule.intervalMonths) || 1;
    const days = [...(rule.monthDays || [])].sort((a, b) => a - b).join(", ");
    const period = step === 1 ? "Har oy" : `Har ${step} oyda`;
    text = days ? `${period}ning ${days}-kuni` : period;
  }

  const maxOffset = slots.reduce((max, slot) => Math.max(max, Number(slot.offsetDays) || 0), 0);
  const tail = maxOffset > 0 ? ` (+${maxOffset} kun)` : "";
  return `${text} · ${time}${tail}`;
};

// ─────────────────────────────────────────────
// VAQT HOLATI (server: `taskWindow.helpers.js`)
// ─────────────────────────────────────────────
//
// ⚠️ HOLAT SAQLANMAYDI, HISOBLANADI. "Bajarilmadi" (✗) — `status` emas,
// hosila: muddat o'tdi-yu ish topshirilmadi. Shuning uchun muddat
// uzaytirilishi bilan ✗ o'z-o'zidan yo'qoladi.
//
// Serverdan har topshiriqda `timeState` keladi; bu yerda faqat ko'rinish.

export const TASK_STATE_META = {
  done: {
    label: "Bajarildi",
    short: "Bajarildi",
    icon: CircleCheckBig,
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    text: "text-emerald-600",
  },
  review: {
    label: "Tekshiruvda",
    short: "Tekshiruvda",
    icon: Eye,
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
    text: "text-amber-600",
  },
  missed: {
    label: "Bajarilmadi",
    short: "Bajarilmadi",
    icon: CircleX,
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
    text: "text-rose-600",
  },
  active: {
    label: "Hozir bajarilish vaqti",
    short: "Hozir vaqti",
    icon: PlayCircle,
    chip: "bg-rose-100 text-rose-700 ring-rose-200",
    text: "text-rose-600",
  },
  upcoming: {
    label: "Hali boshlanmagan",
    short: "Boshlanmagan",
    icon: CalendarClock,
    chip: "bg-slate-100 text-slate-600 ring-slate-200",
    text: "text-slate-500",
  },
  open: {
    label: "Bajarilmoqda",
    short: "Bajarilmoqda",
    icon: Hourglass,
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
    text: "text-blue-600",
  },
  stopped: {
    label: "To'xtatilgan",
    short: "To'xtatilgan",
    icon: Ban,
    chip: "bg-gray-100 text-gray-600 ring-gray-200",
    text: "text-gray-500",
  },
};

/**
 * Ro'yxat va dashboard filtri. `in_progress` — "jarayonda": hali muddati
 * kelmagan hamma ish (hozir vaqti kelganlar ham).
 */
export const STATE_FILTER_OPTIONS = [
  { value: "all", label: "Barcha holatlar" },
  { value: "done", label: "Bajarildi" },
  { value: "missed", label: "Bajarilmadi" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "active", label: "Hozir bajarilish vaqti" },
  { value: "review", label: "Tekshiruvda" },
  { value: "upcoming", label: "Hali boshlanmagan" },
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

/**
 * XODIM O'ZIGA BELGILAGAN ISH — UCH QADAM.
 *
 * ⚠️ "Tekshiruvda" qadami OLIB TASHLANADI, chunki bu oqimda u STRUKTURAVIY
 * yo'q: ikkinchi tomon bo'lmagani uchun xodim topshirgani darhol
 * "Yakunlangan" bo'ladi (server `submitTaskCompletion`). Qadam qoldirilsa,
 * u hech qachon yonmaydigan bosqich bo'lib turardi va foydalanuvchi
 * "nimani kutyapman" deb o'ylardi.
 */
export const SELF_TASK_STEPS = [
  { key: "created", label: "Belgilandi" },
  { key: "working", label: "Bajarilmoqda" },
  { key: "completed", label: "Yakunlandi" },
];

export const getStepIndex = (status) => {
  if (status === "completed") return 3;
  if (status === "pending_review") return 2;
  return 1;
};

/** Shaxsiy oqim uchun qadam indeksi (uch qadamli chiziq). */
export const getSelfStepIndex = (status) => (status === "completed" ? 2 : 1);

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
    key: "activeNow",
    label: "Hozir bajarilish vaqti",
    icon: PlayCircle,
    tone: "rose",
    filter: { state: "active" },
  },
  {
    key: "inProgress",
    label: "Bajarilmoqda",
    icon: Hourglass,
    tone: "blue",
    filter: { state: "in_progress" },
  },
  {
    key: "review",
    label: "Tekshiruvni kutyapti",
    icon: Eye,
    tone: "amber",
    filter: { state: "review" },
  },
  {
    key: "missed",
    label: "Bajarilmadi",
    icon: CircleX,
    tone: "rose",
    filter: { state: "missed" },
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
    label: "Bajarildi",
    icon: CircleCheckBig,
    tone: "green",
    filter: { state: "done" },
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

/**
 * DASHBOARD DAVRLARI — server presetlari (`taskReport.service.js` →
 * `_resolvePreset`).
 *
 * ⚠️ Kun chegarasi SERVERDA, Toshkent vaqti bo'yicha hisoblanadi: brauzer
 * mintaqasi boshqa bo'lsa "bugun" bir kunga siljib ketardi (`dates.md`).
 * Shuning uchun bu yerda faqat kalit va yorliq bor, sana hisoblanmaydi.
 */
/**
 * ⚠️ RO'YXAT UMUMIY (`shared/data/dashboardPeriods.data.js`): bosh
 * sahifada bu tanlagich bir nechta kartada turadi (topshiriqlar, o'quvchilar
 * davomati, o'qituvchilar davomati) va "oylik" hammasida AYNI oynani
 * bildirishi shart. Bu yerdan qayta eksport qilinadi — mavjud import'lar
 * o'zgarmasin.
 */
export { DASHBOARD_PERIODS } from "@/shared/data/dashboardPeriods.data";

export const DASHBOARD_PEOPLE_FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "completed", label: "Bajargan" },
  { value: "missed", label: "Bajarmagan" },
  { value: "inProgress", label: "Jarayonda" },
  { value: "review", label: "Tekshiruvda" },
];

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

/**
 * HUJJATDAGI FOIZ — "80,0%" (kasr VERGUL bilan, har doim bitta xona).
 *
 * ⚠️ Yuqoridagi `percentText` dan ATAYLAB farq qiladi va uning o'rniga
 * ishlatilmaydi: u BOSHQARUV EKRANLARI uchun (butun son qisqa ko'rinadi),
 * bu esa HUJJAT uchun — ekrandagi nusxa Word faylidagi raqam bilan belgima
 * belgi bir xil bo'lishi shart (`taskReportExport.service.js` dagi AYNI
 * qoida). Aks holda yuklab olingan fayl "boshqacha" bo'lib ko'rinardi.
 *
 * Qo'shni hisobotlar ham shunday (`movement.data.js`,
 * `studentSystems.data.js`).
 */
export { docPercentText } from "@/shared/data/dashboardPeriods.data";

/**
 * XODIMLAR TOPSHIRIQLARI HUJJATI — bosh sahifadagi kartadagi belgi aynan
 * shu yo'lga olib keladi (yangi tab EMAS).
 *
 * ⚠️ `/tasks/...` EMAS: `/tasks/:taskId` marshruti istalgan bo'lakni
 * topshiriq id si deb oladi va hujjat "topshiriq topilmadi" bo'lib
 * ochilardi (`routes.jsx`).
 */
export const STAFF_TASKS_REPORT_PATH = "/staff-tasks";

/**
 * HUJJATDAGI HOLAT YORLIQLARI.
 *
 * ⚠️ `BREAKDOWN_META` dan ATAYLAB farq qiladi: u boshqaruv ekranlari uchun
 * jonli tilda yozilgan ("Kechikyapti", "To'xtatildi"), hujjat esa rasmiy
 * va u Word fayli bilan SO'ZMA-SO'Z bir xil bo'lishi shart
 * (`server/src/services/taskReportExport.service.js` dagi `STATUS_LABEL`).
 * Ikki matn ajralib ketsa, yuklab olingan fayl "boshqacha" bo'lib
 * ko'rinardi.
 */
export const DOC_STATUS_LABEL = {
  completed: "Bajarildi",
  review: "Tekshiruvda",
  inProgress: "Jarayonda",
  overdue: "Muddati o'tgan",
  stopped: "To'xtatilgan",
};

/** Hujjatdagi topshirish vaqti yorliqlari (serverdagi `TIMING_LABEL`). */
export const DOC_TIMING_LABEL = {
  early: "Muddatdan oldin",
  lastDay: "Oxirgi kuni",
  late: "Kech topshirilgan",
};

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
 * VAQT ORALIG'I MATNI. Oraliq bo'lmasa — faqat muddat.
 *
 * ⚠️ Sana `formatDateTimeUz` orqali (`dates.md` §2): qo'lda yig'ilgan
 * shablon bitta jadvalda ikki xil sana formatini hosil qilardi.
 *
 * @param {{ startDate?: string|null, dueDate: string }} task
 * @returns {{ text: string, hasWindow: boolean }}
 */
export const formatTaskWindow = (task) => {
  if (!task?.dueDate) return { text: "—", hasWindow: false };
  const due = formatDateTimeUz(task.dueDate);
  if (!task.startDate) return { text: due, hasWindow: false };
  return { text: `${formatDateTimeUz(task.startDate)} — ${due}`, hasWindow: true };
};

/**
 * Oraliqning jonli holati — serverdagi `timeState` bilan AYNI qoida
 * (`taskWindow.helpers.js`). Server `timeState` ni allaqachon yuboradi;
 * bu funksiya ekran OCHIQ turganda (minutlar o'tib ketganda) uni jonli
 * ushlab turish uchun.
 *
 * ⚠️ `nowMs` — chaqiruvchining jonli hisoblagichi (`useNow`). Qolgan to'rt
 * panelda ham AYNI imzo: bu yerda uni tushirib qoldirish bitta panelda
 * holat boshqacha hisoblanishi xavfini tug'dirardi.
 *
 * @param {{ status: string, startDate?: string|null, dueDate: string, timeState?: string }} task
 * @param {number} [nowMs]
 * @returns {string} `TASK_STATE_META` kaliti
 */
export const resolveTimeState = (task, nowMs = Date.now()) => {
  if (!task) return "open";
  if (task.status === "completed") return "done";
  if (task.status === "stopped") return "stopped";
  if (task.status === "pending_review") return "review";

  if (new Date(task.dueDate).getTime() < nowMs) return "missed";
  if (!task.startDate) return "open";
  return new Date(task.startDate).getTime() > nowMs ? "upcoming" : "active";
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
 * DASHBOARD KARTALARI — "shu davrda nima bo'ldi" degan savolga olti raqam.
 *
 * ⚠️ Raqamlar SERVERDAN (`taskReport.service.js`), bu yerda hisoblanmaydi:
 * dashboard va hisobot bitta dvigateldan o'qiydi, aks holda ikki ekran
 * "bajarildi" uchun ikki xil son ko'rsatardi.
 *
 * `filter` — karta bosilganda topshiriqlar ro'yxati shu kesimga o'tadi.
 *
 * @param {object} report
 */
export const buildDashboardKpis = (report, { self = false } = {}) => {
  const { kpis } = report;

  // ⚠️ SHAXSIY OQIMDA "TEKSHIRUVDA" KARTASI YO'Q va bu bo'shliq emas,
  // STRUKTURA: shaxsiy topshiriqda tasdiqlash bosqichi umuman yo'q
  // (xodim topshirgani darhol yakunlanadi), ya'ni karta har doim 0
  // ko'rsatib turardi. O'rniga "reja qo'ygan xodimlar" — rahbar uchun
  // asosiy savol aynan shu: kim o'zini o'zi rejalashtirmoqda.
  const review = self
    ? {
        key: "assignees",
        label: "Reja qo'ygan xodimlar",
        value: kpis.assignees,
        icon: Users,
        tone: "amber",
        hint: "O'ziga ish belgilaganlar",
        filter: {},
      }
    : {
        key: "review",
        label: "Tekshiruvda",
        value: kpis.review,
        icon: Eye,
        tone: "amber",
        hint: "Ish topshirilgan, javob kutyapti",
        filter: { state: "review" },
      };

  return [
    {
      key: "total",
      label: self ? "O'ziga belgilagan ishlar" : "Berilgan topshiriqlar",
      value: kpis.total,
      icon: ClipboardList,
      tone: "blue",
      hint: self ? `${kpis.assignees} xodim` : `${kpis.assignees} xodimga`,
      filter: {},
    },
    {
      key: "completed",
      label: "Bajarildi",
      value: kpis.completed,
      icon: CircleCheckBig,
      tone: "green",
      hint: percentText(kpis.completionRate),
      filter: { state: "done" },
    },
    {
      key: "overdue",
      label: "Bajarilmadi",
      value: kpis.overdue,
      icon: CircleX,
      tone: "rose",
      hint:
        kpis.overdue > 0
          ? self
            ? "Muddat o'tdi, reja bajarilmadi"
            : "Muddat o'tdi, ish topshirilmadi"
          : "Kechikkan ish yo'q",
      filter: { state: "missed" },
    },
    {
      key: "inProgress",
      label: "Jarayonda",
      value: kpis.inProgress,
      icon: Hourglass,
      tone: "blue",
      hint: "Muddati hali bor",
      filter: { state: "in_progress" },
    },
    review,
    {
      key: "onTimeRate",
      label: "O'z vaqtida",
      value: percentText(kpis.onTimeRate),
      icon: Clock,
      tone: "violet",
      hint: "Bajarilganlar ichida",
      filter: { state: "done" },
    },
  ];
};

/**
 * Dashboarddagi xodimlar jadvali uchun saralash va kesim.
 *
 * ⚠️ Filtr RO'YXATNI TORAYTIRADI, raqamlarni o'zgartirmaydi: "Bajarmagan"
 * tanlanganda ham xodim qatorida uning hamma soni turadi — aks holda
 * "bajarmagan" bo'limida bajargan ishlari nolga tushib ko'rinardi.
 *
 * @param {Array} people - serverdagi `report.people`
 * @param {string} filter - `DASHBOARD_PEOPLE_FILTERS` qiymati
 * @param {string} search
 */
export const filterDashboardPeople = (people = [], filter = "all", search = "") => {
  const query = search.trim().toLowerCase();

  return people.filter((person) => {
    if (query && !person.name.toLowerCase().includes(query)) return false;
    switch (filter) {
      case "completed":
        return person.completed > 0;
      case "missed":
        return person.overdue > 0;
      case "inProgress":
        return person.inProgress > 0;
      case "review":
        return person.review > 0;
      default:
        return true;
    }
  });
};

/**
 * "Qisqacha xulosa" — raqamlarni oddiy gaplarga aylantiradi. Har bir gap
 * bitta savolga javob: yaxshimi, yomonmi, nima qilish kerak.
 * @param {object} report
 * @returns {Array<{ key: string, icon: object, tone: string, text: string }>}
 */
export const buildInsights = (report, { self = false } = {}) => {
  const { kpis, previous, leaders, attention, live, weekday, timing } = report;
  const items = [];

  if (kpis.total === 0) {
    return [
      {
        key: "empty",
        icon: Sparkles,
        tone: "slate",
        text: self
          ? "Bu davrda hech kim o'ziga ish belgilamagan."
          : "Bu davrda hech kimga topshiriq berilmagan.",
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
      text: self
        ? `Xodimlar o'zlariga qo'ygan har 10 ta rejadan ${per10} tasi bajarildi. ${mood}`
        : `Har 10 ta topshiriqdan ${per10} tasi bajarildi. ${mood}`,
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
      text: self
        ? `Hozir ${live.counts.overdue} ta shaxsiy rejaning muddati o'tib ketgan.`
        : `Hozir ${live.counts.overdue} ta topshiriqning muddati o'tib ketgan — ularni tezroq ko'rib chiqing.`,
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
      text: self
        ? `${attention[0].name} o'ziga qo'ygan ${attention[0].overdue} ta rejani bajarmagan.`
        : `${attention[0].name}da ${attention[0].overdue} ta kechikkan topshiriq bor — gaplashib ko'ring.`,
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
  // Serverdan keladi (`MAX_UPLOAD_FILE_SIZE_MB`) — forma katta faylni
  // yuborishdan oldin rad etishi uchun
  maxFileSizeMb: 30,
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
