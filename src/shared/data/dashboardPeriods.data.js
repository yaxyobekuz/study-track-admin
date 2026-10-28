/**
 * BOSH SAHIFADAGI DAVR TANLAGICHI — "Kunlik / Haftalik / Oylik / Yillik".
 *
 * ⚠️ RO'YXAT BITTA JOYDA. Bosh sahifada bir nechta karta yonma-yon turadi
 * (xodimlar topshiriqlari, o'quvchilar davomati, o'qituvchilar davomati)
 * va ularning tanlagichi bir xil so'zlarni, bir xil ma'noda ko'rsatishi
 * shart: bitta kartada "oylik" oy boshidan bugungacha, ikkinchisida
 * oxirgi 30 kun bo'lsa, ikki raqam yonma-yon turib bir-biriga zid
 * ko'rinardi.
 *
 * ⚠️ CHEGARA SERVERDA hisoblanadi (`helpers/statPeriod.helpers.js`,
 * Toshkent vaqtida) — bu yerdagi `hint` faqat TUSHUNTIRISH matni.
 * Panel sana hisoblamaydi.
 */
export const DASHBOARD_PERIODS = [
  { value: "day", label: "Kunlik", hint: "Bugun" },
  { value: "week", label: "Haftalik", hint: "Dushanbadan bugungacha" },
  { value: "month", label: "Oylik", hint: "Oy boshidan bugungacha" },
  { value: "year", label: "Yillik", hint: "Yil boshidan bugungacha" },
];

/** Tanlangan davr yoki sukut (oylik) — ro'yxatdan tashqari qiymat kelsa. */
export const periodOf = (value) =>
  DASHBOARD_PERIODS.find((item) => item.value === value) || DASHBOARD_PERIODS[2];

/**
 * HUJJATDAGI FOIZ — "94,3%" (kasr VERGUL bilan, har doim bitta xona).
 *
 * ⚠️ Boshqaruv ekranlaridagi `percentText` dan ATAYLAB farq qiladi:
 * ekrandagi hujjat Word faylidagi raqam bilan belgima belgi bir xil
 * bo'lishi shart (`attendanceStatsExport.service.js` dagi AYNI qoida).
 */
export const docPercentText = (value) =>
  value == null ? "—" : `${Math.abs(value).toFixed(1).replace(".", ",")}%`;

/**
 * ⚠️ MINUS BELGISI — U+2212 (`−`), defis EMAS: hisobotda "−8" defis bilan
 * yozilsa, u qator boshida tire bo'lib ko'rinadi.
 */
export const MINUS = "−";

/**
 * Minglik ajratgich — "32 611" (UZILMAS bo'shliq bilan).
 *
 * ⚠️ `toLocaleString` ISHLATILMAYDI: ajratgich brauzer locale'iga bog'liq
 * bo'lib qoladi va serverdagi Word nusxasi bilan farq qilardi
 * (`dates.md` §3 bilan AYNI sabab).
 */
export const groupedText = (value) =>
  String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");

/** Ishorali son: "+12" / "−8" / "0". */
export const signedText = (value) => {
  const number = Number(value) || 0;
  if (number > 0) return `+${groupedText(number)}`;
  if (number < 0) return `${MINUS}${groupedText(Math.abs(number))}`;
  return "0";
};

/**
 * FOIZ FARQI — PUNKTDA: "94% dan 96% ga" o'sish 2 punkt, 2,1% EMAS.
 * Foizning foizi rahbarni chalg'itardi.
 */
export const pointsText = (value, { withUnit = true } = {}) => {
  if (value == null) return "—";
  const abs = Math.abs(value).toFixed(1).replace(".", ",");
  const unit = withUnit ? " punkt" : "";
  if (value > 0) return `+${abs}${unit}`;
  if (value < 0) return `${MINUS}${abs}${unit}`;
  return `0,0${unit}`;
};

/** O'sish — yashil, tushish — qizil, o'zgarmagani — kulrang. */
export const toneOfChange = (value) =>
  value > 0 ? "text-emerald-600" : value < 0 ? "text-red-500" : "text-gray-400";
