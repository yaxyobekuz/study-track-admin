/**
 * "GUARD" — QURILMA NAZORATI BO'LIMINING DIZAYN TILI (YAGONA MANBA).
 *
 * ⚠️ OLTINCHI MUSTAQIL TIL EMAS. Tizimda allaqachon beshta bor (hisobot /
 * Atlas / Puls / Sentinel / Ledger). Guard ham qolganlari kabi karta
 * qobig'ini, tipografiya shkalasini va xoreografiya vaqtlarini MEROS
 * OLADI — farq faqat ikki narsada, chunki bu ikkisi bo'limning MA'NOSI:
 *
 *   1. RANG O'QI — RUXSAT DARAJASI. Sentinelda rang "qanchalik jiddiy"
 *      ni, Ledgerda "pul qaysi bosqichda" ni bildiradi. Bu yerda esa
 *      "ilova qanchalik ochiq":
 *
 *          doim ochiq → ruxsat etilgan → chegaralangan → yopiq
 *          emerald      sky              amber           slate
 *
 *      ⚠️ YOPIQ — SLATE, QIZIL EMAS va bu ataylab. Bloklangan ilova
 *      XAVF emas, u shunchaki yopiq. Qizil bu ekranda bitta narsaga
 *      sarflanadi: HIMOYA O'CHIRILGAN holatiga (§ HEALTH) — ya'ni
 *      qoida bor-u, telefonda ishlamayotganiga. Agar har bloklangan
 *      ilova qizil bo'lsa, aynan shu bitta muhim signal ko'rinmay
 *      qolardi.
 *
 *   2. HERO — QALQON, KUZATUV PANELI EMAS. Sentinelning hero'si
 *      deyarli qora grafit va ustidan kuzatuv chizig'i o'tadi ("kim
 *      kirdi?"). Bu yerda savol boshqa: "himoya turibdimi?". Shuning
 *      uchun sirt to'q ko'k-siyoh (#0C1425) va uning ustida sekin
 *      nafas oladigan halqa — kuzatish emas, HIMOYA ohangi.
 *
 * ⚠️ YANGI OHANG QO'SHMANG. Teal — inventar, binafsha — faollik,
 * atirgul — xavfsizlik va zarar, yashil — kirim, qizil — chiqim.
 * Guard ATAYLAB uchta ohang bilan cheklangan: emerald / sky / amber,
 * qolgani slate.
 *
 * ⚠️ VAQT RAQAMI SERVERDAN KELADI. Bu yerdagi hech bir yordamchi
 * daqiqani chegara bilan solishtirmaydi va "qoldi" ni hisoblamaydi:
 * u hisob `devicePolicy.helpers.js` da, serverda. Frontendda ikkinchi
 * nusxa bo'lsa, panel bir raqam, telefon boshqasini ko'rsatardi.
 */

/* ─────────────────────── RUXSAT DARAJASI ─────────────────────── */

/**
 * ILOVA REJIMLARI — server `DeviceAppMode` enumining ko'zgusi.
 *
 * ⚠️ TARTIB MA'NOLI (`order`): ochiqdan yopiqqa. Ro'yxatlar shu bo'yicha
 * saralanadi — admin siyosatni o'qiganda avval nima ochiq ekanini
 * ko'radi, keyin nima yopiqligini.
 *
 * ⚠️ Har daraja RANG bilan birga YORLIQ ham tashiydi — rangni ajrata
 * olmaydigan ko'z uchun (Sentinel bilan bir xil qoida).
 */
export const MODE = {
  always: {
    key: "always",
    label: "Doim ochiq",
    order: 0,
    hint: "Vaqt oynasidan tashqarida ham ishlaydi",
    chip: "bg-emerald-50 text-emerald-700",
    rail: "bg-emerald-500",
    dot: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    hex: "#059669",
  },
  allowed: {
    key: "allowed",
    label: "Ruxsat etilgan",
    order: 1,
    hint: "Faqat belgilangan vaqt oynasida",
    chip: "bg-sky-50 text-sky-700",
    rail: "bg-sky-500",
    dot: "bg-sky-500",
    icon: "bg-sky-50 text-sky-600",
    hex: "#0284C7",
  },
  limited: {
    key: "limited",
    label: "Chegaralangan",
    order: 2,
    hint: "Kuniga belgilangan daqiqa",
    chip: "bg-amber-50 text-amber-800",
    rail: "bg-amber-500",
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700",
    hex: "#B45309",
  },
  blocked: {
    key: "blocked",
    label: "Yopiq",
    order: 3,
    hint: "Hech qachon ochilmaydi",
    chip: "bg-slate-100 text-slate-600",
    rail: "bg-slate-400",
    dot: "bg-slate-400",
    icon: "bg-slate-100 text-slate-500",
    hex: "#64748B",
  },
};

export const MODE_ORDER = ["always", "allowed", "limited", "blocked"];
export const modeOf = (key) => MODE[key] ?? MODE.blocked;

/* ─────────────────────── QURILMA HOLATI ─────────────────────── */

/**
 * ⚠️ UCH XIL "YOMON" HOLAT AJRATILADI (server `deviceHealth` bilan AYNI
 * kalitlar): oflayn telefon odatda o'zi tuzaladi, HIMOYASI O'CHIRILGANI
 * esa o'z-o'zidan tuzalmaydi va aynan shu e'tibor talab qiladi.
 * Shuning uchun qizil faqat `degraded` da.
 */
