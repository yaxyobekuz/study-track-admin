/**
 * QURILMA NAZORATI — STATIK MA'LUMOT.
 *
 * ⚠️ Tablar, yorliqlar, hafta kunlari va tayyor shablonlar komponent
 * ichida yozilmaydi: bir xil ro'yxat ikki joyda paydo bo'lsa, biri
 * o'zgarib ikkinchisi eskirardi (`lessonHours.data.js` bilan bir xil
 * qoida).
 *
 * ⚠️ SERVER BILAN BIR XIL MATN. Yorliqlar server yuboradigan xabarlar
 * bilan mos bo'lishi kerak: bir ekranda "Himoya o'chirilgan", boshqasida
 * "Ruxsat yo'q" chiqsa, foydalanuvchi ikki xil muammo bor deb o'ylardi.
 */

/* ─────────────────────── TABLAR ─────────────────────── */

/**
 * ⚠️ TARTIB — SAVOL TARTIBI: "hammasi joyidami?" → "kimda nima?" →
 * "qoida qanday?" → "qaysi ilovalar?" → "qancha vaqt sarflandi?" →
 * "sozlama". Yon menyudagi tartib ham AYNI shunday: ikki joyda boshqacha
 * bo'lsa, foydalanuvchi har safar qidirib yurardi.
 */
export const DEVICE_TABS = [
  {
    to: "/devices/overview",
    label: "Umumiy",
    title: "Qurilma nazorati",
    can: "devices.view",
  },
  {
    to: "/devices/list",
    label: "Qurilmalar",
    title: "Qurilma nazorati",
    can: "devices.view",
  },
  {
    to: "/devices/policies",
    label: "Siyosatlar",
    title: "Qurilma nazorati",
    can: "devices.view",
  },
  {
    // Vaqtinchalik ruxsatlar registri + o'zgarishlar tarixi.
    // ⚠️ Ko'rish `view` bilan, BEKOR QILISH esa `devices.unlock` bilan:
    // ro'yxatni ko'rish va chekovni qaytarish boshqa-boshqa qaror.
    to: "/devices/unlocks",
    label: "Ruxsatlar",
    title: "Qurilma nazorati",
    can: "devices.view",
  },
  {
    to: "/devices/apps",
    label: "Ilovalar",
    title: "Qurilma nazorati",
    can: "devices.apps",
  },
  {
    // ⚠️ Alohida ruxsat: bolaning qaysi ilovada qancha o'tirgani
    // shaxsiy ma'lumot (`devices.md` §8).
    to: "/devices/reports",
    label: "Hisobot",
    title: "Qurilma nazorati",
    can: "devices.reports",
  },
  {
    to: "/devices/settings",
    label: "Sozlamalar",
    title: "Qurilma nazorati",
    can: "devices.settings",
  },
];

/* ─────────────────────── HAFTA KUNLARI ─────────────────────── */

/**
 * ⚠️ INDEKS = JS `getDay()` va serverdagi `weekday` bilan AYNI
 * (0 = yakshanba). Yangi tartib kiritilsa, oyna boshqa kunga ko'chib
 * ketardi va buni faqat ota-ona shikoyat qilgach bilardik.
 *
 * ⚠️ Ro'yxat DUSHANBADAN boshlab ko'rsatiladi (`WEEK_ORDER`) — o'zbek
 * kalendarida hafta shundan boshlanadi — lekin QIYMAT baribir indeks.
 */
export const WEEKDAYS = [
  { value: 0, label: "Yakshanba", short: "Yak" },
  { value: 1, label: "Dushanba", short: "Du" },
  { value: 2, label: "Seshanba", short: "Se" },
  { value: 3, label: "Chorshanba", short: "Cho" },
  { value: 4, label: "Payshanba", short: "Pay" },
  { value: 5, label: "Juma", short: "Ju" },
  { value: 6, label: "Shanba", short: "Sha" },
];

