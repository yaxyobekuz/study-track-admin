/**
 * "SENTINEL" — XAVFSIZLIK BO'LIMINING DIZAYN TILI (YAGONA MANBA).
 *
 * ⚠️ "PULS" NING UKASI, BEShINCHI MUSTAQIL TIL EMAS — va bu ataylab.
 *
 * Tizimda allaqachon uchta dizayn tili bor (hisobot / Atlas / Puls) va
 * to'rtinchi MUSTAQIL tilni qo'shish ularning har birini
 * ma'nosizlantirardi: agar har bo'lim o'z tipografiya shkalasini va o'z
 * karta shaklini olsa, "bu qanday tizim" degan savolga javob qolmaydi.
 *
 * Shu sababli Sentinel Pulsdan MEROS OLADI:
 *   • bir xil tipografiya shkalasi (besh daraja)
 *   • bir xil karta qobig'i (chegarasiz sirt + chap signal relsi)
 *   • bir xil xoreografiya vaqtlari
 *
 * va FAQAT IKKI narsada undan ajraladi — chunki bu ikkisi bo'limning
 * MA'NOSI:
 *
 *   1. RANG O'QI — JIDDIYLIK, kanal emas. Pulsda rang "qaysi kanal"
 *      degan savolga javob beradi (violet bot, sky panel). Bu yerda
 *      esa rang "qanchalik jiddiy" ni bildiradi: rose → amber → sky →
 *      slate. Ikkalasida bitta rang ikki xil ma'no tashisa,
 *      foydalanuvchi rangni o'rgana olmasdi.
 *
 *   2. HERO — KUZATUV PANELI. Pulsning hero'si binafsha va u
 *      "faollik" ni bildiradi; bu yerda deyarli qora grafit va ustidan
 *      sekin o'tadigan kuzatuv chizig'i (`scan`). Ekran "hammasi
 *      joyidami?" degan savolga javob beradi va to'q sirt aynan shu
 *      ohangni beradi.
 *
 * ⚠️ OGOHLANTIRISHLAR CHAQNAMAYDI VA TEBRANMAYDI. Jiddiylik RANG va
 * VAZN bilan beriladi, harakat bilan emas: chaqnayotgan qatorlar
 * ro'yxatni o'qib bo'lmas holga keltirardi va "hammasi shoshilinch"
 * degani "hech narsa shoshilinch emas" bilan bir xil natija berardi.
 */

/* ─────────────────────── RANG TIZIMI ─────────────────────── */

/**
 * JIDDIYLIK SHKALASI — to'rt pog'ona, tartibli.
 *
 * ⚠️ TARTIB MA'NOLI: `critical` → `low` gacha issiqdan sovuqqa. Har
 * pog'ona faqat RANG bilan emas, YORLIQ bilan ham ajraladi (ro'yxatda
 * "Jiddiy"/"Yuqori"/"O'rta"/"Past" yozuvi turadi) — rangni ajrata
 * olmaydigan ko'z uchun.
 */
export const SEVERITY = {
  critical: {
    key: "critical",
    label: "Jiddiy",
    order: 0,
    chip: "bg-rose-50 text-rose-700",
    rail: "bg-rose-500",
    dot: "bg-rose-500",
    hex: "#E11D48",
    icon: "bg-rose-50 text-rose-600",
  },
  high: {
    key: "high",
    label: "Yuqori",
    order: 1,
    chip: "bg-orange-50 text-orange-700",
    rail: "bg-orange-500",
    dot: "bg-orange-500",
    hex: "#EA580C",
    icon: "bg-orange-50 text-orange-600",
  },
  medium: {
    key: "medium",
    label: "O'rta",
    order: 2,
    chip: "bg-amber-50 text-amber-700",
    rail: "bg-amber-400",
    dot: "bg-amber-400",
    hex: "#D97706",
    icon: "bg-amber-50 text-amber-600",
  },
  low: {
    key: "low",
    label: "Past",
    order: 3,
    chip: "bg-slate-100 text-slate-600",
    rail: "bg-slate-300",
    dot: "bg-slate-400",
    hex: "#64748B",
    icon: "bg-slate-100 text-slate-500",
  },
};

/** Jiddiylik pog'onalari — ro'yxat tartibida. */
export const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

