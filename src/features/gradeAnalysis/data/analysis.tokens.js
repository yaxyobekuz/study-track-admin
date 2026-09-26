/**
 * BAHOLAR TAHLILI — DIZAYN TIZIMI ("Prizma", YAGONA MANBA).
 *
 * Har bir dashboardning o'z xarakteri bor (moliya — jadval, dars soatlari —
 * "Ledger", inventar — "Atlas"). Bu yerniki — PRIZMA: bitta tahlil
 * yorug'ligini fanlar, sinflar, mavzular va o'quvchilarga ajratib beradi.
 * Shuning uchun rang — MA'LUMOT: har bir o'rtacha baho bitta shkaladan
 * (`LEVEL`/`heatOf`) rang oladi va ekranning hamma joyida bir xil ma'noda.
 *
 * ⚠️ Komponent ichida qo'lda "text-[11px] text-gray-400" yozilmaydi —
 * tipografiya va sirt faqat shu fayldan. Aks holda ierarxiya kartadan
 * kartaga farq qilib ketadi.
 *
 * ⚠️ Harakat — faqat `motion-safe:` va faqat transform/opacity. Cheksiz
 * harakat IKKITA: hero nuri (`tide`) va jonli progress nuqtasi (`breathe`).
 * Uchinchisi qo'shilsa ekran reklama banneriga aylanadi.
 */

/* ─────────────────────────── SIRTLAR ─────────────────────────── */

export const SURFACE = {
  card:
    "relative overflow-hidden rounded-[18px] bg-white ring-1 ring-slate-200/70 " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-16px_rgba(15,23,42,0.14)]",

  /** Bosiladigan karta/qator — ko'tariladi va soyasi chuqurlashadi. */
  hover:
    "transition-[box-shadow,transform,--tw-ring-color] duration-300 ease-out-quint " +
    "hover:ring-slate-300/80 hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_38px_-18px_rgba(15,23,42,0.22)] " +
    "motion-safe:hover:-translate-y-0.5",

  /** Qorong'i hero — sahifaning yagona "sahna" bloki. */
  hero:
    "relative isolate overflow-hidden rounded-[22px] " +
    "bg-[linear-gradient(145deg,#0B1020_0%,#111933_48%,#070B16_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.25),0_28px_70px_-30px_rgba(15,23,42,0.65)]",

  /** Hero nuri: ikki radial yorug'lik, sekin suzadi. */
  heroLight:
    "pointer-events-none absolute inset-0 -z-10 bg-[length:180%_180%] " +
    "bg-[radial-gradient(70%_90%_at_85%_0%,rgba(99,102,241,0.34),transparent_60%)," +
    "radial-gradient(60%_80%_at_0%_100%,rgba(6,182,212,0.20),transparent_62%)," +
    "radial-gradient(40%_50%_at_50%_50%,rgba(16,185,129,0.07),transparent_70%)] " +
    "motion-safe:animate-tide [animation-duration:18s]",

  /** Hero ichidagi nozik to'r naqshi (chuqurlik hissi). */
  heroGrid:
    "pointer-events-none absolute inset-0 -z-10 opacity-[0.07] " +
    "bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] " +
    "bg-[size:28px_28px] [mask-image:radial-gradient(80%_70%_at_70%_20%,black,transparent)]",

  heroTile:
    "rounded-2xl bg-white/[0.045] px-4 py-3.5 ring-1 ring-white/[0.07] backdrop-blur-sm",

  tile: "rounded-2xl bg-slate-50/80 ring-1 ring-slate-200/50",

  rule: "h-px w-full bg-slate-100",
};

/* ─────────────────────────── TIPOGRAFIYA ─────────────────────────── */

export const T = {
  pageTitle: "text-[26px] font-semibold leading-none tracking-[-0.03em] text-white xs:text-[30px]",

  title: "text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900",
  hint: "text-[11px] font-normal leading-snug text-slate-500",

  label: "text-[10.5px] font-semibold uppercase tracking-[0.07em] text-slate-500",
  labelDark: "text-[10.5px] font-medium uppercase tracking-[0.08em] text-white/50",

  value: "font-semibold tabular-nums tracking-[-0.02em] text-slate-900",
  valueHero: "font-semibold tabular-nums tracking-[-0.035em] text-white",
  size4xl: "text-[46px] leading-none xs:text-[56px]",
  size2xl: "text-[26px] leading-none",
  sizeXl: "text-[20px] leading-none",
  sizeLg: "text-[16px] leading-none",

  meta: "text-[11px] font-medium text-slate-500",
  metaDark: "text-[11px] font-medium text-white/55",

  body: "text-[13px] leading-relaxed text-slate-700",
  bodyStrong: "text-[13px] font-semibold leading-snug text-slate-900",

  th: "text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-500",
  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-semibold text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",

  section: "text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400",
};

/* ─────────────────────────── DARAJA SHKALASI ─────────────────────────── */

