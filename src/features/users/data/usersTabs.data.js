// Foydalanuvchilar bo'limining statik ma'lumotlari.
//
// Xodimlar va O'quvchilar — ikkita mustaqil sahifa (sidebarda ham alohida).
// Har birining ichida "Asosiy / Arxivlangan" tabi bor: arxivlangan
// foydalanuvchi o'chirilmaydi, shunchaki ro'yxatdan yashiriladi va tizimga
// kira olmaydi.

/** Ro'yxat ichidagi arxiv filtri (ikkala sahifada ham bor). */
export const ARCHIVE_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "archived", label: "Arxivlangan" },
];

// ── Detal sahifaning ichki tablari ────────────────
//
// Har bir tab `value` bo'yicha URL'ga yoziladi (`?tab=finance`), shuning uchun
// sahifani ochiq tab bilan birga link qilib yuborish mumkin.

export const STAFF_DETAIL_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "attendance", label: "Davomat" },
  { value: "penalties", label: "Jarimalar" },
];

export const STUDENT_DETAIL_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "enrollment", label: "O'qish davrlari" },
  { value: "attendance", label: "Davomat" },
  { value: "finance", label: "Moliya" },
  { value: "penalties", label: "Jarimalar" },
];

/**
 * URL'dagi `?tab=` qiymatini tekshiradi — noma'lum qiymat kelsa birinchi tab.
 * @param {{value: string}[]} tabs
 * @param {string|null} value
 * @returns {string}
 */
export const resolveTab = (tabs, value) =>
  tabs.some((tab) => tab.value === value) ? value : tabs[0].value;