/** Ko'rsatish tartibi: dushanbadan yakshanbagacha. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const weekdayLabel = (value) =>
  WEEKDAYS.find((d) => d.value === value)?.label || "—";
export const weekdayShort = (value) =>
  WEEKDAYS.find((d) => d.value === value)?.short || "—";

/* ─────────────────────── KATALOG ─────────────────────── */

/** Server `deviceApp.service.js` dagi `CATEGORIES` ning ko'zgusi. */
export const APP_CATEGORIES = [
  { value: "ta'lim", label: "Ta'lim" },
  { value: "ijtimoiy", label: "Ijtimoiy tarmoq" },
  { value: "video", label: "Video" },
  { value: "o'yin", label: "O'yin" },
  { value: "xabar", label: "Xabar almashish" },
  { value: "brauzer", label: "Brauzer" },
  { value: "tizim", label: "Tizim" },
  { value: "boshqa", label: "Boshqa" },
];

export const categoryLabel = (value) =>
  APP_CATEGORIES.find((c) => c.value === value)?.label || "Boshqa";

/* ─────────────────────── SIYOSAT ─────────────────────── */

export const DEFAULT_MODES = [
  {
    value: "block",
    label: "Oq ro'yxat",
    hint: "Faqat quyida sanalgan ilovalar ishlaydi, qolgani yopiq",
  },
  {
    value: "allow",
    label: "Qora ro'yxat",
    hint: "Faqat quyida sanalgan ilovalar yopiq, qolgani ochiq",
  },
];

export const OFFLINE_POLICIES = [
  {
    value: "keepLast",
    label: "Oxirgi qoida qoladi",
    hint: "Internet yo'qolsa telefon avvalgi qoida bilan ishlashda davom etadi",
  },
  {
    value: "lockDown",
    label: "Faqat majburiy ilovalar",
    hint: "Internet yo'qolsa faqat qo'ng'iroq va MBSI ilovasi ochiq qoladi",
  },
];

/**
 * TAYYOR SHABLONLAR — bo'sh muharrirdan boshlash o'rniga.
 *
 * ⚠️ Shablon FAQAT VAQT OYNASINI beradi, ilovalarni EMAS: qaysi ilova
 * ruxsat etilishi har maktabning o'z qarori va uni taxmin qilish
 * noto'g'ri bo'lardi. Ilovani admin o'zi tanlaydi.
 */
export const POLICY_PRESETS = [
  {
    key: "lesson",
    name: "Dars vaqti",
    description: "Dars kunlari kunduzi telefon yopiq, kechqurun ochiq",
    windows: [1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      start: "16:00",
      end: "21:00",
    })),
  },
  {
    key: "evening",
    name: "Kechki tinchlik",
    description: "Har kuni faqat 09:00–21:00 oralig'ida ishlaydi",
    windows: WEEK_ORDER.map((weekday) => ({ weekday, start: "09:00", end: "21:00" })),
  },
  {
    key: "exam",
    name: "Imtihon rejimi",
    description: "Vaqt oynasi yo'q — faqat ruxsat etilgan ilovalar",
    windows: [],
  },
];

/* ─────────────────────── AUDIT ─────────────────────── */

/** Server `deviceAudit.service.js` dagi `ACTIONS` ning yorliqlari. */
export const AUDIT_LABELS = {
  "policy.create": "Siyosat yaratildi",
  "policy.update": "Siyosat tahrirlandi",
  "policy.archive": "Siyosat arxivlandi",
  "assignment.set": "Siyosat biriktirildi",
  "assignment.clear": "Biriktirish olib tashlandi",
  "device.enroll": "Qurilma biriktirildi",
  "device.pause": "Cheklov to'xtatildi",
  "device.resume": "Cheklov yoqildi",
  "device.remove": "Qurilma olib tashlandi",
  "code.issue": "Biriktirish kodi berildi",
  "unlock.create": "Vaqtinchalik ruxsat",
  "unlock.cancel": "Ruxsat bekor qilindi",
  "app.upsert": "Ilova katalogi",
  "settings.update": "Sozlama o'zgardi",
};

