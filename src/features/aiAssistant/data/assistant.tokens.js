/**
 * AI YORDAMCHI — DIZAYN TOKENLARI (YAGONA MANBA).
 *
 * ⚠️ "AI" RANGI YO'Q. Ta'lim dashboardidagi binafsha-moviy gradient,
 * uchqun ikonkasi va "AI" belgisi bu yerda ATAYLAB ishlatilmaydi: u
 * karta ichidagi QO'SHIMCHA tahlilni ajratish uchun yaratilgan. Bu ekran
 * esa butunlay yordamchining o'zi — hamma narsa "AI" bo'lsa, belgi hech
 * narsani ajratmaydi va ekran reklama banneriga aylanadi. Ega bilan
 * kelishilgan til: neytral slate, oq sirt, yumshoq soya.
 *
 * ⚠️ KO'K (`primary`) FAQAT BITTA MA'NODA — "harakat": yuborish va
 * tasdiqlash tugmalari, fokus halqasi. Bezak sifatida ishlatilsa, ega
 * ekranda qaysi tugma ishni bajarishini rangidan topa olmay qolardi.
 *
 * ⚠️ SENTINEL SHKALASI BILAN BIR XIL o'lchamlar (19px sarlavha, 10.5px
 * yorliq, 18px karta radiusi) — bo'limlar orasida o'tganda ekran
 * "sakramasligi" uchun. NUSXA, import emas (`sentinel.tokens.js`
 * sarlavhasidagi sabab bilan): u bo'limni o'zgartirish bu ekranni jimgina
 * o'zgartirmasin.
 */

/* ─────────────────────── SIRTLAR ─────────────────────── */

export const SURFACE = {
  /** Asosiy karta — chegarasiz, yumshoq soya. */
  card:
    "relative bg-white rounded-[18px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.13)]",

  /** Karta ichidagi ajratuvchi. */
  divider: "border-slate-100",

  /** Ichki kichik blok (amal kartasi, ovozli xabar). */
  inset: "rounded-[14px] bg-white ring-1 ring-slate-200",

  /** Kulrang fondagi ichki panel. */
  muted: "rounded-[10px] bg-slate-50",
};

/* ─────────────────────── TIPOGRAFIYA ─────────────────────── */

export const T = {
  pageTitle: "text-[19px] font-semibold leading-tight tracking-[-0.02em] text-slate-900",
  hint: "text-[11.5px] leading-snug text-slate-500",

  /** Karta/blok sarlavhasi. */
  title: "text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-slate-900",
  /** Thread sarlavhasi. */
  threadTitle: "text-[14.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900",

  body: "text-[14.5px] leading-7 text-slate-800",
  bodySm: "text-[13.5px] leading-6 text-slate-700",

  /**
   * ⚠️ `tabular-nums` YO'Q. Inter'da `tnum` defisni ham kengaytiradi va sana
   * yorlig'i "15 - sentabr" bo'lib ko'rinardi. Jadvaldagi raqamlar uchun
   * kerak bo'lsa alohida qo'shiladi (soat, hisoblagich).
   */
  meta: "text-[11px] font-medium text-slate-500",

  /** Bo'lim yorlig'i. ⚠️ slate-500, slate-400 EMAS — o'qiladigan matn. */
  label: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-slate-500",
};

/* ─────────────────────── TUGMALAR ─────────────────────── */

/**
 * ⚠️ BALANDLIK UCH XIL, BOSHQASI YO'Q: 36px (asosiy), 32px (ixcham,
 * kartalar ichida), ikonka tugmasi 36×36. Bitta qatorda turli balandlikdagi
 * tugmalar — "qo'lda yig'ilgan" ekranning birinchi belgisi.
 *
 * ⚠️ FOKUS — HALQA, KONTUR EMAS. Umumiy `Button` kontur (`outline`)
 * ishlatadi; bu yerda halqa `ring-offset` bilan chiziladi va tugma
 * shaklini takrorlaydi. `outline-none` shu sababli majburiy.
 */
const FOCUS =
  "outline-none focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

export const BUTTON = {
  base:
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium " +
    "transition-[background-color,color,box-shadow] duration-150 " +
    "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 " +
    "[&_svg]:size-4 [&_svg]:shrink-0 " +
    FOCUS,

  size: {
    default: "h-9 rounded-[10px] px-3.5 text-[13px]",
    compact: "h-8 rounded-[8px] px-3 text-[12.5px]",
  },

  tone: {
    primary:
      "bg-primary text-white shadow-[0_1px_1px_rgba(15,23,42,0.08)] hover:bg-primary/90 hover:text-white disabled:hover:bg-primary",
    secondary:
      "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:hover:bg-white",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent",
    danger:
      "bg-rose-600 text-white shadow-[0_1px_1px_rgba(15,23,42,0.08)] hover:bg-rose-700 hover:text-white disabled:hover:bg-rose-600",
  },

  /** Ikonka tugmasi — 36×36 (ixcham: 32×32). */
  icon: {
    default: "size-9 rounded-[10px] px-0",
    compact: "size-8 rounded-[8px] px-0",
  },
};

/* ─────────────────────── CHIP ─────────────────────── */

export const CHIP = {
  base:
    "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 " +
    "text-[10.5px] font-semibold leading-4 ring-1 ring-inset",
  tone: {
    slate: "bg-slate-50 text-slate-700 ring-slate-200/70",
    blue: "bg-blue-50 text-blue-700 ring-blue-200/60",
    amber: "bg-amber-50 text-amber-800 ring-amber-200/60",
    orange: "bg-orange-50 text-orange-700 ring-orange-200/60",
    rose: "bg-rose-50 text-rose-700 ring-rose-200/60",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  },
};

/**
 * XAVF → OHANG va CHAP RELS. Rang bilan birga server yorlig'i
 * (`riskLabel`) doim yoziladi — rangni ajrata olmaydigan ko'z uchun.
 */
export const RISK_TONE = {
  low: { chip: "slate", rail: "bg-slate-300" },
  medium: { chip: "amber", rail: "bg-amber-400" },
  high: { chip: "orange", rail: "bg-orange-500" },
  critical: { chip: "rose", rail: "bg-rose-600" },
};

export const riskTone = (risk) => RISK_TONE[risk] ?? RISK_TONE.low;

/** Amal holati → chip ohangi. */
export const STATUS_TONE = {
  pending: "blue",
  executing: "blue",
  succeeded: "emerald",
  failed: "rose",
  rejected: "slate",
  expired: "slate",
};

export const statusTone = (status) => STATUS_TONE[status] ?? "slate";

/* ─────────────────────── HARAKAT ─────────────────────── */

/**
 * ⚠️ CHEKSIZ HARAKAT FAQAT IKKITA: `breathe` (fikrlash nuqtasi va yozish
 * kursori) va kutish spinneri. Sakraydigan uch nuqta, shimmer — yo'q:
 * ular "o'yinchoq" o'qiladi va uzun javobni o'qishga xalaqit beradi.
 */
export const MOTION = {
  enter: "motion-safe:animate-wake",
  breathe: "motion-safe:animate-breathe",
};

/** Suhbat oynasi matn kengligi — o'qish uchun qulay satr uzunligi (~90 belgi). */
export const THREAD_WIDTH = "mx-auto w-full max-w-[760px]";
