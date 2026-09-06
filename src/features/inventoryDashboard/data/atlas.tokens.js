/**
 * "ATLAS" — INVENTAR DASHBOARDINING DIZAYN TILI (YAGONA MANBA).
 *
 * ⚠️ TA'LIM/MOLIYA DASHBOARDLARIDAN ATAYLAB BOSHQACHA va bu ikkinchi
 * dizayn tizimi emas, BOSHQA JANRDAGI ekran. Ular oylik HISOBOT: oq
 * karta, ingichka chegara (`ring-1`), teng 3×3 to'r, hamma blok bir xil
 * og'irlikda. Bu esa BAZANING HOLATI — ekranda ustuvorlik bor: bitta
 * "hozir qanday" javobi va uning atrofidagi tafsilotlar. Shu sababli:
 *
 *   1. CHEGARA YO'Q. Karta chegarasi (`ring-1 ring-slate-200`) o'n ikkita
 *      blokda o'n ikkita to'rtburchak konturini chizadi va ekran "jadval
 *      ustidagi jadval" bo'lib ko'rinadi. Bu yerda kartani chegara emas,
 *      SIRT AJRATADI: oq karta + kulrang fon + juda yumshoq soya.
 *   2. BENTO TO'R, teng to'r emas: hero 7 ustun, yonidagi ko'rsatkichlar
 *      5 — chunki ular teng muhim emas.
 *   3. TO'Q HERO. Ekranda bitta og'irlik markazi bo'lishi kerak; oq
 *      kartalar dengizida to'q blok "shu yerdan boshla" deb aytadi.
 *
 * Tamoyil ta'lim tokenlaridan meros: har daraja O'LCHAM + VAZN + RANG
 * uchtasi bilan birdan ajraladi, komponent ichida qo'lda yozilgan
 * tipografiya qolmaydi.
 */

/* ─────────────────────── RANG TIZIMI ─────────────────────── */

/**
 * TO'RTTA SIGNAL + NEYTRAL. Har rang bitta MA'NOGA biriktirilgan va
 * ekran bo'ylab o'zgarmaydi — foydalanuvchi rangni bir marta o'rganadi.
 *
 *   teal    — BAZA (mulk, qiymat, yaroqli holat)
 *   rose    — ZARAR (yo'qotish, sinish)
 *   emerald — UNDIRUV (qaytgan pul)
 *   indigo  — MONITORING (intizom, hisobot)
 *   amber   — OGOHLANTIRISH (yaroqsiz, kutilmoqda, muddati o'tgan)
 *
 * ⚠️ Diagramma ranglari HEX bilan beriladi (recharts SVG atributiga
 * boradi, Tailwind sinfi u yerga yetib bormaydi), UI ranglari esa sinf
 * bilan. Ikkalasi bitta joyda turadi — aks holda diagrammadagi rose
 * bilan yorliqdagi rose bir-biridan asta-sekin uzoqlashardi.
 */
export const HUE = {
  base: "#0D9488", // teal-600
  baseSoft: "#5EEAD4", // teal-300
  damage: "#E11D48", // rose-600
  damageSoft: "#FDA4AF", // rose-300
  recovery: "#059669", // emerald-600
  recoverySoft: "#6EE7B7", // emerald-300
  monitor: "#4F46E5", // indigo-600
  monitorSoft: "#A5B4FC", // indigo-300
  warn: "#D97706", // amber-600
  warnSoft: "#FCD34D", // amber-300
  neutral: "#64748B", // slate-500
  neutralSoft: "#CBD5E1", // slate-300
  grid: "#E2E8F0", // slate-200 — diagramma to'ri
  axis: "#94A3B8", // slate-400 — o'q yozuvlari
};

/**
 * KATEGORIK SHKALA — treemap va sabab diagrammasi uchun.
 *
 * ⚠️ Kamalak EMAS: bitta ohangning (teal → cyan → indigo) qorong'ulik
 * bo'yicha pog'onalari + oxirida neytral. Sabab — bu qiymatlar TARTIBLI
 * (eng kattadan kichigiga), ya'ni ranglar ham tartibli bo'lishi kerak;
 * yetti xil ohang "har segment boshqa narsa" deb yolg'on aytardi.
 */
export const SCALE = [
  "#134E4A",
  "#0F766E",
  "#0D9488",
  "#14B8A6",
  "#2DD4BF",
  "#7DD3CB",
  "#B8E3DE",
];

/** Sabab kesimi — yo'qotish ohangi (to'q rose → och), tartibli. */
export const LOSS_SCALE = [
  "#9F1239",
  "#E11D48",
  "#FB7185",
  "#FDA4AF",
  "#FECDD3",
  "#FFE4E6",
  "#E2E8F0",
];

