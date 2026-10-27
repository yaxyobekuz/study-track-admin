/**
 * O'QUVCHILAR HARAKATI hisobotining statik ma'lumotlari.
 *
 * Harakat — o'qish davrining OCHILISHI ("keldi") va YOPILISHI ("ketdi"),
 * ya'ni chiqib ketganlar registri bilan AYNI manba. Shuning uchun bu fayl
 * ham `enrollment` feature'i ichida turadi.
 */

import { currentMonthKey } from "@/shared/helpers/month.helpers";

/**
 * ⚠️ MINUS BELGISI — U+2212 (`−`), defis EMAS. Word hujjatida ham AYNI
 * belgi ishlatiladi (`studentMovementExport.service.js`): ekrandagi raqam
 * fayldagi raqam bilan belgisigacha bir xil bo'lishi kerak.
 */
export const MINUS = "−";

/**
 * Hisobot qamrovi.
 *
 * ⚠️ Sukut — YILLIK: hisobot birinchi ochilishda "bu yil nima bo'ldi"
 * degan savolga javob berishi kerak. Oylik ko'rinish bir bosishda.
 */
export const MOVEMENT_SCOPES = [
  { value: "year", label: "Yillik" },
  { value: "month", label: "Oylik" },
  { value: "range", label: "Oraliq" },
];

export const MOVEMENT_SCOPE_DEFAULT = "year";

/**
 * Yil tanlovi — joriy yildan orqaga.
 *
 * Kelgusi yil ro'yxatda YO'Q: u hali fakt emas va server ham rad etadi
 * (`education.md` §1 — "kelgusi oylar ro'yxatga kirmaydi").
 */
export const buildYearOptions = (count = 6) => {
  const current = Math.trunc(currentMonthKey() / 100);

  return Array.from({ length: count }, (_, index) => {
    const year = current - index;
    return { value: String(year), label: `${year}-yil` };
  });
};

/** "+12" / "−8" / "0" — ishorasi bilan. */
export const signedNumber = (value) => {
  const number = Number(value) || 0;
  if (number > 0) return `+${number}`;
  if (number < 0) return `${MINUS}${Math.abs(number)}`;
  return "0";
};

/**
 * Foiz matni: "+2,7%" / "−1,8%" / "—".
 *
 * ⚠️ `null` — NOL EMAS: davr boshida o'quvchi bo'lmasa, foizning maxraji
 * yo'q. "0%" deb ko'rsatish "o'zgarmadi" degan yolg'on xabar berardi.
 * ⚠️ Kasr ajratgichi — VERGUL (o'zbekcha yozuv).
 */
export const percentText = (value, { withSign = true } = {}) => {
  if (value == null) return "—";
  const abs = Math.abs(value).toFixed(1).replace(".", ",");
  if (!withSign) return `${abs}%`;
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `${MINUS}${abs}%`;
  return "0,0%";
};

/** Manfiy foizni ishorasi bilan: ketganlar har doim tushish tomonida. */
export const negativePercentText = (value) =>
  value == null ? "—" : percentText(-Math.abs(value));

/**
 * O'SISH — YASHIL, TUSHISH — QIZIL.
 *
 * ⚠️ Chiqib ketganlar registridagi (`departureDelta`) qoidaning AKSI va
 * bu ataylab: u yerda "ketganlar soni ko'paydi" o'lchanadi (ko'payishi —
 * yomon xabar), bu yerda esa MAKTABNING o'zgarishi (ko'payishi — yaxshi).
 */
export const toneOfNet = (net) => {
  const value = Number(net) || 0;
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-gray-500";
};

/** Hujjatdagi rang (inline, Word fayli bilan AYNI ma'noda). */
export const docToneOfNet = (net) => {
  const value = Number(net) || 0;
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-700";
  return "text-gray-500";
};

/**
 * So'rov parametrlari — URL holatidan server so'roviga.
 *
 * ⚠️ BO'SH PARAMETR YUBORILMAYDI: `month=""` serverda "Oy noto'g'ri
 * ko'rsatilgan" xatosini berardi, holbuki foydalanuvchi hali hech narsa
 * tanlamagan.
 */
export const buildMovementParams = ({ scope, year, month, from, to }) => {
  if (scope === "month" && month) return { month: String(month) };
  if (scope === "range" && from && to) {
    return { from: String(from), to: String(to) };
  }
  return { year: String(year) };
};