/** Noma'lum qiymat uchun xavfsiz qaytish. */
export const severityOf = (key) => SEVERITY[key] ?? SEVERITY.low;

/** Ogohlantirish holatlari. */
export const STATUS = {
  open: { key: "open", label: "Ochiq", chip: "bg-rose-50 text-rose-700" },
  acknowledged: {
    key: "acknowledged",
    label: "Ko'rib chiqilmoqda",
    chip: "bg-amber-50 text-amber-700",
  },
  resolved: {
    key: "resolved",
    label: "Yopilgan",
    chip: "bg-emerald-50 text-emerald-700",
  },
};

export const statusOf = (key) => STATUS[key] ?? STATUS.open;

/**
 * Diagramma ranglari — HEX (recharts SVG atributiga boradi).
 *
 * ⚠️ `success` KO'K, YASHIL EMAS. Yashil bu ekranda "muammo yo'q"
 * degan ma'noni tashiydi va "muvaffaqiyatli kirish" uni egallab
 * qo'ysa, ko'z jiddiylik shkalasini o'qiy olmasdi.
 */
export const HUE = {
  success: "#0284C7", // sky-600 — muvaffaqiyatli kirish
  successSoft: "#7DD3FC",
  failed: "#E11D48", // rose-600 — muvaffaqiyatsiz urinish
  failedSoft: "#FDA4AF",
  session: "#4F46E5", // indigo-600 — ochiq seans
  sessionSoft: "#A5B4FC",
  neutral: "#64748B",
  neutralSoft: "#CBD5E1",
  grid: "#E9EAEF",
  axis: "#94A3B8",
};

/* ─────────────────────── SIRTLAR ─────────────────────── */

export const SURFACE = {
  /** Karta — Puls bilan bir xil (chegarasiz sirt + signal relsi). */
  card:
    "relative overflow-hidden bg-white rounded-[18px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.13)] " +
    "transition-[box-shadow,transform] duration-300 ease-out-quint",

  cardHover:
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_38px_-18px_rgba(15,23,42,0.19)] " +
    "motion-safe:hover:-translate-y-0.5",

  /**
   * HERO — KUZATUV PANELI. Deyarli qora grafit: Pulsning binafsha
   * hero'sidan ataylab sovuqroq va jiddiyroq.
   */
  hero:
    "relative overflow-hidden rounded-[18px] " +
    "bg-[linear-gradient(155deg,#0C1119_0%,#161D28_48%,#0A0E15_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.22),0_22px_54px_-24px_rgba(15,23,42,0.6)]",

  /** Hero fonidagi qizg'ish nur — ogohlantirish bo'lganda kuchayadi. */
  heroGlow:
    "pointer-events-none absolute -left-24 -top-28 size-[400px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(225,29,72,0.14)_0%,transparent_68%)]",

  /** Ikkinchi nur — sovuq, pastki o'ngda. */
  heroGlowAlt:
    "pointer-events-none absolute -bottom-28 -right-20 size-[360px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(79,70,229,0.16)_0%,transparent_70%)]",

  /**
   * KUZATUV CHIZIG'I — hero ustidan 7 soniyada bir marta o'tadi.
   *
   * ⚠️ Bu ekranning YAGONA doimiy harakati. Ikkinchisi qo'shilsa,
   * ular bir-biri bilan raqobatlashib, ro'yxatdagi jiddiy qatorni
   * ko'rishga xalaqit berardi.
   */
  heroScan:
    "pointer-events-none absolute inset-x-0 top-0 h-px " +
    "bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.5),transparent)] " +
    "motion-safe:animate-scan",

  /** Ichki plitka. */
  tile: "rounded-2xl bg-slate-50/80 transition-colors duration-300 ease-out-quint",
  tileHover: "hover:bg-slate-100/80",
  tileDark: "rounded-2xl bg-white/[0.055] transition-colors duration-300 ease-out-quint",

  track: "bg-slate-100",
  trackDark: "bg-white/10",
};

/** Signal relsi — Puls bilan bir xil shakl, jiddiylik ohanglari bilan. */
export const RAIL = {
  base: "absolute inset-y-0 left-0 w-[3px]",
  tone: {
    alert: "bg-rose-500",
    warn: "bg-amber-400",
    session: "bg-indigo-500",
    success: "bg-sky-500",
    device: "bg-slate-400",
    neutral: "bg-slate-300",
  },
};

