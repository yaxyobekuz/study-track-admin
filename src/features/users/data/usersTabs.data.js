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

/**
 * Xodimlar sahifasining tablari — arxiv filtri + hisobot.
 *
 * "Hisobotlar" ro'yxatning uchinchi filtri EMAS: u qatorlar o'rniga butun
 * shtat manzarasini chizadi. Shuning uchun u ro'yxat tablari bilan bitta
 * qatorda tursa ham, alohida ruxsat talab qiladi (`permission`) va
 * `UsersListView` uni panel sifatida ochadi.
 *
 * O'quvchilar sahifasida bunday tab yo'q — ular uchun alohida "Statistika"
 * bo'limi bor.
 */
export const STAFF_LIST_TABS = [
  ...ARCHIVE_TABS,
  { value: "reports", label: "Hisobotlar", permission: "users.reports" },
];

// ── Detal sahifaning ichki tablari ────────────────
//
// Har bir tab `value` bo'yicha URL'ga yoziladi (`?tab=finance`), shuning uchun
// sahifani ochiq tab bilan birga link qilib yuborish mumkin.

// `permission` — tab ko'rinishi uchun talab qilinadigan ruxsat kaliti.
// Berilmasa tab hammaga ochiq. `roles` — tab qaysi rollarga ma'noli
// (berilmasa hammaga). `StaffDetail` shu ikki maydonga qarab ro'yxatni
// filtrlaydi (`usersTabs.data.js` — statik ma'lumot, filtr esa komponentda).
export const STAFF_DETAIL_TABS = [
  { value: "main", label: "Asosiy" },
  // Dars yuklamasi FAQAT o'qituvchida: jadvalga faqat `teacher` roli
  // qo'yiladi (`validateScheduleSubjects`), ya'ni boshqa xodimda bu tab
  // doim bo'sh turardi.
  {
    value: "workload",
    label: "Dars jadvali",
    permission: "schedules.view",
    roles: ["teacher"],
  },
  // Oylik — barcha xodimda bor (o'quvchida yo'q, u StudentDetail'da).
  { value: "payroll", label: "Oylik", permission: "payroll.view" },
  // Ruxsatlar HAR FILIALDA alohida bo'lgani uchun bu tab ichida avval
  // filial tanlanadi. Biriktirish ham shu yerda — "qayerda ishlaydi" va
  // "u yerda nima qila oladi" bir-biridan ajralmaydi.
  { value: "permissions", label: "Ruxsatlar", permission: "branches.assign" },
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
