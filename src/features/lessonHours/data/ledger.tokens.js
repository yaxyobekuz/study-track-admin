/**
 * "LEDGER" — DARS SOATI VA MAOSH BO'LIMINING DIZAYN TILI (YAGONA MANBA).
 *
 * ⚠️ BESHINCHI MUSTAQIL TIL EMAS. Tizimda allaqachon to'rtta bor
 * (hisobot / Atlas / Puls / Sentinel) va har biri o'z RANG O'QI bilan
 * ajraladi, shakl bilan emas. Ledger ham xuddi shunday: karta qobig'i,
 * tipografiya shkalasi va xoreografiya vaqtlari Puls/Sentineldan MEROS,
 * farq esa faqat ikki narsada — chunki bu ikkisi bo'limning MA'NOSI:
 *
 *   1. RANG O'QI — HISOB-KITOB BOSQICHI, toifa ham, jiddiylik ham emas.
 *      Bu bo'limda savol "qanchalik yomon" emas, "pul qaysi bosqichda":
 *
 *          jadval  →  o'tildi  →  hisoblandi  →  muhrlandi  →  to'landi
 *          slate      indigo     brass          graphite      emerald
 *
 *      Sentinel qizildan ko'kka (issiqdan sovuqqa) tushadi; Ledger esa
 *      neytraldan yashilga QARAB O'SADI. Bu ataylab: registrda hech
 *      narsa "xavfli" emas, narsalar shunchaki tugallanadi.
 *
 *   2. HERO — REGISTR SARLAVHASI. Atlasnikidan ko'kroq, Sentinelnikidan
 *      iliqroq siyoh (#0B1220): ekran hisobot emas, DAFTAR.
 *
 * ⚠️ RANG QO'SHMANG. Har issiq va sovuq ohang allaqachon band: teal —
 * inventar, binafsha — faollik, atirgul — xavfsizlik va zarar, yashil —
 * kirim, qizil — chiqim. Yangi ohang beshtasi bilan to'qnashardi.
 * Ledger ATAYLAB NEYTRAL: rang faqat uchta holatga sarflanadi.
 *
 * ⚠️ CHEGARA CHIZILMAYDI. Ajratish uchun soya, tint va chap signal relsi
 * ishlatiladi. `ring-1` o'nta blokka qo'yilsa, ekran "jadval ustidagi
 * jadval" bo'lardi (`atlas.tokens.js` sarlavhasi).
 *
 * ⚠️ RAQAM SERVERDAN KELADI. Bu yerdagi hech bir yordamchi pul
 * hisoblamaydi: summa `Decimal(14,2)` va API'da STRING. `Number` ga
 * aylantirib qo'shish katta summalarda aniqlikni yo'qotardi.
 */

/* ─────────────────────── RANG TIZIMI ─────────────────────── */

/**
 * HISOB-KITOB BOSQICHLARI — tartibli, beshta.
 *
 * ⚠️ TARTIB MA'NOLI va u vaqt tartibi: dars jadvalda turadi → o'tiladi →
 * pul hisoblanadi → majburiyat muhrlanadi → to'lanadi. Har bosqichda
 * RANG BILAN BIRGA YORLIQ ham bor — rangni ajrata olmaydigan ko'z uchun.
 */
export const STAGE = {
  planned: {
    key: "planned",
    label: "Rejalashtirilgan",
    order: 0,
    chip: "bg-slate-100 text-slate-600",
    rail: "bg-slate-300",
    dot: "bg-slate-400",
    icon: "bg-slate-100 text-slate-500",
    hex: "#94A3B8",
  },
  taught: {
    key: "taught",
    label: "O'tilgan",
    order: 1,
    chip: "bg-indigo-50 text-indigo-700",
    rail: "bg-indigo-500",
    dot: "bg-indigo-500",
    icon: "bg-indigo-50 text-indigo-600",
    hex: "#4F46E5",
  },
  accrued: {
    key: "accrued",
    label: "Hisoblangan",
    order: 2,
    chip: "bg-amber-50 text-amber-800",
    rail: "bg-amber-500",
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700",
    hex: "#B45309",
  },
  sealed: {
    key: "sealed",
    label: "Muhrlangan",
    order: 3,
    chip: "bg-slate-800/8 text-slate-700",
    rail: "bg-slate-600",
    dot: "bg-slate-600",
    icon: "bg-slate-100 text-slate-600",
    hex: "#334155",
  },
  settled: {
    key: "settled",
    label: "To'langan",
    order: 4,
    chip: "bg-emerald-50 text-emerald-700",
    rail: "bg-emerald-500",
    dot: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    hex: "#047857",
  },
};

