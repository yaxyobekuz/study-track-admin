/**
 * SINF O'ZGARISHLARI — sabab chegaralari, turlar va manba yorliqlari.
 *
 * ⚠️ Chegaralar server bilan QO'LDA sinxron
 * (`server/src/services/studentClassChange.service.js` → `REASON_MIN`,
 * `REASON_MAX`). Server baribir tekshiradi — bu faqat forma darhol
 * aytishi uchun.
 */

export const CLASS_CHANGE_REASON_MIN = 3;
export const CLASS_CHANGE_REASON_MAX = 500;

export const CLASS_CHANGES_PAGE_LIMIT = 20;

/** Registr tablari — URL dagi `?tab=` qiymati server `type` i bilan bir xil. */
export const CLASS_CHANGE_TABS = [
  { value: "moved", label: "Ko'chirilganlar" },
  { value: "removed", label: "Sinfdan chiqarilganlar" },
];

export const CLASS_CHANGE_SOURCE_LABELS = {
  profile: "O'quvchi profili",
  class_page: "Sinf sahifasi",
  assistant: "AI yordamchi",
};

/** Sabab kiritilganmi (bo'shliqsiz uzunlik bo'yicha — server bilan bir xil). */
export const isClassChangeReasonValid = (reason) =>
  reason.trim().length >= CLASS_CHANGE_REASON_MIN;
