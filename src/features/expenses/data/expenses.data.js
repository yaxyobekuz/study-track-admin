// Xarajatlar bo'limining statik ma'lumotlari.
//
// Xarajat — o'quvchi to'lovi BO'LMAGAN pul: ijara, kitob sotuvi,
// homiylik. U kassaga tushadi va moliya hisobotlarida ko'rinadi.

/** Bo'limning ichki tablari. */
export const EXPENSE_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "settings", label: "Sozlamalar" },
];

export const EXPENSE_TABLE_COLUMNS = [
  "Sana",
  "Kategoriya",
  "Kimga",
  "To'lov turi",
  { label: "Summa", align: "right" },
  "",
];

export const CATEGORY_TABLE_COLUMNS = [
  "Kategoriya",
  { label: "Yozuvlar", align: "right" },
  "Holat",
  "",
];

export const CATEGORY_STATUS_OPTIONS = [
  { label: "Faol", value: "active" },
  { label: "Nofaol", value: "inactive" },
  { label: "Arxivlangan", value: "archived" },
];

/** Kategoriya holati uchun badge. */
export const getCategoryStatus = (category) => {
  if (category.isArchived) {
    return { label: "Arxivlangan", className: "bg-gray-100 text-gray-600" };
  }
  if (!category.isActive) {
    return { label: "Nofaol", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Faol", className: "bg-green-100 text-green-700" };
};

/**
 * Kategoriya nima uchun o'chirilmasligini tushuntiradigan matn.
 * O'chirish o'rniga arxivlash — o'tgan hisobotlar shu kesimga tayanadi.
 */
export const CATEGORY_ARCHIVE_HINT =
  "Kategoriya o'chirilmaydi — arxivlanadi. Arxivlangani yangi xarajat " +
  "qo'shishda ro'yxatda ko'rinmaydi, lekin eski yozuvlar va hisobotlar " +
  "o'z joyida qoladi.";