/**
 * MAOSH REJIMI — server `SalaryType` enumining ko'zgusi.
 *
 * ⚠️ Yorliqlar server bilan BIR XIL matn (`staffSalary.service.js`
 * dagi `TYPE_LABELS`). Ikki xil yozilsa, bir ekranda "Soatbay",
 * boshqasida "Soat bo'yicha" chiqardi.
 */
export const MODE = {
  fixed: {
    key: "fixed",
    label: "Fiksa",
    short: "Fiksa",
    hint: "Oyiga qat'iy summa",
    chip: "bg-slate-100 text-slate-700",
    hex: "#475569",
  },
  hourly: {
    key: "hourly",
    label: "Soatbay",
    short: "Soatbay",
    hint: "Har bir o'tilgan akademik soat uchun",
    chip: "bg-indigo-50 text-indigo-700",
    hex: "#4F46E5",
  },
  mixed: {
    key: "mixed",
    label: "Fiksa + ortiqcha soat",
    short: "Aralash",
    hint: "Bazaviy oylik + normadan ortig'i uchun stavka",
    chip: "bg-amber-50 text-amber-800",
    hex: "#B45309",
  },
};

/**
 * O'RINBOSARLIK YO'NALISHI — kim kimga.
 *
 * Ikki yo'nalish bitta ro'yxatda turadi va ularni FAQAT rang ajratadi:
 * "berdim" (soat ketdi) va "oldim" (soat keldi).
 */
export const FLOW = {
  given: {
    key: "given",
    label: "Berilgan",
    verb: "o'rniga chiqdi",
    chip: "bg-rose-50 text-rose-700",
    rail: "bg-rose-400",
    hex: "#BE123C",
  },
  taken: {
    key: "taken",
    label: "Olingan",
    verb: "o'rniga chiqdim",
    chip: "bg-emerald-50 text-emerald-700",
    rail: "bg-emerald-500",
    hex: "#047857",
  },
};

/** Diagramma ranglari — HEX, chunki Tailwind sinfi SVG atributiga yetmaydi. */
export const HUE = {
  ink: "#0B1220",
  inkMid: "#151E2E",
  line: "#4F46E5",
  lineSoft: "#A5B4FC",
  area: "#4F46E5",
  future: "#CBD5E1",
  grid: "#E2E8F0",
  axis: "#94A3B8",
  accrued: "#B45309",
  settled: "#047857",
  substituted: "#BE123C",
};

/**
 * BITTA OHANGNING QORAYISHI — kategoriya kesimi uchun.
 *
 * ⚠️ Kamalak EMAS. Sinf/fan kesimida odatda 3-6 ta segment bo'ladi va
 * qo'shni pog'onalar KENG ajralishi kerak, aks holda ikkita ustunni
 * farqlab bo'lmaydi (`atlas.tokens.js` dagi `SCALE` bilan bir xil qoida).
 */
export const SCALE = [
  "#312E81",
  "#4338CA",
  "#4F46E5",
  "#6366F1",
  "#818CF8",
  "#A5B4FC",
  "#C7D2FE",
];

/* ─────────────────────── SIRTLAR ─────────────────────── */

export const SURFACE = {
  /**
   * SAHIFA ZAMINI — 3-4% oq'dan pastda.
   *
   * ⚠️ MAJBURIY. Karta chegarasiz va faqat soya bilan ajraladi; oq
   * zaminda esa soya ko'rinmay, karta zamin bilan qo'shilib ketardi.
   */
  page: "bg-[#F4F5F7]",

  /** Karta — Puls/Sentinel bilan bir xil qobiq. */
  card:
    "relative overflow-hidden bg-white rounded-[18px] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.13)] " +
    "transition-[box-shadow,transform] duration-300 ease-out-quint",

  cardHover:
    "hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_38px_-18px_rgba(15,23,42,0.19)] " +
    "motion-safe:hover:-translate-y-0.5",

  /**
   * HERO — REGISTR SARLAVHASI.
   *
   * Uch to'xtamli gradient: tekis to'q rang "qora to'rtburchak" bo'lib
   * o'qilardi, gradient esa chuqurlik beradi. Ustiga ikkita
   * `pointer-events-none` yorug'lik qatlami va bitta sekin `tide`
   * qo'yiladi (`HeroSummary.jsx`).
   */
  hero:
    "relative overflow-hidden rounded-[18px] " +
    "bg-[linear-gradient(150deg,#0B1220_0%,#151E2E_46%,#080D16_100%)] " +
    "shadow-[0_1px_2px_rgba(15,23,42,0.20),0_24px_60px_-24px_rgba(15,23,42,0.55)]",

  /** Hero ichidagi plitka — chegara emas, engil yorug'lik. */
  heroTile: "rounded-2xl bg-white/[0.05] px-4 py-3.5",

  /** Oq karta ichidagi ichki blok — tint, chegara emas. */
  tile: "rounded-2xl bg-slate-50/80 px-4 py-3.5",
  tileHover: "transition-colors duration-200 ease-out-quint hover:bg-slate-100/80",

  /** Ajratgich — chiziq emas, HAVO. Kerak bo'lganda tipografik "rels". */
  rule: "h-px flex-1 bg-slate-200",
};