/* ─────────────────────── TIPOGRAFIYA ─────────────────────── */

/**
 * Puls bilan AYNAN BIR XIL SHKALA — ataylab. Ikki qo'shni bo'lim
 * boshqa o'lchamlarda yozsa, ular orasida o'tganda ekran "sakrab"
 * ketardi.
 *
 * ⚠️ YAGONA QO'ShIMCHA: `mono` bu yerda ko'proq ishlatiladi (IP,
 * qurilma, `jti`). Texnik ma'lumot O'QILMAYDI — TAQQOSLANADI, va
 * mono shrift ustunda belgilarni tik tekislaydi.
 */
export const T = {
  title: "text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900",
  hint: "text-[11px] font-normal leading-snug text-slate-500",

  label: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-slate-400",
  labelDark: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-white/45",

  value: "font-semibold tabular-nums tracking-[-0.02em] text-slate-900",
  valueHero: "font-semibold tabular-nums tracking-[-0.03em] text-white",
  size3xl: "text-[38px] leading-none",
  size2xl: "text-[28px] leading-none",
  sizeXl: "text-[21px] leading-none",
  sizeLg: "text-[17px] leading-none",
  sizeMd: "text-[14.5px] leading-none",

  meta: "text-[10.5px] font-medium text-slate-500",
  metaDark: "text-[10.5px] font-medium text-white/50",

  th: "text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400",
  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-medium text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",
  row: "transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",

  /** IP, qurilma, texnik identifikator. */
  mono: "font-mono text-[11px] tracking-tight text-slate-500",
  monoDark: "font-mono text-[11px] tracking-tight text-white/55",
};

/* ─────────────────────── CHIP ─────────────────────── */

export const CHIP = {
  base: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
  tone: {
    alert: "bg-rose-50 text-rose-700",
    warn: "bg-amber-50 text-amber-700",
    session: "bg-indigo-50 text-indigo-700",
    success: "bg-sky-50 text-sky-700",
    good: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-100 text-slate-600",
  },
  toneDark: {
    alert: "bg-rose-400/15 text-rose-200",
    warn: "bg-amber-400/15 text-amber-200",
    good: "bg-emerald-400/15 text-emerald-200",
    neutral: "bg-white/10 text-white/70",
  },
};

/* ─────────────────────── QATOR TIZIMI ─────────────────────── */

/**
 * RO'YXAT QATORLARI — HAIRLINE BILAN AJRALADI.
 *
 * ⚠️ ILGARI QATORLAR FAQAT HOVER'DA AJRALARDI va bu XATO edi: sichqoncha
 * turmagan holatda ekranda shunchaki oq fonda matn oqimi turardi, ko'z
 * esa qayerda bir qator tugab, ikkinchisi boshlanganini topa olmasdi.
 * Ro'yxatning butun ma'nosi — QATORMA-QATOR taqqoslash.
 *
 * ⚠️ KARTA CHEGARASI EMAS, QATOR AJRATUVCHISI. `atlas`/`pulse`
 * doktrinasi kuchida qoladi: KARTA chegarasiz (o'nta blok o'nta kontur
 * chizmaydi). Bu yerda esa kontur emas, ichki TARTIB chizig'i — u
 * kartaning shaklini o'zgartirmaydi, faqat ichini o'qiladigan qiladi.
 * Linear, Stripe va Vercel aynan shu farqqa tayanadi.
 *
 * ⚠️ QATOR KARTA CHETIGACHA CHO'ZILADI (`-mx-5` + qatorda `px-5`).
 * Ajratuvchi ichkarida qolsa, u "jadval" bo'lib ko'rinardi; chetgacha
 * cho'zilganda esa u fonning tabiiy bo'linishiga aylanadi.
 *
 * ⚠️ HAIRLINE `slate-100`, `slate-200` EMAS. Ikkinchisi 12 qatorli
 * ro'yxatda "chiziqli daftar" ta'sirini berardi — ajratuvchi
 * ko'rinishi kerak, lekin O'QILMASLIGI kerak.
 */
