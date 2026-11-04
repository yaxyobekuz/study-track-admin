/**
 * TANGA CHEKLOVI — ekran ma'lumotlari.
 *
 * ⚠️ Summa va qarz SERVERDAN tayyor keladi (`debtNowLabel`, `debtAtBlock`):
 * panel pul hisoblamaydi. Qarz manbai qarzdorlar registri bilan AYNI
 * (`services/coinBlock.service.js`).
 */

export const BLOCK_STATUS_OPTIONS = [
  { value: "active", label: "Amaldagi cheklovlar" },
  { value: "revoked", label: "Tarix (olib tashlangan)" },
];

export const BLOCK_COLUMNS = [
  { label: "O'quvchi", key: "student" },
  { label: "Sabab", key: "reason" },
  { label: "Cheklanganda qarz", key: "debtAtBlock", align: "right" },
  { label: "Hozirgi qarz", key: "debtNow", align: "right" },
  { label: "Tanga", key: "coins", align: "right" },
  { label: "Qo'yilgan", key: "createdAt" },
  { label: "", key: "actions", align: "right" },
];

export const HISTORY_COLUMNS = [
  { label: "O'quvchi", key: "student" },
  { label: "Cheklov sababi", key: "reason" },
  { label: "Cheklanganda qarz", key: "debtAtBlock", align: "right" },
  { label: "Qo'yilgan", key: "createdAt" },
  { label: "Olib tashlangan", key: "revokedAt" },
  { label: "Ochish sababi", key: "revokeReason" },
];

/** Cheklash oynasidagi tanlov doirasi. */
export const CANDIDATE_SCOPE_OPTIONS = [
  { value: "debtors", label: "Qarzdorlar" },
  { value: "all", label: "Barcha o'quvchilar" },
];

/**
 * ⚠️ Serverdagi chegara bilan BIR XIL (`coinBlock.service.js` →
 * `MAX_STUDENTS`): oynada oldindan aytilmasa, 500 dan oshgan tanlov
 * saqlashda xato bo'lib qaytardi.
 */
export const MAX_BLOCK_STUDENTS = 500;

export const BLOCK_REASON_MAX = 300;
export const BLOCK_NOTE_MAX = 500;

/** Tez-tez ishlatiladigan sabablar — yozishni qisqartiradi, majburlamaydi. */
export const BLOCK_REASON_PRESETS = [
  "Oylik to'lov qarzdorligi",
  "Uzoq muddatli qarzdorlik",
  "Ota-ona bilan kelishuvga ko'ra",
];

export const UNBLOCK_REASON_PRESETS = [
  "Qarzdorlik to'landi",
  "Qarz qisman to'landi — cheklov olib tashlandi",
  "Xato cheklangan",
];