/**
 * SIGNAL RELSI — konturning o'rnini bosadi va HOLATNI kodlaydi.
 * Bezak emas: shu sababli rang "sarflangan" hisoblanmaydi.
 */
export const RAIL = {
  base: "absolute inset-y-0 left-0 w-[3px] origin-top",
  draw: "motion-safe:animate-rail-draw",
  tone: {
    planned: "bg-slate-300",
    taught: "bg-indigo-500",
    accrued: "bg-amber-500",
    sealed: "bg-slate-600",
    settled: "bg-emerald-500",
    given: "bg-rose-400",
    taken: "bg-emerald-500",
    neutral: "bg-slate-300",
  },
};

/* ─────────────────────── TIPOGRAFIYA ─────────────────────── */

/**
 * ⚠️ PULS/SENTINEL BILAN AYNAN BIR XIL SHKALA — ataylab. Bo'limlar
 * orasida o'tganda matn o'lchami sakramasligi kerak; farq faqat rangda.
 *
 * ⚠️ RAQAMLARDA `tabular-nums` MAJBURIY. Inter'da raqamlar proporsional
 * va ustundagi summalar bir-birining tagiga tushmay qolardi.
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

  /** Formula matni — "1 soat = 60 000 so'm". */
  formula: "font-mono text-[11px] tracking-tight text-slate-500",
  formulaDark: "font-mono text-[11px] tracking-tight text-white/60",
};

/** Kichik yorliq (chip) — bitta shakl, rang tokendan keladi. */
export const CHIP =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
  "text-[10.5px] font-medium leading-none whitespace-nowrap";

/* ─────────────────────── HARAKAT ─────────────────────── */

/**
 * ⚠️ HAMMASI `motion-safe:` ORQALI. `prefers-reduced-motion` yoqilganda
 * ekran butunlay tinch bo'ladi va hech qanday ma'lumot yo'qolmaydi:
 * harakat bu yerda hech qachon YAGONA signal emas.
 */
export const MOTION = {
  enter: "motion-safe:animate-post",
  rail: "motion-safe:animate-rail-draw",
  bar: "origin-left motion-safe:animate-grow-x",
  /** Hero fonidagi sekin suzuvchi yorug'lik (uzluksiz #1). */
  tide: "bg-[length:220%_220%] motion-safe:animate-tide",
  /** Sxema bog'lovchisi (uzluksiz #2). */
  flow: "motion-safe:animate-flow-dash",

  liveDot: "relative flex size-2 items-center justify-center",
  liveCore: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-pulse-ring",
};

/**
 * XOREOGRAFIYA — Puls/Sentinel bilan bir xil vaqtlar.
 *
 * ⚠️ Bloklar BIRVARAKAY chiqmaydi: ko'z avval hero'ni, keyin ko'rsatkich
 * qatorini, keyin gridni o'qiydi. Kechikish shu tartibni beradi.
 */
export const DELAY = {
  header: 0,
  hero: 70,
  metricStart: 170,
  metricStep: 38,
  gridStart: 320,
  gridStep: 65,
  content: 170,
  rowStep: 26,
};

export const metricDelay = (i) => DELAY.metricStart + i * DELAY.metricStep;
export const gridDelay = (i) => DELAY.gridStart + i * DELAY.gridStep;
/** Jadval qatorlari — 14 tadan keyin kechikish to'xtaydi (uzun ro'yxatda kutish). */
export const rowDelay = (i) => DELAY.content + Math.min(i, 14) * DELAY.rowStep;
