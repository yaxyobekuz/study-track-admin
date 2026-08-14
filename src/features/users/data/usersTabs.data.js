// Foydalanuvchilar bo'limining tablari.
//
// Iyerarxiya: /users (bo'lim) → /users/staff | /users/students (ro'yxat) →
// /users/:userId (detal sahifa, o'z ichki tablari bilan).
//
// `to` - route path, `label` - tabdagi matn, `title`/`description` - sarlavha.
export const USERS_TABS = [
  {
    to: "/users/staff",
    label: "Xodimlar",
    title: "Xodimlar",
    description: "O'qituvchilar, adminlar va boshqa xodimlar",
  },
  {
    to: "/users/students",
    label: "O'quvchilar",
    title: "O'quvchilar",
    description: "Sinflarga biriktirilgan o'quvchilar ro'yxati",
  },
];

/** Ro'yxat ichidagi arxiv filtri (faqat o'quvchilarda — xodim arxivlanmaydi). */
export const ARCHIVE_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "archived", label: "Arxivlangan" },
];

// ── Detal sahifaning ichki tablari ────────────────
//
// Har bir tab `key` bo'yicha URL'ga yoziladi (`?tab=finance`), shuning uchun
// sahifani ochiq tab bilan birga link qilib yuborish mumkin.

export const STAFF_DETAIL_TABS = [
  { value: "main", label: "Asosiy" },
  { value: "attendance", label: "Davomat" },
  { value: "penalties", label: "Jarimalar" },
];

export const STUDENT_DETAIL_TABS = [
  { value: "main", label: "Asosiy" },
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
