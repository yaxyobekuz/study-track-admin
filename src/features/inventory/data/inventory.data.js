/**
 * Inventar bo'limining statik ma'lumotlari.
 *
 * ⚠️ YORLIQLAR SERVERDA HAM BOR (`helpers/inventory.helpers.js`) va bu
 * ATAYLAB: server javobida `typeLabel` / `statusLabel` tayyor keladi
 * (Telegram xabari va Excel ustuni uchun kerak), frontend esa filtr
 * tanlagichlarini shu ro'yxatdan chizadi. Ikkalasi qo'lda sinxron
 * saqlanadi — `permissions.js` bilan bir xil kelishuv.
 */

/** Bo'limning tab sahifalari. Tartib ISH CHASTOTASI bo'yicha. */
export const INVENTORY_TABS = [
  { to: "/inventory/overview", label: "Umumiy", title: "Inventar", exact: false },
  {
    to: "/inventory/checks",
    label: "Kunlik hisobot",
    title: "Inventar",
    can: "monitoring.view",
    exact: false,
  },
  {
    to: "/inventory/damages",
    label: "Zararlar",
    title: "Inventar",
    can: "damages.view",
    exact: false,
  },
  {
    to: "/inventory/debtors",
    label: "Qarzdorlar",
    title: "Inventar",
    can: "damages.view",
    exact: false,
  },
  { to: "/inventory/stock", label: "Xatlov", title: "Inventar", exact: false },
  { to: "/inventory/catalog", label: "Katalog", title: "Inventar", exact: false },
  {
    to: "/inventory/settings",
    label: "Sozlamalar",
    title: "Inventar",
    can: "inventory.settings",
    exact: false,
  },
];

// ─────────────────────────────────────────────
// Yorliqlar
// ─────────────────────────────────────────────

export const LOCATION_TYPES = [
  { value: "classroom", label: "Sinf xonasi" },
  { value: "canteen", label: "Oshxona" },
  { value: "gym", label: "Sport zali" },
  { value: "library", label: "Kutubxona" },
  { value: "lab", label: "Laboratoriya" },
  { value: "office", label: "Xodim xonasi" },
  { value: "corridor", label: "Umumiy joy" },
  { value: "dorm", label: "Yotoqxona" },
  { value: "warehouse", label: "Ombor" },
  { value: "other", label: "Boshqa" },
];

export const DAMAGE_KINDS = [
  { value: "broken", label: "Singan / yaroqsiz" },
  { value: "missing", label: "Yo'qolgan" },
];

export const DAMAGE_STATUS_OPTIONS = [
  { value: "", label: "Barcha holatlar" },
  { value: "pending", label: "Aybdor aniqlanmagan" },
  { value: "charged", label: "Aybdorga yozilgan" },
  { value: "waived", label: "Maktab hisobidan" },
  { value: "cancelled", label: "Bekor qilingan" },
];

export const CHECK_STATUS_OPTIONS = [
  { value: "", label: "Barchasi" },
  { value: "draft", label: "Qoralama" },
  { value: "submitted", label: "Yuborilgan" },
];

export const CATALOG_STATUS_OPTIONS = [
  { value: "active", label: "Faol" },
  { value: "archived", label: "Arxivlangan" },
];

/** O'lchov birligi — erkin matn, lekin tez-tez uchraydiganlari taklif qilinadi. */
export const UNIT_SUGGESTIONS = ["dona", "komplekt", "juft", "to'plam", "quti"];

// ─────────────────────────────────────────────
// Jadval ustunlari
// ─────────────────────────────────────────────

export const STOCK_COLUMNS = [
  "Xona",
  "Jihoz",
  { label: "Jami", align: "right" },
  { label: "Yaroqsiz", align: "right" },
  { label: "Yaroqli", align: "right" },
  "",
];

export const CHECK_COLUMNS = [
  "Sana",
  "Xona",
  "Kim yubordi",
  { label: "Singan", align: "right" },
  { label: "Yo'qolgan", align: "right" },
  { label: "Zarar", align: "right" },
  "Holat",
  "",
];

export const DAMAGE_COLUMNS = [
  "Sana",
  "Jihoz",
  "Xona",
  { label: "Soni", align: "right" },
  { label: "Summa", align: "right" },
  { label: "Yozilgan", align: "right" },
  "Holat",
  "",
];

