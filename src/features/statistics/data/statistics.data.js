// Utils
import { toDateInputValue, formatDateRangeUz } from "@/shared/utils/date.utils";

/**
 * Reyting davrlari va ball chegaralari — BITTA joyda.
 *
 * Kalitlar serverning `STATISTICS_PERIODS` (helpers/statistics.helpers.js)
 * bilan AYNI: "day" | "week" | "month". Server noma'lum kalitni haftalikka
 * tushiradi, panel ham shunday qiladi — ikki tomonda bitta qoida.
 */
export const STATISTICS_PERIODS = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
  // ⚠️ KALENDAR YILI (1-yanvardan), o'quv yili EMAS — bu domenda o'quv
  // yili tushunchasi yo'q. Bosh sahifadagi karta ham shu davrni so'raydi,
  // ya'ni "Batafsil" bosilganda bo'lim AYNI oraliqni ochadi.
  { value: "year", label: "Yillik" },
];

export const DEFAULT_PERIOD = "week";

/** URL'dagi (yoki tashqaridan kelgan) qiymat — noma'lumi haftalik. */
export const resolvePeriod = (value) =>
  STATISTICS_PERIODS.some((p) => p.value === value) ? value : DEFAULT_PERIOD;

/**
 * Ball ranglari ("a'lo / yaxshi / qoniqarli") davrga qarab o'zgaradi.
 *
 * ⚠️ HAFTALIK CHEGARA O'ZGARMAYDI (45 / 35) — u maktabda allaqachon
 * ishlatiladigan o'lchov. Qolganlari O'SHANDAN keltirib chiqarilgan:
 * hafta 6 o'quv kuni (45 ÷ 6 ≈ 8, 35 ÷ 6 ≈ 6), oy 4 hafta
 * (45 × 4 = 180), yil esa ~40 o'quv haftasi — ta'til oylari chiqarilgan
 * (45 × 40 = 1800, 35 × 40 = 1400).
 *
 * ⚠️ Aks holda bitta chegara hamma davrga qo'llanardi: kunlik ro'yxatda
 * hamma "qoniqarli" (bir kunda 35 ball imkonsiz), yillikda esa hamma
 * "a'lo" bo'lib, rang umuman ma'no bermay qolardi.
 */
export const SCORE_THRESHOLDS = {
  day: { high: 8, mid: 6 },
  week: { high: 45, mid: 35 },
  month: { high: 180, mid: 140 },
  year: { high: 1800, mid: 1400 },
};

/** Jadvaldagi ball rangi (legend bilan AYNI chegaradan). */
export const scoreColor = (period, totalSum) => {
  const { high, mid } = SCORE_THRESHOLDS[resolvePeriod(period)];
  if (totalSum >= high) return "text-green-600";
  if (totalSum >= mid) return "text-blue-600";
  return "text-orange-600";
};

/**
 * Legend qatorlari — chegaradan QURILADI, qo'lda yozilmaydi: aks holda
 * chegara o'zgarganda ekrandagi izoh eski raqam bilan qolib ketardi.
 */
export const scoreLegend = (period) => {
  const { high, mid } = SCORE_THRESHOLDS[resolvePeriod(period)];
  return [
    { dot: "bg-green-500", range: `${high}+`, label: "A'lo natija" },
    { dot: "bg-blue-500", range: `${mid}-${high - 1}`, label: "Yaxshi natija" },
    {
      dot: "bg-orange-500",
      range: `${mid} dan past`,
      label: "Qoniqarli natija",
    },
  ];
};

/* ───────────────────────────── ANKOR KUN ───────────────────────────── */

/**
 * Davr qaysi kunga ochilishi — "YYYY-MM-DD" (ISO QIYMAT, format emas:
 * `<input type="date">` va API parametri uchun, `dates.md` §3).
 *
 * ⚠️ Hisob SERVERDA (`getStatisticsPeriodRange`): bu yerda faqat tanlagich
 * uchun kun suriladi. Oraliqning o'zi — dushanba qaysi kun, oy qachon
 * tugaydi, kelajak sanasi bugunga tushishi — hech qachon panelda
 * hisoblanmaydi, aks holda Toshkent va brauzer vaqti boshqa bo'lganda
 * ekranda bir davr, ma'lumotda boshqasi turardi.
 *
 * ⚠️ Kalitlar ketma-ket nolga to'ldirilgan, shuning uchun ularni
 * TAQQOSLASH uchun sanaga aylantirish shart emas: `"2026-10-29" <=
 * "2026-11-01"` matn sifatida ham to'g'ri ishlaydi.
 */

/**
 * "YYYY-MM-DD" → lokal kalendar kuni.
 *
 * ⚠️ `new Date("2026-10-19")` ISHLATILMAYDI: u qiymatni UTC yarim tuni deb
 * o'qiydi va keyingi `getDate()` lokal kunni qaytarib, manfiy ofsetli
 * brauzerda sanani bir kunga siljitardi (`date.utils.js` dagi `toDate`
 * bilan AYNI mulohaza).
 */
