/**
 * "PULS" — FAOLLIK DASHBOARDINING DIZAYN TILI (YAGONA MANBA).
 *
 * ⚠️ UCHINCHI DIZAYN TILI va bu ATAYLAB. Uchalasi uch xil JANR:
 *
 *   Ta'lim / Moliya  — OYLIK HISOBOT. Oq karta, ingichka chegara
 *                      (`ring-1`), teng 3×3 to'r: hamma blok bir xil
 *                      og'irlikda, chunki hisobotda ustuvorlik yo'q.
 *   Inventar (Atlas) — BAZANING HOLATI. Chegarasiz sirt, bento to'r,
 *                      to'q hero: ekranda bitta og'irlik markazi bor.
 *   Faollik (Puls)   — JONLI SIGNAL. Bu ikkalasidan ham farq qiladi:
 *                      u "o'tgan oy qanday edi" ni emas, "HOZIR
 *                      qanday" ni ko'rsatadi.
 *
 * "Jonli signal" janridan uchta qaror kelib chiqadi:
 *
 *   1. CHEGARA O'RNIGA SIGNAL RELSI. Kartaning chap qirrasida 3px
 *      rangli chiziq turadi va u KARTANING HOLATINI kodlaydi (yashil —
 *      yaxshi, sariq — e'tibor, kulrang — neytral). Ilgari bu ma'no
 *      faqat raqamda edi va ekranga bir qarashda "qayerda muammo bor"
 *      degan savolga javob yo'q edi. To'liq chegara esa (Atlas
 *      izohidagi sabab) o'n ikkita kontur chizib, ekranni jadvalga
 *      aylantirardi.
 *
 *   2. VAQT — ASOSIY O'Q. Faollikning butun mazmuni "qachon va necha
 *      marta". Shu sababli ekranning markazida issiqlik xaritasi
 *      (soat × hafta kuni) turadi, doiraviy diagramma emas: doira
 *      "ulush" ni ko'rsatadi, bu yerda esa savol RITM haqida.
 *
 *   3. "HOZIR" BELGISI. Hero'da jonli nuqta bor va u nafas oladi
 *      (`pulse-ring`) — ekranda faqat SHU bitta doimiy harakat.
 *      Ikkinchisi qo'shilsa, ular bir-biri bilan raqobatlashib,
 *      "reklama banneri" ta'sirini berardi.
 *
 * ⚠️ RANG SIYOSATI. Atlasda teal (mulk), moliyada ko'k (pul), bu yerda
 * esa VIOLET — jalb qilinganlik. Uchtasi bir-biriga o'xshamasligi
 * kerak: foydalanuvchi qaysi bo'limda ekanini rangdan biladi.
 */

/* ─────────────────────── RANG TIZIMI ─────────────────────── */

/**
 * BESHTA SIGNAL. Har rang bitta MA'NOGA biriktirilgan va ekran bo'ylab
 * o'zgarmaydi.
 *
 *   violet  — FAOLLIK (asosiy o'lchov, bot qamrovi)
 *   sky     — PANEL (xodimlar, ichki foydalanish)
 *   emerald — YAXSHI (faol, bog'langan, yetkazilgan)
 *   amber   — E'TIBOR (jim turgan, bog'lanmagan)
 *   slate   — NEYTRAL (fon, o'lchov, kontekst)
 *
 * ⚠️ Diagramma ranglari HEX bilan beriladi (recharts SVG atributiga
 * boradi, Tailwind sinfi u yerga yetib bormaydi), UI ranglari esa
 * sinf bilan. Ikkalasi bitta faylda — aks holda diagrammadagi violet
 * bilan yorliqdagi violet asta-sekin bir-biridan uzoqlashardi.
 */
export const HUE = {
  bot: "#7C3AED", // violet-600 — bot faolligi
  botSoft: "#C4B5FD", // violet-300
  panel: "#0284C7", // sky-600 — panel faolligi
  panelSoft: "#7DD3FC", // sky-300
  good: "#059669", // emerald-600
  goodSoft: "#6EE7B7", // emerald-300
  warn: "#D97706", // amber-600
  warnSoft: "#FCD34D", // amber-300
  neutral: "#64748B", // slate-500
  neutralSoft: "#CBD5E1", // slate-300
  grid: "#E9EAEF", // diagramma to'ri
  axis: "#94A3B8", // o'q yozuvlari
};