export const HEALTH = {
  healthy: {
    key: "healthy",
    label: "Himoyada",
    order: 0,
    chip: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    hex: "#059669",
  },
  degraded: {
    key: "degraded",
    label: "Himoya o'chirilgan",
    order: 1,
    hint: "Telefonda maxsus ruxsat olib qo'yilgan — cheklov ishlamayapti",
    chip: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    hex: "#E11D48",
  },
  offline: {
    key: "offline",
    label: "Oflayn",
    order: 2,
    hint: "Telefon ancha vaqtdan beri ko'rinmadi",
    chip: "bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    hex: "#B45309",
  },
  pending: {
    key: "pending",
    label: "Hali ulanmagan",
    order: 3,
    chip: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    hex: "#64748B",
  },
  paused: {
    key: "paused",
    label: "To'xtatilgan",
    order: 4,
    chip: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    hex: "#94A3B8",
  },
  removed: {
    key: "removed",
    label: "Olib tashlangan",
    order: 5,
    chip: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
    hex: "#CBD5E1",
  },
};

export const healthOf = (key) => HEALTH[key] ?? HEALTH.pending;

/* ─────────────────────── QAMROV ─────────────────────── */

/** Biriktirish qamrovi — server `DevicePolicyScope` ko'zgusi. */
export const SCOPE = {
  student: { key: "student", label: "O'quvchi", order: 0, chip: "bg-indigo-50 text-indigo-700" },
  class: { key: "class", label: "Sinf", order: 1, chip: "bg-sky-50 text-sky-700" },
  school: { key: "school", label: "Butun maktab", order: 2, chip: "bg-slate-100 text-slate-600" },
};

export const scopeOf = (key) => SCOPE[key] ?? SCOPE.school;

/* ─────────────────────── SIRT VA TIPOGRAFIYA ─────────────────────── */

/**
 * ⚠️ CHEGARA CHIZILMAYDI. Ajratish uchun soya, tint va chap signal relsi
 * ishlatiladi (`ledger.tokens.js` va `sentinel.tokens.js` bilan bir xil).
 */
export const SURFACE = {
  card: "relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]",
  inset: "rounded-xl bg-slate-50/80",
  hero: "relative overflow-hidden rounded-2xl bg-[#0C1425] text-white",
  ghost: "rounded-xl ring-1 ring-slate-200/70",
};

export const RAIL = {
  base: "absolute inset-y-0 left-0 w-[3px]",
  draw: "origin-top motion-safe:animate-rail-draw",
  tone: {
    neutral: "bg-slate-200",
    open: "bg-emerald-500",
    allowed: "bg-sky-500",
    limited: "bg-amber-500",
    blocked: "bg-slate-400",
    alert: "bg-rose-500",
  },
};

/** Ikonka pastligi — `Panel` sarlavhasidagi kvadrat. */
export const STAGE = {
  neutral: { icon: "bg-slate-100 text-slate-500" },
  open: { icon: "bg-emerald-50 text-emerald-600" },
  allowed: { icon: "bg-sky-50 text-sky-600" },
  limited: { icon: "bg-amber-50 text-amber-700" },
  blocked: { icon: "bg-slate-100 text-slate-500" },
  alert: { icon: "bg-rose-50 text-rose-600" },
};

/** Tipografiya — besh daraja, Puls/Sentinel/Ledger bilan AYNI shkala. */
export const T = {
  title: "text-[13px] font-semibold tracking-[-0.01em] text-slate-900",
  hint: "text-[11.5px] leading-snug text-slate-400",
  metric: "text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-slate-900",
  metricSm: "text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-slate-900",
  label: "text-[11px] font-medium uppercase tracking-[0.07em] text-slate-400",

  th: "text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400",
  td: "text-[12.5px] text-slate-600",
  tdName: "text-[12.5px] font-medium text-slate-900",
  tdNum: "text-[12.5px] font-semibold tabular-nums text-slate-900",
  row: "transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",

  mono: "font-mono text-[11px] tracking-tight text-slate-500",
};

/** Kichik yorliq (chip) — bitta shakl, rang tokendan. */
export const CHIP =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
  "text-[10.5px] font-medium leading-none whitespace-nowrap";

/* ─────────────────────── HARAKAT ─────────────────────── */

/**
 * ⚠️ HAMMASI `motion-safe:` ORQALI — `prefers-reduced-motion` yoqilganda
 * ekran tinch bo'ladi va hech qanday ma'lumot yo'qolmaydi: harakat bu
 * yerda hech qachon YAGONA signal emas.
 *
 * ⚠️ HIMOYA O'CHIRILGAN QATOR CHAQNAMAYDI. Jiddiylik rang va vazn bilan
 * beriladi: chaqnayotgan qatorlar ro'yxatni o'qib bo'lmas holga
 * keltirardi (`sentinel.tokens.js` bilan bir xil qoida).
 */
export const MOTION = {
  enter: "motion-safe:animate-post",
  rail: "motion-safe:animate-rail-draw",
  bar: "origin-left motion-safe:animate-grow-x",
  tide: "bg-[length:220%_220%] motion-safe:animate-tide",

  liveDot: "relative flex size-2 items-center justify-center",
  liveCore: "size-1.5 rounded-full bg-emerald-400",
  liveRing:
    "absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-pulse-ring",
};

/** Xoreografiya — boshqa bo'limlar bilan AYNI vaqtlar. */
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
export const rowDelay = (i) => DELAY.content + Math.min(i, 14) * DELAY.rowStep;