/**
 * SHKALA QADAMI ATAYLAB KENG. Ilgari qo'shni pog'onalar bir-biridan
 * bitta Tailwind darajasiga farq qilardi (`#9F1239` va `#BE123C`) va
 * IKKI segmentli diagrammada ular deyarli bir xil ko'rinardi —
 * afsonadagi nuqtalarni ham ajratib bo'lmasdi. Kesim ko'pincha ikki-uch
 * segmentdan iborat bo'ladi, ya'ni shkala aynan SHU holatda ishlashi
 * kerak, ettita segmentda emas.
 */

/**
 * MATN RANGI FON YORQINLIGIGA QARAB.
 *
 * ⚠️ Treemap plitkasi shkalaning istalgan pog'onasini olishi mumkin va
 * och pog'onada oq matn O'QILMAYDI (kontrast 2:1 atrofida). Rangni
 * qo'lda "bu och, bu to'q" deb belgilash esa shkala o'zgarganda jimgina
 * eskirardi — shuning uchun yorqinlik HISOBLANADI.
 *
 * Formula — sRGB luma (ITU-R BT.601). To'liq WCAG kontrast hisobi shart
 * emas: bu yerda savol ikkilik — oq matnmi yoki to'q matn.
 *
 * @param {string} hex - "#RRGGBB"
 * @returns {boolean} - fon och bo'lsa `true` (to'q matn kerak)
 */
export const isLightSurface = (hex) => {
  if (typeof hex !== "string" || hex.length < 7) return false;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

/* ─────────────────────── SIRTLAR ─────────────────────── */

export const SURFACE = {
  /**
   * Sahifa foni — slate-100/70 emas, ANIQ qiymat: karta oq bo'lgani
   * uchun fon bilan orasidagi farq 3-4% bo'lishi kerak. Ko'proq bo'lsa
   * "kulrang quti", kamroq bo'lsa karta chegarasi bilinmaydi.
   */
  page: "bg-[#F4F5F7]",

  /**
   * KARTA — CHEGARASIZ. Ajratuvchi: sirt rangi + ikki qatlamli soya.
   *   1px  — kontakt soyasi (kartaning "qirrasi")
   *   24px — yumshoq chuqurlik (ko'tarilganlik hissi)
   * Hover'da soya chuqurlashadi, karta 2px ko'tariladi. Ring YO'Q va
   * qo'shilmaydi (fayl sarlavhasidagi izoh).
   */
  card:
    "bg-white rounded-[20px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-16px_rgba(15,23,42,0.14)] " +
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_44px_-20px_rgba(15,23,42,0.20)] " +
    "motion-safe:hover:-translate-y-0.5 " +
    "transition-[box-shadow,transform] duration-300 ease-out-quint",

  /** Bosilmaydigan karta (hero, sarlavha paneli) — ko'tarilishsiz. */
  cardStatic:
    "bg-white rounded-[20px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-16px_rgba(15,23,42,0.14)]",

  /**
   * HERO — ekranning og'irlik markazi. Grafit gradient: tekis to'q rang
   * "qora to'rtburchak" bo'lib ko'rinardi, gradient esa chuqurlik beradi.
   * Ustida `heroGlow` (teal nur) va `sheen` (yaltirash) qatlamlari.
   */
  hero:
    "relative overflow-hidden rounded-[20px] " +
    "bg-[linear-gradient(145deg,#101720_0%,#182130_46%,#0E151E_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.20),0_24px_60px_-24px_rgba(15,23,42,0.55)]",

  /** Hero ichidagi teal nur — halqalar ortida, markazdan tarqaladi. */
  heroGlow:
    "pointer-events-none absolute -left-24 -top-28 size-[420px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(45,212,191,0.16)_0%,transparent_68%)]",

  /** Hero ichidagi ikkinchi nur — pastki o'ng burchakda, sovuqroq. */
  heroGlowAlt:
    "pointer-events-none absolute -bottom-32 -right-20 size-[380px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)]",

  /** Yaltirash — 9 soniyada bir marta o'tadi. */
  heroSheen:
    "pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 " +
    "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] " +
    "motion-safe:animate-sheen",

  /**
   * ICHKI PLITKA — kartaning ichidagi ajratilgan blok (KPI, mini-stat).
   * Chegara emas, FON bilan ajraladi: slate-50/80 oq kartada aniq
   * ko'rinadi va ekranda yangi kontur chizmaydi.
   */
  tile: "rounded-2xl bg-slate-50/80 transition-colors duration-300 ease-out-quint",
  tileHover: "hover:bg-slate-100/80",

  /** To'q sirt ichidagi plitka (hero). */
  tileDark: "rounded-2xl bg-white/[0.045] transition-colors duration-300 ease-out-quint",

  /** Segment/chiziq foni — progress relslari. */
  track: "bg-slate-100",
  trackDark: "bg-white/10",
};

/* ─────────────────────── TIPOGRAFIYA ─────────────────────── */

/**
 * BESH DARAJA. Ta'lim tokenlaridan farqi: karta sarlavhasi UPPERCASE
 * EMAS. Sabab — o'n ikkita blokda o'n ikkita katta harfli sarlavha
 * "e'lon taxtasi" ta'sirini beradi; sentence-case sarlavha esa kontent
 * bilan bir tekislikda turadi va ko'z raqamga tezroq tushadi.
 *
 * Raqamlar `font-semibold`, `bold` EMAS: 28-32px o'lchamda bold og'ir
 * ko'rinadi, semibold + `tracking-tight` esa zamonaviy va aniq.
 */
