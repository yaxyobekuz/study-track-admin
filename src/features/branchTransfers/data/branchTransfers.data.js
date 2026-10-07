// Filiallararo ko'chirish — statik ma'lumot.
// ⚠️ Turlar, rejimlar va chegaralar server bilan QO'LDA sinxron
// (`server/src/services/branchTransfer.service.js`).

/** Sahifa tablari — har biri o'z ruxsati bilan. */
export const TRANSFER_TABS = [
  { value: "students", label: "O'quvchilar", permission: "transfers.students", kind: "student" },
  { value: "staff", label: "Xodimlar", permission: "transfers.staff", kind: "staff" },
  { value: "classes", label: "Sinflar", permission: "transfers.classes", kind: "class" },
  { value: "history", label: "Tarix", permission: "transfers.view", kind: null },
];

/** Bir martada ko'pi bilan (server `LIMITS`). */
export const TRANSFER_LIMITS = { student: 300, staff: 50, class: 20 };

export const TRANSFER_REASON_MIN = 5;
export const PICKER_PAGE_SIZE = 20;
export const HISTORY_PAGE_SIZE = 20;

export const KIND_LABELS = {
  student: "O'quvchi",
  staff: "Xodim",
  class: "Sinf",
};

/** Oyna sarlavhasi va natija so'zi — tur bo'yicha. */
export const KIND_TITLES = {
  student: "O'quvchilarni ko'chirish",
  staff: "Xodimlarni ko'chirish",
  class: "Sinflarni ko'chirish",
};

export const MODE_LABELS = {
  move: "Ko'chirish",
  share: "Qo'shish (ikkala filialda)",
};

/**
 * Xodim uchun uch yo'l. `move` + `keepSource` — uy filiali yangisiga o'tadi,
 * lekin shu filialda ham ishlashda davom etadi.
 */
export const STAFF_MODES = [
  {
    value: "share",
    label: "Ikkala filialda ishlaydi",
    description:
      "Xodim shu filialda qoladi va yangi filialga ham qo'shiladi. Asosiy filiali o'zgarmaydi.",
    mode: "share",
    keepSource: true,
  },
  {
    value: "moveKeep",
    label: "Asosiy filiali yangisi bo'ladi",
    description:
      "Login yangi filialga tushadi, shu filialda ham ishlashda davom etadi. Asosiy oylik keyingi oydan yangi filialda.",
    mode: "move",
    keepSource: true,
  },
  {
    value: "move",
    label: "Butunlay ko'chadi",
    description:
      "Xodim shu filialdan chiqadi va yangi filialda ishlaydi. Shu filialdagi tarixi saqlanadi.",
    mode: "move",
    keepSource: false,
  },
];

export const TARIFF_MODES = [
  { value: "keep", label: "Joriy tarifi saqlanadi" },
  { value: "targetDefault", label: "Yangi filialning standart tarifi" },
];

export const PERMISSION_MODES = [
  { value: "roleDefaults", label: "Rolning standart ruxsatlari" },
  { value: "copy", label: "Shu filialdagi ruxsatlari nusxalanadi" },
];

/** Jurnal holati. */
export const TRANSFER_STATUSES = {
  completed: { label: "Bajarildi", className: "border-green-200 bg-green-50 text-green-700" },
  attention: { label: "E'tibor talab", className: "border-amber-200 bg-amber-50 text-amber-800" },
};

export const DIRECTION_OPTIONS = [
  { value: "all", label: "Hammasi" },
  { value: "out", label: "Shu filialdan" },
  { value: "in", label: "Shu filialga" },
];

export const KIND_FILTER_OPTIONS = [
  { value: "all", label: "Barcha turlar" },
  { value: "student", label: "O'quvchilar" },
  { value: "staff", label: "Xodimlar" },
  { value: "class", label: "Sinflar" },
];

export const isTransferReasonValid = (reason) =>
  String(reason ?? "").trim().length >= TRANSFER_REASON_MIN;