/**
 * ISSIQLIK XARITASI SHKALASI — nol → maksimum.
 *
 * ⚠️ Kamalak EMAS: bitta ohangning (violet) beshta pog'onasi. Qiymatlar
 * TARTIBLI (kam → ko'p), ya'ni ranglar ham tartibli bo'lishi shart.
 * Turli ohanglar "har katakcha boshqa narsa" deb yolg'on aytardi.
 *
 * ⚠️ Nol uchun alohida, deyarli ko'rinmas rang: bo'sh katakcha "kam"
 * emas, "umuman yo'q" degani va u shkalaning eng past pog'onasi bilan
 * bir xil ko'rinmasligi kerak.
 */
export const HEAT = ["#F1F3F7", "#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#6D28D9"];

/**
 * Qiymatni shkala pog'onasiga soladi.
 *
 * @param {number} value
 * @param {number} max
 * @returns {string} - hex rang
 */
export const heatColor = (value, max) => {
  if (!value || value <= 0) return HEAT[0];
  if (!max || max <= 0) return HEAT[0];
  const step = Math.ceil((value / max) * (HEAT.length - 1));
  return HEAT[Math.min(step, HEAT.length - 1)];
};

/* ─────────────────────── SIRTLAR ─────────────────────── */

export const SURFACE = {
  /**
   * KARTA — chegarasiz, signal relsi bilan.
   *
   * ⚠️ `ring-1` YO'Q (Atlas izohidagi sabab). Ajratuvchi: oq sirt +
   * ikki qatlamli soya. Chap qirradagi rangli chiziq esa `railClass`
   * bilan qo'shiladi va u BEZAK EMAS — kartaning holatini kodlaydi.
   */
  card:
    "relative overflow-hidden bg-white rounded-[18px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.13)] " +
    "transition-[box-shadow,transform] duration-300 ease-out-quint",

  /** Bosiladigan karta — hover'da ko'tariladi. */
  cardHover:
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_38px_-18px_rgba(15,23,42,0.19)] " +
    "motion-safe:hover:-translate-y-0.5",

  /**
   * HERO — "hozir" bloki. Atlasning grafit gradientidan FARQLI:
   * bu yerda binafsha-siyoh ohang, chunki hero faollikni ko'rsatadi
   * va u bo'lim rangi bilan bir xil oilada bo'lishi kerak.
   */
  hero:
    "relative overflow-hidden rounded-[18px] " +
    "bg-[linear-gradient(150deg,#1B1533_0%,#2A1F52_45%,#151024_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.20),0_22px_54px_-24px_rgba(49,26,110,0.55)]",

  /** Hero fonidagi binafsha nur — sekin siljiydi. */
  heroGlow:
    "pointer-events-none absolute -right-20 -top-24 size-[380px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(139,92,246,0.28)_0%,transparent_68%)] " +
    "motion-safe:animate-drift",

  /** Ikkinchi nur — pastki chapda, sovuqroq. */
  heroGlowAlt:
    "pointer-events-none absolute -bottom-28 -left-16 size-[320px] rounded-full " +
    "bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,transparent_70%)]",

  /** Ichki plitka — oq kartada. Chegara emas, FON bilan ajraladi. */
  tile: "rounded-2xl bg-slate-50/80 transition-colors duration-300 ease-out-quint",
  tileHover: "hover:bg-slate-100/80",

  /** To'q sirt ichidagi plitka. */
  tileDark: "rounded-2xl bg-white/[0.055] transition-colors duration-300 ease-out-quint",

  /** Progress relsi. */
  track: "bg-slate-100",
  trackDark: "bg-white/10",
};

/**
 * SIGNAL RELSI — kartaning chap qirrasidagi 3px chiziq.
 *
 * ⚠️ RANG YAGONA BELGI EMAS: rels faqat kartaning sarlavhasidagi
 * matn bilan BIRGA ma'no beradi ("Jim turganlar — 12"). Rangni ajrata
 * olmaydigan ko'z uchun raqamning o'zi yetarli bo'lib qoladi.
 */
export const RAIL = {
  base: "absolute inset-y-0 left-0 w-[3px]",
  tone: {
    bot: "bg-violet-500",
    panel: "bg-sky-500",
    good: "bg-emerald-500",
    warn: "bg-amber-500",
    neutral: "bg-slate-300",
    link: "bg-indigo-400",
    alert: "bg-rose-500",
    session: "bg-sky-500",
    device: "bg-slate-400",
  },
};