export const CHARGE_COLUMNS = [
  "Aybdor",
  "Zarar",
  { label: "Summa", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Holat",
  "",
];

export const DEBTOR_COLUMNS = [
  "Aybdor",
  "Sinf / rol",
  { label: "Qarzlar", align: "right" },
  { label: "Jami", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "",
];

export const PAYMENT_COLUMNS = [
  "Chek",
  "Sana",
  "Kim to'ladi",
  "To'lov turi",
  { label: "Summa", align: "right" },
  "",
];

export const ITEM_COLUMNS = [
  "Jihoz",
  "Toifa",
  "Birlik",
  { label: "Narx", align: "right" },
  { label: "Xatlovda", align: "right" },
  "",
];

export const LOCATION_COLUMNS = [
  "Xona",
  "Turi",
  "Mas'ul",
  { label: "Jihoz turi", align: "right" },
  { label: "Jami", align: "right" },
  { label: "Yaroqsiz", align: "right" },
  "",
];

export const CATEGORY_COLUMNS = ["Toifa", { label: "Jihoz turlari", align: "right" }, "Holat", ""];

export const MOVEMENT_COLUMNS = [
  "Sana",
  "Xona",
  "Jihoz",
  "Harakat",
  { label: "O'zgarish", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Izoh",
];

// ─────────────────────────────────────────────
// Badge yordamchilari
// ─────────────────────────────────────────────

const BADGE = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
};

/** Zarar holati uchun badge. */
export const getDamageStatusBadge = (status) => {
  switch (status) {
    case "charged":
      return { label: "Aybdorga yozilgan", className: BADGE.blue };
    case "waived":
      return { label: "Maktab hisobidan", className: BADGE.gray };
    case "cancelled":
      return { label: "Bekor qilingan", className: BADGE.gray };
    default:
      return { label: "Aybdor aniqlanmagan", className: BADGE.amber };
  }
};

/** Qarz holati uchun badge. */
export const getChargeStatusBadge = (charge) => {
  if (charge.status === "cancelled") {
    return { label: "Bekor qilingan", className: BADGE.gray };
  }
  if (charge.status === "paid") {
    return { label: "To'langan", className: BADGE.green };
  }
  if (charge.isOverdue) {
    return { label: "Muddati o'tgan", className: BADGE.red };
  }
  return charge.status === "partial"
    ? { label: "Qisman to'langan", className: BADGE.amber }
    : { label: "To'lanmagan", className: BADGE.red };
};

/** Kunlik hisobot holati uchun badge. */
export const getCheckStatusBadge = (check) =>
  check.isSubmitted
    ? { label: "Yuborilgan", className: BADGE.green }
    : { label: "Qoralama", className: BADGE.amber };

/** Katalog yozuvi holati uchun badge. */
export const getCatalogStatusBadge = (row) => {
  if (row.isArchived) return { label: "Arxivlangan", className: BADGE.gray };
  if (row.isActive === false) return { label: "Nofaol", className: BADGE.amber };
  return { label: "Faol", className: BADGE.green };
};

// ─────────────────────────────────────────────
// Tushuntirish matnlari
// ─────────────────────────────────────────────

export const SEALED_HINT =
  "Zarar summasi hodisa paytidagi narxda MUHRLANADI: katalogda narx keyin " +
  "o'zgarsa ham bu yozuvga tegilmaydi. Xato bo'lsa — bekor qilib, qaytadan kiriting.";

export const CHECK_SUBMIT_HINT =
  "Yuborilgandan keyin hisobot o'zgartirilmaydi: xatlovga yozuvlar tushadi " +
  "va zarar hodisalari shakllanadi. Yozganlaringizni tekshirib chiqing.";

export const NO_ADVANCE_HINT =
  "Qarzdan ortiq to'lov qabul qilinmaydi — moddiy zararda avans yo'q.";

export const ARCHIVE_HINT =
  "Yozuv o'chirilmaydi — arxivlanadi. Arxivlangani yangi yozuvlarda " +
  "ko'rinmaydi, lekin o'tgan hisobotlar o'z joyida qoladi.";