export const auditLabel = (action) => AUDIT_LABELS[action] || action;

/** Audit registridagi amal filtri. */
export const AUDIT_FILTERS = [
  { value: "all", label: "Barcha amallar" },
  ...Object.entries(AUDIT_LABELS).map(([value, label]) => ({ value, label })),
];

/* ─────────────────────── FORMATLASH ─────────────────────── */

/**
 * Daqiqa → "2 s 15 daq".
 *
 * ⚠️ Sana/vaqt FORMATI emas — bu DAVOMIYLIK, shuning uchun
 * `date.utils.js` ga tegishli emas (u instant va kun bilan ishlaydi).
 * Server ham aynan shu shaklni yuboradi (`humanMinutes`), bu yerda esa
 * mijoz tomonida hisoblangan qiymatlar uchun.
 */
export const formatMinutes = (minutes) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  if (total === 0) return "0 daq";
  if (total < 60) return `${total} daq`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} s` : `${hours} s ${rest} daq`;
};

/** "08:30" ko'rinishidagi vaqtni tekshiradi (oyna muharriri uchun). */
export const isValidClock = (value) => /^([01]\d|2[0-4]):([0-5]\d)$/.test(String(value || ""));

/** Vaqtinchalik ochish uchun tayyor davomiyliklar. */
export const UNLOCK_DURATIONS = [
  { value: 30, label: "30 daqiqa" },
  { value: 60, label: "1 soat" },
  { value: 120, label: "2 soat" },
  { value: 180, label: "3 soat" },
  { value: 360, label: "6 soat" },
  { value: 720, label: "12 soat" },
  // ⚠️ 24 soatdan uzun variant YO'Q: server ham rad etadi
  // (`MAX_UNLOCK_HOURS`). Ro'yxatda turib server rad etsa, bu
  // "tizim buzuq" bo'lib ko'rinardi.
  { value: 1440, label: "24 soat (eng ko'pi)" },
];

/**
 * QURILMALAR RO'YXATIDAGI YAGONA HOLAT FILTRI.
 *
 * ⚠️ ILGARI IKKITA EDI ("holat" va "status") va ular bir-birini inkor
 * qilishi mumkin edi: "Faol" + "To'xtatilgan" tanlansa ro'yxat bo'sh
 * chiqardi va foydalanuvchi buni tizim nosozligi deb o'ylardi. Endi
 * bitta ro'yxat — server ham aynan shu kalitlarni SQL shartiga
 * aylantiradi (`healthWhere`).
 *
 * ⚠️ Sukut (`""`) — olib tashlanganlardan boshqa hammasi: to'xtatilgan
 * qurilma ro'yxatdan jimgina yo'qolmasligi kerak.
 */
export const HEALTH_FILTERS = [
  { value: "", label: "Faol qurilmalar" },
  { value: "healthy", label: "Himoyada" },
  { value: "degraded", label: "Himoya o'chirilgan" },
  { value: "offline", label: "Oflayn" },
  { value: "pending", label: "Hali ulanmagan" },
  { value: "paused", label: "To'xtatilgan" },
  { value: "removed", label: "Olib tashlangan" },
  { value: "all", label: "Barchasi" },
];

/** Vaqtinchalik ruxsatlar registri filtri. */
export const UNLOCK_FILTERS = [
  { value: "live", label: "Hozir amalda" },
  { value: "active", label: "Bekor qilinmagan" },
  { value: "cancelled", label: "Bekor qilingan" },
  { value: "expired", label: "Muddati tugagan" },
  { value: "all", label: "Barchasi" },
];

/** Hisobot oynasi. */
export const RANGE_OPTIONS = [
  { value: "7", label: "7 kun" },
  { value: "14", label: "14 kun" },
  { value: "30", label: "30 kun" },
  { value: "90", label: "90 kun" },
];
