// DARS TAQSIMOTI VARAG'I — sozlamalari.
//
// ⚠️ Ustunlar (sinflar) va qatorlar (fanlar) BU YERDA EMAS: ular TIZIMNING
// o'zidan olinadi — "Sinflar" va "Fanlar" bo'limlaridan (`useClasses`,
// `useSubjects`). Shu sababli varaqda nom ham, o'quvchi soni ham
// takrorlanmaydi: sinf nomi o'zgarsa yoki yangi fan qo'shilsa, varaq o'zi
// yangilanadi.
//
// Varaqning O'ZI faqat uchta narsani saqlaydi: katak qiymatlari, yashirilgan
// ustun/qatorlar va reviziya raqami.

/** localStorage kaliti — sxema o'zgarsa raqam oshadi. */
const STORAGE_PREFIX = "planner.distribution";
export const SHEET_VERSION = 2;

/**
 * Kalit FILIALGA bog'lanadi.
 *
 * ⚠️ Bu multi-tenant qoidasining bir qismi: bitta brauzerda ikki filialga
 * kirilsa, Chilonzorda kiritilgan varaq Yunusobodda ko'rinmasligi va uning
 * ustiga yozilmasligi kerak. Global kalit aynan shu xatoni qilardi.
 */
export const storageKey = (branchId) =>
  `${STORAGE_PREFIX}.v${SHEET_VERSION}.${branchId || "default"}`;

/** O'qib bo'lmagan nusxa shu kalitga ko'chiriladi (jim yo'qotmaslik uchun). */
export const backupKey = (branchId) => `${storageKey(branchId)}:backup`;

/** Katak kaliti: fan + sinf. Ikkalasi ham TIZIMDAGI haqiqiy id. */
export const cellKey = (subjectId, classId) => `${subjectId}|${classId}`;

/** Bo'sh varaq. */
export const createEmptySheet = () => ({
  version: SHEET_VERSION,
  values: {},
  hiddenColumns: [],
  hiddenRows: [],
  rev: 0,
});
