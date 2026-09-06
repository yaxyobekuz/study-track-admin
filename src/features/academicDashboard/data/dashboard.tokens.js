/**
 * TA'LIM DASHBOARDI — DIZAYN TIZIMI (YAGONA MANBA).
 *
 * Har bir komponent sinf satrlarini FAQAT shu fayldan oladi. Komponent
 * ichida "text-[11px] text-gray-400" kabi qo'lda yozilgan tipografiya
 * QOLMAYDI — aks holda ierarxiya kartadan kartaga farq qilib, "yozuvlar
 * bitta bo'lib ketgan" holatiga qaytamiz.
 *
 * Tamoyil: 5 daraja tipografiya (sarlavha → qiymat → yorliq → izoh →
 * bo'lim belgisi), har biri O'LCHAM + VAZN + RANG uchtasi bilan birdan
 * ajraladi. Bitta o'lchov (faqat o'lcham yoki faqat rang) yetarli emas.
 *
 * ⚠️ Bu yerda faqat rang/vazn/soya/harakat. Balandliklar (h-[26px] va h.)
 * `useFitRows` o'lchoviga bog'liq — ular komponentda qoladi va tegilmaydi.
 *
 * Moliya dashboardi (`DashboardCard` dense=false) bu tokenlarni
 * ISHLATMAYDI.
 */

/* ─────────────────────────── SIRTLAR ─────────────────────────── */

/**
 * Sahifa foni slate-50: kartalar oq bo'lib POP qiladi. gray-50 bilan
 * oq karta deyarli qo'shilib ketardi — "karta" sifatida o'qilmasdi.
 *
 * Karta: ring (chegara) + ikki qatlamli soya (yaqin 1px + uzoq yumshoq).
 * Hover'da ring to'qlashadi va soya chuqurlashadi, karta 2px ko'tariladi
 * — transform/box-shadow, layout'ga tegmaydi.
 */
export const SURFACE = {
  page: "bg-slate-50",

  card:
    "bg-white rounded-2xl ring-1 ring-slate-200/70 " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.10)] " +
    "hover:ring-slate-300/70 " +
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-14px_rgba(15,23,42,0.14)] " +
    "motion-safe:hover:-translate-y-0.5 " +
    "transition-[box-shadow,transform,--tw-ring-color] duration-300 ease-out-quint",

  /**
   * Sarlavha bloki: pastida ingichka chiziq — tana undan keyin boshlanadi.
   * Bu +1px: fitscreen ramkasi 90 → 91px (`fitscreen.data.js`).
   */
  cardHeader: "flex items-center gap-2 border-b border-slate-100 pb-2",

  /** Sarlavha chapidagi 6px kategoriya nuqtasi (rangi CATEGORY_DOT dan). */
  categoryDot: "size-1.5 shrink-0 rounded-full",

  /**
   * AI kartasi UCHTA belgi bilan ajraladi: (1) gradient fon, (2) violet
   * chegara, (3) gradient ikonka + "AI" pill. Bittasi yetmaydi — fon
   * juda och, chegara juda nozik; uchalasi birga chalkashmaydi.
   */
  aiCard:
    "relative overflow-hidden rounded-2xl " +
    "bg-gradient-to-br from-violet-50/70 via-white to-cyan-50/50 " +
    "ring-1 ring-violet-200/70 " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.10)] " +
    "hover:ring-violet-300/70 " +
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-14px_rgba(15,23,42,0.14)] " +
    "motion-safe:hover:-translate-y-0.5 " +
    "transition-[box-shadow,transform,--tw-ring-color] duration-300 ease-out-quint",

  /** AI kartasi yuqori chetidagi 2px gradient chiziq (shimmer bilan). */
  aiTopBar:
    "pointer-events-none absolute inset-x-0 top-0 h-0.5 " +
    "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 " +
    "bg-[length:200%_100%] motion-safe:animate-shimmer-x",

  /** AI sarlavha ikonkasi: gradient fonli kvadratcha, ichida oq Sparkles. */
  aiIconBox:
    "flex size-6 shrink-0 items-center justify-center rounded-md " +
    "bg-gradient-to-br from-violet-500 to-cyan-500 text-white " +
    "shadow-[0_2px_6px_-1px_rgba(139,92,246,0.45)] motion-safe:animate-float-y",
  aiIcon: "size-3.5",

  /** "AI" pill — sarlavha yonida. */
  aiPill:
    "rounded-full bg-violet-600 px-1.5 py-px text-[9.5px] font-bold " +
    "uppercase tracking-wider text-white",
};

