/**
 * ERP VA KUNDALIK.COM — tizimlar, filtrlar va Excel ro'yxatlari.
 *
 * ⚠️ Kalitlar server bilan QO'LDA sinxron
 * (`server/src/services/studentSystem.service.js` → `SYSTEMS`,
 * `EXPORT_LISTS`, `MARK_BATCH_MAX`). Server baribir tekshiradi — noto'g'ri
 * kalit 400 bilan qaytadi, jim bo'sh ro'yxat emas.
 */

/** Tizimlar — jadval ustunlari va kartalar shu tartibda. */
export const STUDENT_SYSTEMS = [
  { key: "erp", label: "ERP" },
  { key: "kundalik", label: "Kundalik.com" },
];

export const STUDENT_SYSTEMS_PAGE_LIMIT = 50;

/** Hujjat ko'rinishidagi hisobot — bosh sahifadagi kartadagi belgi shu yerga olib keladi. */
export const SYSTEMS_REPORT_PATH = "/student-systems/report";

/**
 * Foiz: "82,4%" / "—" (maxraj nol bo'lsa). Kasr — VERGUL bilan.
 *
 * ⚠️ Panel foizni O'ZI HISOBLAMAYDI — serverdan kelgan qiymatni faqat
 * ko'rinishga keltiradi (`studentSystemReport.service.js`): Word fayli
 * bilan ekrandagi raqam bir xil formuladan chiqishi shart.
 *
 * ⚠️ `null` NOL EMAS: o'quvchisi yo'q sinfda "0%" degan yozuv "hech kim
 * kiritilmagan" bo'lib o'qilardi.
 */
export const percentText = (value) =>
  value == null ? "—" : `${Math.abs(value).toFixed(1).replace(".", ",")}%`;

/** Sinf filtri: sinfga biriktirilmagan o'quvchilar. */
export const NO_CLASS = "none";

export const PRESENCE = { ALL: "all", YES: "yes", NO: "no" };

/** Tizim filtri variantlari ("ERP: hammasi" / "ERP da bor" / "ERP da yo'q"). */
export const presenceOptions = (label) => [
  { value: PRESENCE.ALL, label: `${label}: hammasi` },
  { value: PRESENCE.YES, label: `${label} da bor` },
  { value: PRESENCE.NO, label: `${label} da yo'q` },
];

export const EXPORT_SCOPE = { SCHOOL: "school", CLASSES: "classes" };

export const EXPORT_SCOPE_OPTIONS = [
  {
    value: EXPORT_SCOPE.SCHOOL,
    label: "Butun maktab",
    description: "Barcha sinflar va sinfsiz o'quvchilar",
  },
  {
    value: EXPORT_SCOPE.CLASSES,
    label: "Sinflar bo'yicha",
    description: "Bitta yoki bir nechta sinfni tanlang",
  },
];

export const EXPORT_LIST_OPTIONS = [
  {
    value: "all",
    label: "To'liq hisobot",
    description:
      "Umumiy ro'yxat, to'rtala ro'yxat alohida varaqlarda va sinflar kesimi",
  },
  { value: "erp_yes", label: "ERP da bor o'quvchilar" },
  { value: "erp_no", label: "ERP da yo'q o'quvchilar" },
  { value: "kundalik_yes", label: "Kundalik.com da bor o'quvchilar" },
  { value: "kundalik_no", label: "Kundalik.com da yo'q o'quvchilar" },
];

/**
 * Sahifa filtridan Excel ro'yxatini oldindan tanlash: faqat BITTA tizim
 * bo'yicha filtr bo'lsa — aynan o'sha ro'yxat, aks holda to'liq hisobot.
 *
 * @param {Record<string, string>} presence - `{ erp, kundalik }` filtr qiymatlari
 * @returns {string}
 */
export const defaultExportList = (presence) => {
  const active = STUDENT_SYSTEMS.filter(
    ({ key }) => presence[key] && presence[key] !== PRESENCE.ALL,
  );
  if (active.length !== 1) return "all";
  const { key } = active[0];
  return `${key}_${presence[key]}`;
};