/* ─────────────────────── TIPOGRAFIYA ─────────────────────── */

/**
 * BESH DARAJA — har biri O'LCHAM + VAZN + RANG uchtasi bilan birdan
 * ajraladi, komponent ichida qo'lda yozilgan tipografiya qolmaydi.
 *
 * Raqamlar `font-semibold` va `tabular-nums`: ustundagi raqamlar
 * bir-birining ostiga to'g'ri tushishi kerak, aks holda ro'yxat
 * "sakrab" ko'rinadi.
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

  /** Jadval — chiziqsiz, qatorlar hover foni bilan ajraladi. */
  th: "text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400",
  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-medium text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",
  row: "transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",

  /** Texnik ma'lumot (IP, qurilma) — mono, chunki u O'QILMAYDI, TAQQOSLANADI. */
  mono: "font-mono text-[11px] tracking-tight text-slate-500",
};

/* ─────────────────────── CHIP VA DELTA ─────────────────────── */

/** Holat yorlig'i — bir xil shakl, olti ohang. */
export const CHIP = {
  base: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
  tone: {
    bot: "bg-violet-50 text-violet-700",
    panel: "bg-sky-50 text-sky-700",
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    neutral: "bg-slate-100 text-slate-600",
    link: "bg-indigo-50 text-indigo-700",
    alert: "bg-rose-50 text-rose-700",
  },
  toneDark: {
    bot: "bg-violet-400/15 text-violet-200",
    good: "bg-emerald-400/15 text-emerald-200",
    warn: "bg-amber-400/15 text-amber-200",
    neutral: "bg-white/10 text-white/70",
  },
};

/**
 * O'ZGARISH KO'RSATKICHI.
 *
 * ⚠️ Rang YAGONA belgi emas: ishora (↑/↓) ham o'zgaradi. "Yaxshi"
 * yo'nalish ko'rsatkichga BOG'LIQ (jim turganlar o'sishi yomon,
 * qamrov o'sishi yaxshi), shuning uchun uni KOMPONENT hal qiladi —
 * token faqat ko'rinishni beradi.
 */
export const DELTA = {
  chip:
    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 " +
    "text-[10px] font-semibold tabular-nums leading-none",
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  flat: "text-slate-500 bg-slate-100",
  upDark: "text-emerald-300 bg-emerald-400/12",
  downDark: "text-rose-300 bg-rose-400/12",
  flatDark: "text-white/55 bg-white/8",
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

/**
 * XOREOGRAFIYA: hero → ko'rsatkichlar → to'r, yuqoridan pastga.
 * Blok BO'SH kiradi (`wake`), kontenti undan `content` ms keyin to'ladi.
 * Hammasi `motion-safe:` — `prefers-reduced-motion` da darhol ko'rinadi.
 */
export const MOTION = {
  enter: "motion-safe:animate-wake",
  enterUp: "motion-safe:animate-wake-up",
  sweep: "origin-left motion-safe:animate-sweep",
  tick: "motion-safe:animate-tick-in",

  /** "Hozir" belgisi — nafas oluvchi halqa bilan. */
  liveDot: "relative flex size-2 items-center justify-center",
  liveCore: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-pulse-ring",
};

/** Xoreografiya vaqtlari (ms). */
export const DELAY = {
  header: 0,
  hero: 70,
  metricStart: 170,
  metricStep: 38,
  gridStart: 320,
  gridStep: 65,
  /** Blok kirgandan keyin kontent. */
  content: 170,
  /** Ro'yxat qatorlari orasidagi qadam. */
  rowStep: 42,
};

export const metricDelay = (i) => DELAY.metricStart + i * DELAY.metricStep;
export const gridDelay = (i) => DELAY.gridStart + i * DELAY.gridStep;
export const contentDelay = (blockDelay, i = 0) =>
  blockDelay + DELAY.content + i * DELAY.rowStep;

/* ─────────────────────── YORDAMCHILAR ─────────────────────── */

/** Hafta kunlarining qisqa nomlari — 0 = yakshanba (PostgreSQL DOW). */
export const WEEKDAYS_SHORT = ["Yak", "Du", "Se", "Cho", "Pay", "Ju", "Sha"];

/**
 * Foizni ko'rsatish uchun matn. `null`/`undefined` → em-dash.
 *
 * @param {number|null} value
 * @returns {string}
 */
export const pct = (value) =>
  value == null || Number.isNaN(value) ? "—" : `${value}%`;