/* ────────────────────── KARTA TOIFASI RANGI ────────────────────── */

/**
 * Sarlavha nuqtasi + karta aksenti. Har toifaga bitta rang: ko'z 3×3
 * to'rda kartani rangdan tanib oladi, sarlavhani o'qimasdan ham.
 * AI — nuqta o'rniga gradient ikonka (SURFACE.aiIconBox).
 */
export const CATEGORY_DOT = {
  grades: "bg-blue-500",
  attendance: "bg-emerald-500",
  classes: "bg-slate-500",
  students: "bg-sky-500",
  achievements: "bg-amber-500",
  teachers: "bg-indigo-500",
  clubs: "bg-violet-500",
  ai: "bg-gradient-to-br from-violet-500 to-cyan-500",
};

/** Toifa aksenti matn/chiziq uchun (progress, grow-x chizig'i). */
export const CATEGORY_ACCENT = {
  grades: "text-blue-500",
  attendance: "text-emerald-500",
  classes: "text-slate-500",
  students: "text-sky-500",
  achievements: "text-amber-500",
  teachers: "text-indigo-500",
  clubs: "text-violet-500",
  ai: "text-violet-500",
};

/* ─────────────────────────── TIPOGRAFIYA ─────────────────────────── */

/**
 * 5 daraja. Har biri boshqasidan KAMIDA ikki o'lchov bilan farq qiladi:
 *
 *   cardTitle  — eng qora, bold, uppercase, keng tracking: kartaning "nomi"
 *   value      — eng katta, bold, tabular: ekrandagi asosiy raqam
 *   label      — kichik, semibold, uppercase, kulrang: raqam nima ekani
 *   cardHint / valueMeta — kichik, normal/medium, kulrang: izoh
 *   sectionLabel — eng kichik, bold, eng keng tracking, eng och: bo'lim
 *
 * Kulrang faqat slate-500 va undan to'q (400 O'QILMAYDI — faqat
 * sectionLabel uchun ruxsat, u chiziqlar bilan ko'rsatilgani uchun).
 */
export const T = {
  /** Karta sarlavhasi. slate-900 bold — gray-800 semibold sust edi. */
  cardTitle:
    "text-[12.5px] font-bold uppercase tracking-[0.08em] text-slate-900",

  /** Sarlavha ostidagi/yonidagi izoh. 500 — 400 o'qilmaydi. */
  cardHint: "text-[11px] font-normal text-slate-500",

  /** Asosiy raqam — kontekstga qarab o'lcham. */
  value: "font-bold tabular-nums tracking-tight text-slate-900",
  valueKpi: "text-[22px] leading-none",
  valueTile: "text-2xl leading-none",
  valueRing: "text-2xl leading-none",

  /** Raqam ostidagi kontekst: "Avgust, 2026: 4.21". */
  valueMeta: "text-[10.5px] font-medium text-slate-500",

  /** KPI/plitka yorlig'i — semibold uppercase, raqamdan ajralib turadi. */
  label:
    "text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500",

  /** Jadval boshi — FONLI, darrov ko'rinadi. */
  tableHead:
    "text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500 " +
    "bg-slate-50/80",
  tableCell: "text-[12.5px] text-slate-700",
  /** Ism/nom — qora va qalin: qator kim haqida ekani birinchi o'qiladi. */
  tableName: "text-[12.5px] font-semibold text-slate-900",
  /** Asosiy raqam ustuni. */
  tableNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",
  /** Ikkilamchi: fan, sinf. */
  tableSub: "text-[12.5px] text-slate-500",
  /** JAMI qatori. */
  tableTotal: "font-bold text-slate-900 bg-slate-50 border-t border-slate-200",
  /** Jadval qatori hover. */
  tableRow: "transition-colors duration-200 ease-out-quint hover:bg-slate-50",

  /** Bo'lim belgisi (AI kartasidagi "Shu hafta") — chap/o'ng chiziq bilan. */
  sectionLabel:
    "text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400",
  sectionRule: "h-px flex-1 bg-slate-200",

  /** Karta pastidagi havola; strelka hover'da 2px o'ngga. */
  link:
    "inline-flex items-center gap-1 rounded-md px-2 py-1 " +
    "text-[11px] font-semibold text-slate-600 hover:text-slate-900 " +
    "bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200/60 " +
    "transition-colors duration-200 ease-out-quint",
  linkArrow:
    "size-3 transition-transform duration-200 ease-out-quint " +
    "group-hover:translate-x-0.5",

  /** Plitka (to'garak, olimpiada) — hover'da ko'tariladi, ring to'qlashadi. */
  tile:
    "rounded-xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 " +
    "motion-safe:hover:-translate-y-0.5 " +
    "transition-[transform,--tw-ring-color] duration-200 ease-out-quint",
};