/**
 * O'quvchi darajasi — serverdagi `LEVELS` bilan AYNI kalitlar.
 * `hex` — grafik (recharts) uchun, qolgani Tailwind sinflari.
 */
export const LEVEL = {
  excellent: {
    label: "A'lo",
    hex: "#10B981",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    text: "text-emerald-700",
  },
  good: {
    label: "Yaxshi",
    hex: "#0EA5E9",
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700 ring-sky-200/70",
    text: "text-sky-700",
  },
  average: {
    label: "O'rta",
    hex: "#F59E0B",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800 ring-amber-200/70",
    text: "text-amber-700",
  },
  weak: {
    label: "Past",
    hex: "#F97316",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-200/70",
    text: "text-orange-700",
  },
  critical: {
    label: "Xavfli",
    hex: "#F43F5E",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200/70",
    text: "text-rose-700",
  },
  insufficient: {
    label: "Ma'lumot yetarli emas",
    hex: "#CBD5E1",
    dot: "bg-slate-300",
    chip: "bg-slate-50 text-slate-600 ring-slate-200/70",
    text: "text-slate-500",
  },
};

export const LEVEL_ORDER = ["excellent", "good", "average", "weak", "critical", "insufficient"];

export const levelOf = (key) => LEVEL[key] ?? LEVEL.insufficient;

/**
 * O'rtacha baho → daraja kaliti. Chegaralar serverdagi `LEVELS` bilan
 * AYNI (4.5 / 3.9 / 3.3 / 2.8) — issiqlik xaritasi va fan chiziqlari
 * o'quvchi darajasi bilan bir xil rangda gapiradi.
 */
export const levelKeyOfAverage = (average) => {
  if (average == null || !Number.isFinite(average)) return "insufficient";
  if (average >= 4.5) return "excellent";
  if (average >= 3.9) return "good";
  if (average >= 3.3) return "average";
  if (average >= 2.8) return "weak";
  return "critical";
};

/**
 * Issiqlik xaritasi katagi — fon va matn. Fon ohangi o'rtachaga qarab
 * TO'YINADI (och → to'q), shuning uchun "qayer eng qizil" bir qarashda
 * ko'rinadi.
 */
export const HEAT = {
  excellent: "bg-emerald-500/[0.16] text-emerald-800",
  good: "bg-sky-500/[0.14] text-sky-800",
  average: "bg-amber-400/[0.22] text-amber-900",
  weak: "bg-orange-500/[0.22] text-orange-900",
  critical: "bg-rose-500/[0.26] text-rose-900",
  insufficient: "bg-slate-50 text-slate-400",
};

export const heatOf = (average) => HEAT[levelKeyOfAverage(average)];

/* ─────────────────────────── OHANG (topilmalar) ─────────────────────────── */

export const TONE = {
  positive: {
    icon: "bg-emerald-500 text-white",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    ring: "ring-emerald-200/70",
    rail: "bg-emerald-500",
    text: "text-emerald-700",
  },
  warning: {
    icon: "bg-amber-500 text-white",
    soft: "bg-amber-50 text-amber-800 ring-amber-200/70",
    ring: "ring-amber-200/80",
    rail: "bg-amber-500",
    text: "text-amber-700",
  },
  critical: {
    icon: "bg-rose-500 text-white",
    soft: "bg-rose-50 text-rose-700 ring-rose-200/70",
    ring: "ring-rose-200/80",
    rail: "bg-rose-500",
    text: "text-rose-700",
  },
  info: {
    icon: "bg-indigo-500 text-white",
    soft: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    ring: "ring-indigo-200/70",
    rail: "bg-indigo-500",
    text: "text-indigo-700",
  },
  neutral: {
    icon: "bg-slate-400 text-white",
    soft: "bg-slate-50 text-slate-700 ring-slate-200/70",
    ring: "ring-slate-200/70",
    rail: "bg-slate-300",
    text: "text-slate-600",
  },
};

export const toneOf = (key) => TONE[key] ?? TONE.neutral;

/** Ustuvorlik relsi — `high` nafas oladi (yagona harakatlanuvchisi). */
export const PRIORITY = {
  high: { label: "Yuqori", rail: "bg-rose-500 motion-safe:animate-breathe", chip: TONE.critical.soft },
  medium: { label: "O'rta", rail: "bg-amber-500", chip: TONE.warning.soft },
  low: { label: "Past", rail: "bg-slate-300", chip: TONE.neutral.soft },
};

/* ─────────────────────────── HARAKAT ─────────────────────────── */

export const MOTION = {
  enter: "motion-safe:animate-fade-up",
  growX: "origin-left motion-safe:animate-grow-x",
  breathe: "motion-safe:animate-breathe",
};

/** Xoreografiya (ms): hero → bloklar qatorma-qator. */
export const DELAY = {
  hero: 0,
  row: (i) => 160 + i * 90,
  item: (base, i) => base + 120 + i * 35,
};