export const T = {
  /** Karta sarlavhasi. */
  title: "text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900",
  /** Sarlavha ostidagi izoh — nima o'lchanayotgani. */
  hint: "text-[11px] font-normal leading-snug text-slate-500",

  /** Yorliq — raqam nima ekani. */
  label: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-slate-400",
  /** To'q sirtdagi yorliq. */
  labelDark: "text-[10.5px] font-medium uppercase tracking-[0.07em] text-white/45",

  /** Raqam darajalari. */
  value: "font-semibold tabular-nums tracking-[-0.02em] text-slate-900",
  valueHero: "font-semibold tabular-nums tracking-[-0.03em] text-white",
  size2xl: "text-[30px] leading-none",
  sizeXl: "text-[22px] leading-none",
  sizeLg: "text-[17px] leading-none",
  sizeMd: "text-[14.5px] leading-none",

  /** Raqam ostidagi kontekst. */
  meta: "text-[10.5px] font-medium text-slate-500",
  metaDark: "text-[10.5px] font-medium text-white/50",

  /** Jadval. Chiziqsiz: qatorlar hover foni bilan ajraladi. */
  th: "text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400",
  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-medium text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",
  row: "transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",

  /** Havola — tugma emas, matn (karta ichida ortiqcha quti chizmaydi). */
  link:
    "group inline-flex items-center gap-1 text-[11px] font-semibold " +
    "text-slate-500 hover:text-slate-900 transition-colors duration-200 ease-out-quint",
  linkArrow:
    "size-3 transition-transform duration-200 ease-out-quint group-hover:translate-x-0.5",
};

/* ─────────────────────── OHANG (chip / delta) ─────────────────────── */

/**
 * O'ZGARISH KO'RSATKICHI. Rang YAGONA belgi emas: ishora (↑/↓) va vazn
 * ham o'zgaradi — rangni ajrata olmaydigan ko'z ham farqni ko'radi.
 *
 * ⚠️ "Yaxshi" yo'nalish ko'rsatkichga BOG'LIQ: zarar o'sishi yomon,
 * undiruv o'sishi yaxshi. Shuning uchun komponent `positive` ni O'ZI
 * hal qiladi, token faqat ko'rinishni beradi.
 */
export const DELTA = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  flat: "text-slate-500 bg-slate-100",
  chip:
    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 " +
    "text-[10px] font-semibold tabular-nums leading-none",

  /** To'q sirtdagi variant — fon shaffof, matn yorqin. */
  upDark: "text-emerald-300 bg-emerald-400/12",
  downDark: "text-rose-300 bg-rose-400/12",
  flatDark: "text-white/55 bg-white/8",
};

/** Signal chipi (holat yorlig'i) — bir xil shakl, besh ohang. */
export const CHIP = {
  base: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
  tone: {
    base: "bg-teal-50 text-teal-700",
    damage: "bg-rose-50 text-rose-700",
    recovery: "bg-emerald-50 text-emerald-700",
    monitor: "bg-indigo-50 text-indigo-700",
    warn: "bg-amber-50 text-amber-700",
    neutral: "bg-slate-100 text-slate-600",
  },
};

/* ─────────────────────── HARAKAT ─────────────────────── */

/**
 * XOREOGRAFIYA: hero → ko'rsatkichlar → to'r, yuqoridan pastga.
 * Blok BO'SH kiradi (`rise`), kontenti undan `content` ms keyin to'ladi.
 * Hammasi `motion-safe:` — `prefers-reduced-motion` da darhol ko'rinadi.
 */
export const MOTION = {
  enter: "motion-safe:animate-rise",
  enterX: "motion-safe:animate-rise-x",
  ring: "motion-safe:animate-ring-fill",
  draw: "motion-safe:animate-draw-path",
  growY: "origin-bottom motion-safe:animate-grow-y",
  growX: "origin-left motion-safe:animate-grow-x",
  pop: "motion-safe:animate-pop-in",

  /** Jonli nuqta — nafas oluvchi halqa bilan (ping EMAS). */
  liveDot: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-orbit",
};

/** Xoreografiya vaqtlari (ms). */
export const DELAY = {
  header: 0,
  hero: 80,
  metricStart: 180,
  metricStep: 40,
  gridStart: 340,
  gridStep: 70,
  /** Blok kirgandan keyin kontent. */
  content: 180,
  /** Ro'yxat qatorlari orasidagi qadam. */
  rowStep: 45,
};

export const metricDelay = (i) => DELAY.metricStart + i * DELAY.metricStep;
export const gridDelay = (i) => DELAY.gridStart + i * DELAY.gridStep;
export const contentDelay = (blockDelay, i = 0) =>
  blockDelay + DELAY.content + i * DELAY.rowStep;