const fromDateKey = (key) => {
  const date = new Date(`${String(key || "").slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `<input type="month">` qiymati ("2026-10"). */
export const toMonthValue = (key) => String(key || "").slice(0, 7);

/**
 * Ankor kunni davr bo'yicha suradi: kun ±1 kun, hafta ±7 kun, oy ±1 oy.
 *
 * ⚠️ Oy surilganda kun 1 ga tushiriladi: 31-mart − 1 oy "3-mart" bo'lib
 * qolardi (fevralda 31-kun yo'q) va "oldingi oy" tugmasi foydalanuvchini
 * o'sha oyga qaytarib tashlardi.
 */
export const shiftDateKey = (key, period, step) => {
  const date = fromDateKey(key) || new Date();

  if (period === "month") {
    return toDateInputValue(
      new Date(date.getFullYear(), date.getMonth() + step, 1),
    );
  }

  // Yillik davrda ankor — yilning 1-yanvari: "oldingi davr" butun bir yil
  // orqaga suriladi, kun emas.
  if (period === "year") {
    return toDateInputValue(new Date(date.getFullYear() + step, 0, 1));
  }

  const days = period === "week" ? 7 : 1;
  const next = new Date(date);
  next.setDate(date.getDate() + days * step);
  return toDateInputValue(next);
};

/* ──────────────────────── HAFTA VA YIL TANLOVI ──────────────────────── */

/**
 * Ankor kun tegishli haftaning DUSHANBASI ("YYYY-MM-DD").
 *
 * ⚠️ Serverdagi `mondayOf` bilan AYNI qoida (yakshanba → 6 kun orqaga):
 * tanlagichdagi hafta bilan serverda hisoblanadigan hafta bir xil
 * bo'lishi shart, aks holda ro'yxat tanlangandan boshqa haftani
 * ko'rsatardi.
 */
export const mondayOfKey = (key) => {
  const date = fromDateKey(key);
  if (!date) return "";

  const day = date.getDay(); // 0 = yakshanba
  const back = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - back);
  return toDateInputValue(monday);
};

/** Haftaning yakshanbasi — faqat YORLIQ uchun (oraliqning o'zi serverda). */
const sundayOfKey = (mondayKey) => {
  const monday = fromDateKey(mondayKey);
  if (!monday) return "";

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return toDateInputValue(sunday);
};

/** Tanlagichda nechta hafta turadi (bir yil ortga). */
const WEEK_OPTIONS_COUNT = 53;

/**
 * HAFTA TANLAGICHINING RO'YXATI — "26-oktabr, 2026 — 1-noyabr, 2026".
 *
 * ⚠️ KUN EMAS, HAFTA TANLANADI (biznes qarori, 2026-10-29). Ilgari bu
 * yerda `<input type="date">` turardi: "o'tgan haftani ko'ray" degan odam
 * kalendardan KUN tanlashi kerak edi va qaysi kunni bossa ham o'sha hafta
 * ochilardi — ya'ni tanlov ortiqcha savol berardi. Oylik davrda
 * `<input type="month">` allaqachon shunday ishlaydi.
 *
 * ⚠️ YORLIQ — TO'LIQ HAFTA (dushanba–yakshanba), ya'ni haftaning
 * KIMLIGI. Joriy haftada hisob bugun bilan tugaydi va buni yonidagi
 * oraliq yozuvi aytadi — ikkalasi boshqa savolga javob beradi.
 *
 * @param {string} todayKey - bugungi kun ("YYYY-MM-DD")
 * @param {string} [anchorKey] - tanlangan kun; ro'yxatdan tashqarida
 *   bo'lsa (eski havola) o'z haftasi ham qo'shiladi
 */
export const weekOptions = (todayKey, anchorKey = "") => {
  const current = mondayOfKey(todayKey);
  const options = [];

  for (let i = 0; i < WEEK_OPTIONS_COUNT; i += 1) {
    const monday = fromDateKey(current);
    if (!monday) break;
    monday.setDate(monday.getDate() - i * 7);

    const value = toDateInputValue(monday);
    options.push({ value, label: formatDateRangeUz(value, sundayOfKey(value)) });
  }

  // Eskirgan havola bilan kelingan hafta jim tushib qolmasin
  const anchorMonday = mondayOfKey(anchorKey);
  if (anchorMonday && !options.some((row) => row.value === anchorMonday)) {
    options.push({
      value: anchorMonday,
      label: formatDateRangeUz(anchorMonday, sundayOfKey(anchorMonday)),
    });
  }

  return options;
};

/** Tanlagichda nechta yil turadi. */
const YEAR_OPTIONS_COUNT = 6;

/**
 * YIL TANLAGICHINING RO'YXATI — "2026", "2025", ...
 *
 * Hafta bilan AYNI mulohaza: yillik davrda kalendardan kun tanlash
 * foydalanuvchiga ortiqcha savol berardi.
 */
export const yearOptions = (todayKey, anchorKey = "") => {
  const today = fromDateKey(todayKey) || new Date();
  const years = [];

  for (let i = 0; i < YEAR_OPTIONS_COUNT; i += 1) {
    const year = today.getFullYear() - i;
    years.push({ value: `${year}-01-01`, label: String(year) });
  }

  const anchor = fromDateKey(anchorKey);
  if (anchor && !years.some((row) => row.value.startsWith(String(anchor.getFullYear())))) {
    years.push({
      value: `${anchor.getFullYear()}-01-01`,
      label: String(anchor.getFullYear()),
    });
  }

  return years;
};

/**
 * "Natija yo'q" matni — davr bo'yicha, BITTA joyda.
 *
 * ⚠️ Shart zanjiri emas: yangi davr qo'shilganda (yillik) zanjirning
 * oxiridagi "Joriy haftada..." matni jimgina chiqib qolardi.
 */
export const EMPTY_PERIOD_TEXT = {
  day: "Bugun hech qanday natija topilmadi",
  week: "Joriy haftada hech qanday natija topilmadi",
  month: "Joriy oyda hech qanday natija topilmadi",
  year: "Joriy yilda hech qanday natija topilmadi",
};

/** Tanlagichdagi "joriy davrga qaytish" tugmasining matni. */
export const CURRENT_PERIOD_LABEL = {
  day: "Bugun",
  week: "Bu hafta",
  month: "Bu oy",
  year: "Bu yil",
};
