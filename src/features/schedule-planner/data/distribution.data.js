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

/**
 * ASBOBLAR PANELIDAGI SAQLANISH INDIKATORI.
 *
 * Uchala holat ATAYLAB ajratilgan: "brauzerda bor, serverda yo'q" bilan
 * "serverga saqlangan" bir xil ko'rinsa, odam varaqni boshqa kompyuterda
 * ochib, ishini topolmay qolardi. Rang esa faqat bezak emas — u yagona
 * savolga javob beradi: "ishim yo'qolmaydimi?".
 */
export const SAVE_STATES = {
  // Serverdagi nusxadan farq qiladigan o'zgarish bor.
  unsaved: {
    label: "Saqlanmagan",
    hint: "O'zgarishlar brauzerda turibdi. Serverga yozish uchun Saqlash tugmasini bosing.",
    className: "bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
    pulse: true,
  },
  // Serverdagi nusxa joriy varaq bilan bir xil.
  saved: {
    label: "Saqlangan",
    hint: "Varaq serverda — istalgan kompyuterdan ochiladi.",
    className: "bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
    pulse: false,
  },
  // Serverda nusxa umuman yo'q — varaq faqat shu brauzerda.
  localOnly: {
    label: "Brauzerda",
    hint: "Varaq hozircha faqat shu brauzerda saqlanmoqda, serverga yozilmagan.",
    className: "bg-gray-100 text-gray-600",
    dotClassName: "bg-gray-400",
    pulse: false,
  },
};
