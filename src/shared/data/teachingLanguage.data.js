/**
 * O'QUV TILI — panel tomonidagi YORLIQLAR.
 *
 * Bitta maktabda bir xil fan uch tilda o'qitiladi: 5-sinfda ham o'zbek,
 * ham rus, ham ingliz guruh bo'lishi mumkin va ularning mavzular rejasi
 * BOSHQA. Til — SINFNING xossasi (`Class.language`), mavzular rejasi esa
 * til bo'yicha versiyalangan (`Topic.language`).
 *
 * ⚠️ SERVER BILAN QO'LDA SINXRON: asosiy manba
 * `server/src/helpers/teachingLanguage.helpers.js` (`permissions.js` va
 * `permissions.data.js` bilan AYNI qoida). Qiymatlar Prisma
 * `TeachingLanguage` enumi bilan bir xil.
 *
 * ⚠️ RO'YXAT ZAXIRA: server `GET /topics/languages` da ham qaytaradi
 * (`leads.data.js` bilan AYNI mulohaza) — so'rov kelmaganda tanlagich
 * bo'sh qolmasligi uchun shu ro'yxat ishlatiladi.
 */

export const TEACHING_LANGUAGES = ["uz", "ru", "en"];

export const DEFAULT_TEACHING_LANGUAGE = "uz";

/** Tilning o'zi — ustun sarlavhasi va tanlagich uchun. */
export const TEACHING_LANGUAGE_LABELS = {
  uz: "O'zbek",
  ru: "Rus",
  en: "Ingliz",
};

/** Sinf kesimida — yuklash oynasi va sinf kartasi shuni yozadi. */
export const TEACHING_LANGUAGE_CLASS_LABELS = {
  uz: "O'zbek sinf",
  ru: "Rus sinf",
  en: "Ingliz sinf",
};

/** Belgi rangi — til kesimi bir qarashda ajralib tursin. */
export const TEACHING_LANGUAGE_COLORS = {
  uz: "bg-blue-50 text-blue-700 border-blue-200",
  ru: "bg-amber-50 text-amber-700 border-amber-200",
  en: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** `<Select>` uchun ro'yxat. */
export const teachingLanguageOptions = TEACHING_LANGUAGES.map((value) => ({
  value,
  label: TEACHING_LANGUAGE_CLASS_LABELS[value],
}));

/** Yorliq — noma'lum qiymatda em-dash (`dates.md` qoidasi bilan AYNI naqsh). */
export const languageLabel = (value) =>
  TEACHING_LANGUAGE_LABELS[value] ?? "—";

export const languageClassLabel = (value) =>
  TEACHING_LANGUAGE_CLASS_LABELS[value] ?? "—";

export const languageColor = (value) =>
  TEACHING_LANGUAGE_COLORS[value] ?? "bg-gray-50 text-gray-600 border-gray-200";
