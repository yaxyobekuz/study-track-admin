// Icons
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  CalendarX,
  Crown,
  Eye,
  Gauge,
  GraduationCap,
  Layers,
  ListOrdered,
  School,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Waves,
} from "lucide-react";

/**
 * BAHOLAR TAHLILI — statik ma'lumot (yorliqlar, ikonkalar, formatlovchilar).
 *
 * ⚠️ Topilma kodlari SERVER bilan shartnoma (`helpers/gradeAnalysis.js`
 * → `FINDING_CODES`) va bazada muhrlangan hisobotlarda turadi — qayta
 * nomlanmaydi. Noma'lum kod kelsa ham qator yo'qolmaydi (`findingMeta`).
 */

/* ─────────────────────────── TAHLIL HOLATI ─────────────────────────── */

export const RUN_STATUS = {
  queued: { label: "Navbatda", chip: "bg-slate-100 text-slate-700 ring-slate-200/70" },
  running: { label: "Ishlanmoqda", chip: "bg-indigo-50 text-indigo-700 ring-indigo-200/70" },
  completed: { label: "Tayyor", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/70" },
  failed: { label: "Xato", chip: "bg-rose-50 text-rose-700 ring-rose-200/70" },
  cancelled: { label: "To'xtatildi", chip: "bg-slate-100 text-slate-500 ring-slate-200/70" },
};

export const TRIGGER_LABEL = { manual: "Qo'lda", weekly: "Haftalik avtomat" };

export const SCOPE_ICON = { school: School, classes: Users, student: User };

export const SCOPE_OPTIONS = [
  { key: "school", label: "Butun maktab", hint: "Barcha o'quvchilar", icon: School },
  { key: "classes", label: "Sinflar", hint: "Bir yoki bir nechta sinf", icon: Users },
  { key: "student", label: "Bitta o'quvchi", hint: "Qidiruv orqali tanlang", icon: User },
];

/* ─────────────────────────── O'QUVCHILAR RO'YXATI ─────────────────────────── */

export const REPORT_SORTS = [
  { value: "risk", label: "Xavf bo'yicha" },
  { value: "lowest", label: "Eng past o'rtacha" },
  { value: "average", label: "Eng yuqori o'rtacha" },
];

export const SPOTLIGHT_TABS = [
  { value: "risk", label: "Xavf guruhi", icon: AlertTriangle },
  { value: "decliners", label: "Pasayganlar", icon: TrendingDown },
  { value: "improvers", label: "O'sganlar", icon: TrendingUp },
  { value: "top", label: "Eng yaxshilar", icon: Crown },
];

export const AUDIENCE_TABS = [
  { value: "parent", label: "Ota-onaga" },
  { value: "student", label: "O'quvchiga" },
  { value: "staff", label: "Xodimga" },
];

/* ─────────────────────────── TOPILMALAR ─────────────────────────── */

const FINDINGS = {
  strong_subject: { label: "A'lo o'zlashtirilgan fan", icon: Crown },
  improving_subject: { label: "Fan bo'yicha o'sish", icon: TrendingUp },
  above_class: { label: "Sinfdan yuqori", icon: ArrowUpRight },
  overall_improving: { label: "Umumiy o'sish", icon: TrendingUp },
  strong_topic: { label: "Yaxshi o'zlashtirilgan mavzu", icon: BookOpenCheck },
  weak_subject: { label: "Past o'zlashtirilgan fan", icon: AlertTriangle },
  declining_subject: { label: "Fan bo'yicha pasayish", icon: TrendingDown },
  overall_declining: { label: "Umumiy pasayish", icon: TrendingDown },
  below_class: { label: "Sinfdan ortda qolish", icon: ArrowDownRight },
  class_wide_difficulty: { label: "Fan butun sinfga qiyin", icon: Users },
  unstable_subject: { label: "Beqaror natija", icon: Waves },
  low_streak: { label: "Ketma-ket past baholar", icon: ListOrdered },
  weak_topic: { label: "Zaif mavzu", icon: Target },
  absence_impact: { label: "Dars qoldirish ta'siri", icon: CalendarX },
  low_attendance: { label: "Past davomat", icon: CalendarX },
  diag_weak_topic: { label: "Diagnostikada zaif mavzu", icon: Target },
  diag_rushing: { label: "Shoshilish", icon: Timer },
  diag_misread: { label: "Shartni diqqatsiz o'qish", icon: Eye },
  diag_knowledge: { label: "Bilim bo'shlig'i", icon: Brain },
  keep_going: { label: "Davom eting", icon: Sparkles },
  ai: { label: "Tavsiya", icon: Sparkles },
};

export const findingMeta = (code) => FINDINGS[code] ?? { label: code, icon: Layers };

/* ─────────────────────────── KO'RSATKICH IKONKALARI ─────────────────────────── */

export const METRIC_ICON = {
  students: GraduationCap,
  quality: Gauge,
  risk: AlertTriangle,
  trend: TrendingUp,
};

/* ─────────────────────────── FORMATLOVCHILAR ─────────────────────────── */

/** O'rtacha baho: har doim ikki xona ("4.30") — server matni bilan bir xil. */
export const fmtAvg = (value) => (value == null || !Number.isFinite(value) ? "—" : Number(value).toFixed(2));

/** Farq: "+0.40" / "−0.35" (haqiqiy minus belgisi). */
export const fmtDelta = (value) => {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value).toFixed(2);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
};

/** Farq ohangi: ±0.05 ichida — neytral (yaxlitlash shovqini). */
export const deltaTone = (value) => {
  if (value == null || Math.abs(value) < 0.05) return "neutral";
  return value > 0 ? "positive" : "critical";
};

export const fmtPercent = (value) => (value == null ? "—" : `${value}%`);

/** O'rtachani 5 ballik shkalada foizga: 2 → 0%, 5 → 100% (fan chiziqlari). */
export const averageToWidth = (value) => {
  if (value == null) return 0;
  return Math.max(3, Math.min(100, ((value - 2) / 3) * 100));
};

export const fullName = (snapshot) =>
  [snapshot?.firstName, snapshot?.lastName].filter(Boolean).join(" ") || "—";