/* ─────────────────────────── TON (rang shkalasi) ─────────────────────────── */

/**
 * Ijobiy/ogohlantirish/salbiy. HAMMASI semibold: rang bilan birga vazn
 * ham o'zgaradi, rangni ajrata olmaydigan ko'z ham farqni ko'radi.
 * `bar` — raqam ostidagi 2px chiziqcha, o'sha rangda.
 *
 * ⚠️ `text` 700 pog'onada — HISOBLANGAN: oq fonda emerald-600 3.8:1,
 * amber-600 3.2:1 (10-12.5px matn uchun AA 4.5:1 dan past); emerald-700
 * 5.5:1, amber-700 5.0:1, rose-700 6.3:1. `bar` va chip foni 500/50 da
 * qoladi — ular matn emas.
 */
export const TONE = {
  positive: {
    text: "font-semibold text-emerald-700",
    bar: "bg-emerald-500",
    chip:
      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold " +
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  },
  warning: {
    text: "font-semibold text-amber-700",
    bar: "bg-amber-500",
    chip:
      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold " +
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  },
  negative: {
    text: "font-semibold text-rose-700",
    bar: "bg-rose-500",
    chip:
      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold " +
      "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
  },
  neutral: {
    text: "font-semibold text-slate-600",
    bar: "bg-slate-400",
    chip:
      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold " +
      "bg-slate-50 text-slate-700 ring-1 ring-slate-200/60",
  },
};

/** Raqam ostidagi 2px ton chizig'i — asosiy sinf, rangi TONE[x].bar. */
export const TONE_BAR = "mt-0.5 h-0.5 w-full rounded-full";

/* ─────────────────────────── HARAKAT ─────────────────────────── */

/**
 * Professional xoreografiya: konteyner → kontent. Karta bo'sh kirib
 * (fade-up), KONTENT_DELAY dan keyin to'ladi. Hammasi `motion-safe:`.
 * Cheksiz harakat FAQAT breathe / shimmer-x / float-y — transform,
 * opacity, background-position; layout'ga tegmaydi.
 *
 * Kechikishlar `style={{ animationDelay }}` orqali beriladi (ms).
 */
export const MOTION = {
  /** Kirish — sarlavha, KPI, kartalar. */
  enter: "motion-safe:animate-fade-up",
  /** Gorizontal chiziq/progress kirishi. */
  growX: "origin-left motion-safe:animate-grow-x",
  /** Nafas oluvchi nuqta (jonli, davomat oxirgi nuqtasi, high ustuvorlik). */
  breathe: "motion-safe:animate-breathe",
  /** Jonli indikator nuqtasi — sarlavha panelida. */
  liveDot: "size-1.5 rounded-full bg-emerald-500 motion-safe:animate-breathe",
  /** Ustuvorlik nuqtasi (AI ro'yxati). */
  priorityDot: {
    high: "size-1.5 rounded-full bg-rose-500 motion-safe:animate-breathe",
    medium: "size-1.5 rounded-full bg-amber-500",
    low: "size-1.5 rounded-full bg-slate-400",
  },
};

/** Xoreografiya vaqtlari (ms). */
export const DELAY = {
  header: 0,
  kpiStart: 60,
  kpiStep: 45,
  gridStart: 240,
  gridRowStep: 110,
  gridColStep: 45,
  /** Karta kirgandan keyin kontent (count-up, ustunlar, qatorlar). */
  content: 140,
  /** Jadval qatorlari orasidagi qadam. */
  rowStep: 35,
};

/** KPI kartasi kechikishi (indeks bo'yicha). */
export const kpiDelay = (i) => DELAY.kpiStart + i * DELAY.kpiStep;

/** 3×3 to'r kartasi kechikishi (qator, ustun). */
export const gridDelay = (row, col) =>
  DELAY.gridStart + row * DELAY.gridRowStep + col * DELAY.gridColStep;

/** Karta ichidagi kontent kechikishi — karta kechikishi + content. */
export const contentDelay = (cardDelay, i = 0) =>
  cardDelay + DELAY.content + i * DELAY.rowStep;