export const ROW = {
  /** Ro'yxat konteyneri — karta chetigacha, qatorlar orasida hairline. */
  list: "-mx-5 divide-y divide-slate-100",

  /** Ro'yxat surilganda — sarlavha ostidagi soya bilan. */
  scroll: "max-h-[420px] overflow-y-auto hidden-scrollbar",

  /**
   * QATOR. `group` — ichidagi aksent va o'q hover'ga javob berishi
   * uchun. Balandlik `py-2.5`: undan past bo'lsa hairline'lar
   * bir-biriga yaqinlashib "jadval" bo'lib ketadi.
   */
  base:
    "group relative flex w-full items-center gap-3 px-5 py-2.5 text-left " +
    "transition-colors duration-200 ease-out-quint",

  /** Hover foni — bosiladigan va bosilmaydigan qatorda bir xil. */
  hover: "hover:bg-slate-50",

  /** Bosiladigan qator — kursor va klaviatura fokusi. */
  clickable:
    "cursor-pointer outline-none focus-visible:bg-slate-50 " +
    "focus-visible:ring-inset focus-visible:ring-2",

  /**
   * CHAP AKSENT — faqat hover/fokusda ko'rinadi.
   *
   * ⚠️ `opacity` EMAS, `scaleY`: chiziq yuqoridan pastga OCHILADI va
   * bu harakat "shu qator tanlandi" degan ma'noni beradi. Oddiy
   * paydo bo'lish esa shunchaki rang o'zgarishi bo'lib qolardi.
   */
  rail:
    "absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 " +
    "transition-transform duration-200 ease-out-quint " +
    "group-hover:scale-y-100 group-focus-visible:scale-y-100",
};

/**
 * TO'LGAN USTUN — ustidan sekin o'tadigan yorug'lik bilan.
 *
 * ⚠️ FAQAT ASOSIY KO'RSATKICHDA. Har ustunda bo'lsa, ekran chaqnab
 * turgan bo'lardi va harakat ma'nosini yo'qotardi — u "bu yerga qara"
 * deb aytishi kerak, "men bezakman" deb emas.
 */
export const BAR = {
  track: "relative h-1.5 overflow-hidden rounded-full bg-slate-100",
  fill:
    "absolute inset-y-0 left-0 rounded-full origin-left " +
    "motion-safe:animate-sweep",
  /** Yorug'lik bandi — `fill` ning ICHIGA qo'yiladi. */
  sheen:
    "pointer-events-none absolute inset-y-0 w-1/3 " +
    "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] " +
    "motion-safe:animate-flow",
};

/* ─────────────────────── HARAKAT ─────────────────────── */

export const MOTION = {
  enter: "motion-safe:animate-wake",
  enterUp: "motion-safe:animate-wake-up",
  alertIn: "motion-safe:animate-alert-in",
  sweep: "origin-left motion-safe:animate-sweep",

  /** "Hozir tizimda" belgisi. */
  liveDot: "relative flex size-2 items-center justify-center",
  liveCore: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-pulse-ring",
};

/** Xoreografiya vaqtlari (ms) — Puls bilan bir xil. */
export const DELAY = {
  header: 0,
  hero: 70,
  metricStart: 170,
  metricStep: 38,
  gridStart: 320,
  gridStep: 65,
  content: 170,
  rowStep: 42,
};

export const metricDelay = (i) => DELAY.metricStart + i * DELAY.metricStep;
export const gridDelay = (i) => DELAY.gridStart + i * DELAY.gridStep;
export const contentDelay = (blockDelay, i = 0) =>
  blockDelay + DELAY.content + i * DELAY.rowStep;

/* ─────────────────────── KANAL YORLIQLARI ─────────────────────── */

/**
 * Kanal → nom. Server `ACTIVITY_CHANNEL_LABELS` bilan bir xil bo'lishi
 * kerak, lekin frontendda ham kerak: ro'yxat qatori uchun serverga
 * qo'shimcha so'rov yuborish ma'nosiz.
 */
export const CHANNEL_LABELS = {
  bot: "Telegram bot",
  admin: "Admin panel",
  teacher: "O'qituvchi paneli",
  student: "O'quvchi paneli",
  reception: "Qabulxona",
  worker: "Xodim paneli",
};

export const channelLabel = (key) => CHANNEL_LABELS[key] ?? key;
