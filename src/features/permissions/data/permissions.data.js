// ─────────────────────────────────────────────
// RUXSATLAR KATALOGI (bo'lim + amal darajasi)
// ─────────────────────────────────────────────
// Ruxsat kaliti — `<bo'lim>.<amal>` (masalan "users.create").
// Katalog server `server/src/utils/permissions.js` bilan bir xil bo'lishi
// SHART (ikki alohida repo — qo'lda sinxron saqlanadi).

/** Bo'lim kalitlari. */
export const SECTIONS = {
  BRANCHES: "branches",
  USERS: "users",
  ENROLLMENT: "enrollment",
  STATISTICS: "statistics",
  ATTENDANCE: "attendance",
  GRADES: "grades",
  SCHEDULES: "schedules",
  PLANNER: "planner",
  TOPICS: "topics",
  CLASSES: "classes",
  SUBJECTS: "subjects",
  TESTS: "tests",
  MARKET: "market",
  TASKS: "tasks",
  PENALTIES: "penalties",
  PREMIUM: "premium",
  COINS: "coins",
  TARIFFS: "tariffs",
  DISCOUNTS: "discounts",
  FINANCE: "finance",
  DEBTORS: "debtors",
  REPORTS: "reports",
  INCOME: "income",
  PAYROLL: "payroll",
  EXPENSES: "expenses",
  INVENTORY: "inventory",
  MONITORING: "monitoring",
  DAMAGES: "damages",
  HOLIDAYS: "holidays",
  MONITORS: "monitors",
  CHANGELOG: "changelog",
  MESSAGES: "messages",
  SOCIAL: "social",
  LEADS: "leads",
};

// Tez-tez takrorlanadigan amal nomlari
const A = {
  view: { key: "view", label: "Ko'rish" },
  create: { key: "create", label: "Qo'shish" },
  update: { key: "update", label: "Tahrirlash" },
  delete: { key: "delete", label: "O'chirish" },
  export: { key: "export", label: "Eksport qilish" },
  settings: { key: "settings", label: "Sozlamalar" },
};

/** Bo'lim → amallar. Modal checkbox'lari shu ro'yxatdan chiziladi. */
export const PERMISSION_SECTIONS = [
  {
    // Filiallar — `branches.create` yangi baza yaratadi, `branches.assign` esa
    // odamni butun BOSHQA bazaga kiritadi. Ikkalasi ham amalda owner
    // darajasidagi huquq, lekin katalogda turishi kerak.
    //
    // "Filial almashtirish" ruxsat EMAS: xodim o'zi biriktirilgan filiallar
    // orasida erkin harakatlanadi — ro'yxatning o'zi grant.
    key: SECTIONS.BRANCHES,
    label: "Filiallar",
    group: "Asosiy",
    actions: [
      A.view,
      A.create,
      A.update,
      { key: "archive", label: "Arxivlash" },
      { key: "assign", label: "Xodimni filialga biriktirish" },
    ],
  },
  {
    key: SECTIONS.USERS,
    label: "Foydalanuvchilar",
    group: "Asosiy",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "archive", label: "Arxivlash" },
      { key: "restore", label: "Arxivdan qaytarish" },
      { key: "password", label: "Parolni ko'rish / tiklash" },
      // Hisobotlar — ro'yxatning KESIMI emas, butun shtat manzarasi: tarkib,
      // xodimlar oqimi, jarima va topshiriq intizomi bitta ekranda. Shuning
      // uchun `users.view` bilan birga berilmaydi (davomat bo'limidagi
      // `attendance.reports` bilan bir xil mantiq).
      { key: "reports", label: "Hisobotlar" },
      A.export,
    ],
  },
  {
    // O'qish davri PULNI harakatlantiradi (proratsiya va hisob-fakturaning
    // bor-yo'qligi), lekin uni qabulxona kiritadi — moliyachi emas. Shuning
    // uchun tariflardan ham, hisob-fakturalardan ham ALOHIDA bo'lim.
    key: SECTIONS.ENROLLMENT,
    label: "O'qish davrlari",
    group: "Asosiy",
    actions: [A.view, A.create, A.update, A.delete],
  },
  {
    key: SECTIONS.STATISTICS,
    label: "Statistika",
    group: "Asosiy",
    actions: [A.view, A.export],
  },
  {
    key: SECTIONS.ATTENDANCE,
    label: "Davomat",
    group: "Ta'lim",
    actions: [
      A.view,
      { key: "mark", label: "Davomat belgilash" },
      A.update,
      { key: "review", label: "Sababnomalarni ko'rib chiqish" },
      { key: "reasons", label: "Sabab turlarini boshqarish" },
      { key: "reports", label: "Hisobotlar" },
      A.settings,
    ],
  },
  {
    key: SECTIONS.GRADES,
    label: "Baholar jurnali",
    group: "Ta'lim",
    actions: [A.view, A.create, A.update, A.delete, A.export],
  },
  {
    key: SECTIONS.SCHEDULES,
    label: "Dars jadvali",
    group: "Ta'lim",
    actions: [A.view, A.create, A.update, A.delete, A.export, A.settings],
  },
  {
    // REJALASHTIRISH — amaldagi jadvaldan ALOHIDA bo'lim.
    //
    // Reja tuzadigan odam (o'quv bo'limi) amaldagi jadvalni o'zgartira
    // olmasligi, jadvalni ko'radigan odam esa butun yuklama registrini
    // (kim necha soat ishlaydi) ochib yubormasligi kerak.
    //
    // Amallar ATAYLAB mayda: soat belgilash (kim qancha dars beradi) va
    // bandlik belgilash (kim qachon bo'sh) — ikki xil mas'uliyat, ikkalasi
    // ham shakllantirishdan alohida.
    key: SECTIONS.PLANNER,
    label: "Dars jadvali rejasi",
    group: "Ta'lim",
    actions: [
      A.view,
      { key: "loads", label: "Dars soatlarini belgilash" },
      { key: "availability", label: "Bandlikni belgilash" },
      { key: "generate", label: "Jadval shakllantirish" },
      { key: "distribution", label: "Dars taqsimoti varag'i" },
      A.export,
      A.settings,
    ],
  },
  {
    key: SECTIONS.TOPICS,
    label: "Dars mavzulari",
    group: "Ta'lim",
    actions: [A.view, { key: "import", label: "Fayldan yuklash" }, A.delete],
  },
  {
    key: SECTIONS.CLASSES,
    label: "Sinflar",
    group: "Ta'lim",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "students", label: "O'quvchi qo'shish / chiqarish" },
      { key: "transfer", label: "O'quvchilarni ko'chirish" },
      A.export,
    ],
  },
  {
    key: SECTIONS.SUBJECTS,
    label: "Fanlar",
    group: "Ta'lim",
    actions: [A.view, A.create, A.update, A.delete, A.export],
  },
  {
    key: SECTIONS.TESTS,
    label: "Testlar",
    group: "Ta'lim",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "announce", label: "E'lon qilish" },
      { key: "distribute", label: "Tanga taqsimlash" },
      { key: "finalize", label: "Mavsumni yakunlash" },
      A.settings,
    ],
  },
  {
    key: SECTIONS.MARKET,
    label: "Do'kon",
    group: "Do'kon",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "orders", label: "Buyurtmalarni ko'rish" },
      { key: "fulfill", label: "Buyurtma holatini o'zgartirish" },
    ],
  },
  {
    key: SECTIONS.TASKS,
    label: "Topshiriqlar",
    group: "Topshiriqlar",
    actions: [
      A.view,
      A.create,
      { key: "review", label: "Tasdiqlash / rad etish" },
      { key: "stop", label: "To'xtatish" },
      { key: "extend", label: "Muddatni uzaytirish" },
    ],
  },
  {
    key: SECTIONS.PENALTIES,
    label: "Jarimalar",
    group: "Jarimalar",
    actions: [
      A.view,
      A.create,
      { key: "review", label: "Ko'rib chiqish" },
      A.delete,
      { key: "reduce", label: "Jarimani kamaytirish" },
      { key: "categories", label: "Kategoriyalarni boshqarish" },
      { key: "packages", label: "Kamaytirish paketlari" },
      A.settings,
    ],
  },
  {
    key: SECTIONS.PREMIUM,
    label: "MBSI Premium",
    group: "Premium",
    actions: [
      A.view,
      { key: "grant", label: "Premium berish" },
      { key: "revoke", label: "Premiumni bekor qilish" },
      { key: "emojis", label: "Emojilarni boshqarish" },
      A.export,
      A.settings,
    ],
  },
  {
    key: SECTIONS.COINS,
    label: "Tangalar",
    group: "Tangalar",
    actions: [A.view, { key: "distribute", label: "Tanga taqsimlash" }, A.settings],
  },
  {
    key: SECTIONS.TARIFFS,
    label: "Tariflar va narxlar",
    group: "Moliya",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "versions", label: "Narx versiyalari" },
      { key: "assign", label: "O'quvchiga biriktirish" },
      { key: "adjust", label: "Amaldagi yozuvni to'g'rilash" },
      A.export,
    ],
  },
  {
    // Chegirmalar tariflardan alohida: narx katalogini boshqaradigan xodim
    // "kimga qancha chegirma" qarorini ham qabul qila olmasligi kerak.
    key: SECTIONS.DISCOUNTS,
    label: "Chegirmalar",
    group: "Moliya",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "assign", label: "O'quvchiga biriktirish" },
    ],
  },
  {
    // Tariflardan alohida: narxlarni ko'rish huquqi butun qarzdorlik registrini
    // ochib bermasligi kerak.
    //
    // Amallar ataylab mayda: kassir `pay` oladi, lekin `void`/`refund`/
    // `transfer`/`accounts` olmaydi — bularning har biri pulni ota-onasiz
    // harakatlantiradi.
    key: SECTIONS.FINANCE,
    label: "Hisob-fakturalar va to'lovlar",
    group: "Moliya",
    actions: [
      A.view,
      { key: "generate", label: "Hisob-faktura shakllantirish" },
      { key: "pay", label: "To'lov qabul qilish" },
      { key: "void", label: "To'lovni bekor qilish" },
      { key: "refund", label: "Depozitni qaytarish" },
      { key: "status", label: "O'quvchi moliyaviy holati" },
      { key: "cancel", label: "Hisob-fakturani bekor qilish" },
      { key: "adjust", label: "Amaldagi yozuvni to'g'rilash" },
      { key: "accounts", label: "To'lov turlarini boshqarish" },
      { key: "transfer", label: "To'lov turlari orasida o'tkazma" },
      A.export,
      A.settings,
    ],
  },
  {
    // Qarzdorlar registri — moliyaning eng nozik KESIMI: bitta ekranda butun
    // maktabning qarzi va har bir o'quvchining necha oydan beri to'lamagani
    // ko'rinadi. Shuning uchun u `finance.view` dan ALOHIDA: undiruv bilan
    // shug'ullanadigan odamga ro'yxatni ochish uchun hisob-faktura registrini
    // va to'lov cheklarini ham berish shart emas.
    //
    // Bitta amal — bu ATAYLAB. To'lov qabul qilish `finance.pay` da qoladi:
    // ro'yxatni ko'rish va pulni harakatlantirish boshqa-boshqa mas'uliyat.
    key: SECTIONS.DEBTORS,
    label: "Qarzdorlar",
    group: "Moliya",
    actions: [
      A.view,
      // Eslatma maktabdan tashqariga chiqadi — ota-onaning telefoniga.
      // Ro'yxatni ko'rish ichki ish, xabar yuborish esa maktab nomidan
      // gapirish: shuning uchun alohida amal.
      { key: "remind", label: "Eslatma yuborish" },
    ],
  },
  {
    // Hisobotlar — moliyaning eng KENG kesimi: bitta ekranda butun maktabning
    // tushumi, qarzi, sinf va tarif bo'yicha taqsimoti ko'rinadi. Registrni
    // ko'rish huquqi (`finance.view`) bilan birga berilmaydi: kassirga kunlik
    // ish uchun registr kerak, butun maktabning moliyaviy manzarasi emas.
    key: SECTIONS.REPORTS,
    label: "Moliya hisobotlari",
    group: "Moliya",
    actions: [A.view],
  },
  {
    // Tashqi kirim — o'quvchi to'lovi BO'LMAGAN pul (ijara, sotuv, homiylik).
    // Amallar ATAYLAB mayda: kirim qo'sha oladigan xodim uni BEKOR QILA
    // olmasligi kerak — bekor qilish kassa qoldig'ini kamaytiradi va
    // to'lovni bekor qilish bilan bir xil og'irlikdagi amal.
    key: SECTIONS.INCOME,
    label: "Tashqi kirimlar",
    group: "Moliya",
    actions: [
      A.view,
      A.create,
      { key: "void", label: "Bekor qilish" },
      { key: "categories", label: "Kategoriyalarni boshqarish" },
    ],
  },
  {
    // XODIMLAR OYLIGI — chiqim tomonining o'quvchi registriga o'xshashi.
    // Amallar ATAYLAB mayda: qoida biriktirish (kimga qancha oylik) va
    // to'lash (pulni kassadan chiqarish) — ikki xil mas'uliyat. Buxgalter
    // to'laydi, lekin oylik miqdorini o'zi belgilay olmasligi kerak.
    key: SECTIONS.PAYROLL,
    label: "Xodimlar oyligi",
    group: "Moliya",
    actions: [
      A.view,
      { key: "assign", label: "Oylik belgilash" },
      { key: "generate", label: "Oylik shakllantirish" },
      { key: "pay", label: "To'lash" },
      { key: "void", label: "To'lovni bekor qilish" },
      { key: "cancel", label: "Majburiyatni bekor qilish" },
    ],
  },
  {
    // XARAJATLAR — kommunal, ta'mirlash, jihoz. Oylik BU YERDA EMAS.
    key: SECTIONS.EXPENSES,
    label: "Xarajatlar",
    group: "Moliya",
    actions: [
      A.view,
      A.create,
      { key: "void", label: "Bekor qilish" },
      { key: "categories", label: "Kategoriyalarni boshqarish" },
    ],
  },
  {
    // MODDIY-TEXNIK BAZA — xatlov: qaysi xonada nima va nechta bor.
    //
    // Moliyadan ALOHIDA guruh: xo'jalik mudiri partani sanaydi, lekin
    // maktabning qarzdorlik registrini ko'rmasligi kerak. Teskarisi ham
    // to'g'ri — kassirga jihoz katalogi kerak emas.
    //
    // Amallar ATAYLAB mayda: xatlovga jihoz KIRITISH (`stock`) va uni
    // HISOBDAN CHIQARISH (`writeoff`) — ikki xil og'irlikdagi amal.
    key: SECTIONS.INVENTORY,
    label: "Moddiy-texnik baza",
    group: "Inventar",
    actions: [
      A.view,
      { key: "catalog", label: "Jihoz katalogini boshqarish" },
      { key: "locations", label: "Xonalarni boshqarish" },
      { key: "stock", label: "Xatlovga jihoz kiritish" },
      { key: "transfer", label: "Xonalar orasida ko'chirish" },
      { key: "repair", label: "Ta'mirlanganini belgilash" },
      { key: "writeoff", label: "Hisobdan chiqarish" },
      { key: "adjust", label: "Qo'lda to'g'rilash" },
      A.export,
      A.settings,
    ],
  },
  {
    // KUNLIK MONITORING — hisobotni SINF RAHBARI yoki OSHXONA MUDIRI
    // yuboradi, xo'jalik mudiri emas. Shuning uchun `inventory` dan
    // alohida: hisobot berish huquqi butun katalogni va hisobdan chiqarish
    // tugmasini ochib bermasligi kerak.
    key: SECTIONS.MONITORING,
    label: "Kunlik monitoring",
    group: "Inventar",
    actions: [
      A.view,
      { key: "submit", label: "Hisobot yuborish" },
      A.delete,
      { key: "reports", label: "Hisobotlar" },
    ],
  },
  {
    // MODDIY ZARAR VA UNDIRUV — pulga tegadigan qism.
    //
    // Amallar ATAYLAB mayda va bu `finance` bilan bir xil mulohaza:
    // zararni QAYD ETADIGAN odam uni aybdorga YOZA olmasligi, aybdorga
    // yozadigan odam esa undiruvni BEKOR QILA olmasligi kerak.
    key: SECTIONS.DAMAGES,
    label: "Moddiy zarar",
    group: "Inventar",
    actions: [
      A.view,
      { key: "create", label: "Zarar qayd etish" },
      { key: "charge", label: "Aybdorga yozish" },
      { key: "waive", label: "Maktab hisobidan deb belgilash" },
      { key: "cancel", label: "Zarar / qarzni bekor qilish" },
      { key: "pay", label: "Undiruvni qabul qilish" },
      { key: "void", label: "Undiruvni bekor qilish" },
      { key: "reports", label: "Hisobotlar" },
      A.export,
    ],
  },
  {
    key: SECTIONS.HOLIDAYS,
    label: "Dam olish kunlari",
    group: "Boshqaruv",
    actions: [A.view, A.create, A.update, A.delete],
  },
  {
    key: SECTIONS.MONITORS,
    label: "Monitorlar",
    group: "Boshqaruv",
    actions: [A.view, A.update],
  },
  {
    key: SECTIONS.CHANGELOG,
    label: "O'zgarishlar tarixi",
    group: "Boshqaruv",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "send", label: "Qo'lda yuborish" },
      A.settings,
    ],
  },
  {
    key: SECTIONS.MESSAGES,
    label: "Xabarlar",
    group: "Ijtimoiy",
    actions: [
      A.view,
      { key: "create", label: "Xabar yuborish" },
      { key: "cancel", label: "Yuborishni bekor qilish" },
    ],
  },
  {
    key: SECTIONS.SOCIAL,
    label: "Ijtimoiy tarmoqlar",
    group: "Ijtimoiy",
    actions: [A.view, A.create, A.update, A.delete],
  },
  {
    key: SECTIONS.LEADS,
    label: "Sotuvlar",
    group: "Sotuvlar",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "status", label: "Holatni o'zgartirish" },
      { key: "activities", label: "Faoliyatlar" },
      { key: "analytics", label: "Analitika" },
      { key: "taxonomy", label: "Manba / yo'nalish / kategoriya" },
    ],
  },
];

/** Barcha ruxsat kalitlari: ["users.view", "users.create", ...] */
export const PERMISSION_KEYS = PERMISSION_SECTIONS.flatMap((s) =>
  s.actions.map((a) => `${s.key}.${a.key}`),
);

/** Tez tekshirish uchun (ro'yxatdagi har bir xodim uchun qayta hisoblanadi). */
const PERMISSION_KEY_SET = new Set(PERMISSION_KEYS);

/** Bo'lim kaliti → o'sha bo'limning barcha kalitlari. */
export const KEYS_BY_SECTION = PERMISSION_SECTIONS.reduce((acc, s) => {
  acc[s.key] = s.actions.map((a) => `${s.key}.${a.key}`);
  return acc;
}, {});

const SECTION_BY_KEY = PERMISSION_SECTIONS.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

/** `{ [group]: [section, ...] }` — modal UI ni guruhlab chizish uchun. */
export const SECTIONS_BY_GROUP = PERMISSION_SECTIONS.reduce((acc, s) => {
  (acc[s.group] ||= []).push(s);
  return acc;
}, {});

/** Bo'lim kaliti bo'yicha label: "users" → "Foydalanuvchilar". */
export const sectionLabel = (section) => SECTION_BY_KEY[section]?.label || section;

/** Amal kaliti bo'yicha label: "users.create" → "Qo'shish". */
export const actionLabel = (key = "") => {
  const [section, action] = key.split(".");
  const found = SECTION_BY_KEY[section]?.actions.find((a) => a.key === action);
  return found?.label || action || key;
};

/** To'liq label: "users.create" → "Foydalanuvchilar → Qo'shish". */
export const permissionLabel = (key = "") => {
  const [section, action] = key.split(".");
  if (!action) return sectionLabel(section);
  return `${sectionLabel(section)} → ${actionLabel(key)}`;
};

/**
 * Foydalanuvchida berilgan ruxsat bormi? (server `hasPermission` bilan bir xil)
 * Eski, amalga bo'linmagan bo'lim kaliti ham qabul qilinadi.
 */
export const hasPermission = (permissions = [], key) => {
  if (!key) return true;
  if (permissions.includes(key)) return true;
  return permissions.includes(key.split(".")[0]);
};

/** Bo'limda hech bo'lmasa bitta amal bormi? */
export const hasSection = (permissions = [], section) => {
  if (!section) return true;
  if (permissions.includes(section)) return true;
  return permissions.some((p) => p.startsWith(`${section}.`));
};

/** Eski bare bo'lim kalitlarini barcha amallariga yoyadi. */
export const expandLegacyKeys = (keys = []) => [
  ...new Set(keys.flatMap((k) => KEYS_BY_SECTION[k] || [k])),
];

/**
 * Berilgan amallar soni — eski bo'lim kalitlari yoyiladi, katalogda yo'qlari
 * hisobga olinmaydi.
 */
export const countGranted = (permissions = []) =>
  new Set(expandLegacyKeys(permissions).filter((k) => PERMISSION_KEY_SET.has(k))).size;

/**
 * Dedupe + har bir bo'lim uchun `.view` ni avtomatik qo'shadi (bo'limda biror
 * amal bo'lsa, uni ko'ra olishi ham kerak). Natija katalog tartibida qaytadi.
 */
export const normalizePermissions = (keys = []) => {
  const set = new Set(keys);

  for (const section of Object.keys(KEYS_BY_SECTION)) {
    if ([...set].some((k) => k.startsWith(`${section}.`))) {
      set.add(`${section}.view`);
    }
  }

  return PERMISSION_KEYS.filter((k) => set.has(k));
};

/**
 * Tahrirlash uchun kalitlar to'plami: eski bo'lim kalitlari yoyiladi, katalogda
 * yo'qlari tashlanadi, har bir bo'limga `.view` qo'shiladi. Ya'ni to'plam aynan
 * saqlanadigan ko'rinishda va katalog tartibida bo'ladi.
 */
export const toPermissionSet = (permissions = []) =>
  new Set(normalizePermissions(expandLegacyKeys(permissions)));

// Route prefiks → talab qilinadigan ruxsat kaliti. Sidebar filtri va route
// guard shu jadvaldan foydalanadi — sahifaga kirish uchun `.view` yetarli.
// `/roles` va `/permissions` grant qilinmaydi — kalitlari katalogda yo'q,
// shuning uchun can() ular uchun faqat owner'ga true qaytaradi (owner-only).
const ROUTE_PERMISSIONS = [
  { prefix: "/branches", key: "branches.view" },
  { prefix: "/users", key: "users.view" },
  { prefix: "/statistics", key: "statistics.view" },
  { prefix: "/attendance", key: "attendance.view" },
  { prefix: "/grades", key: "grades.view" },
  { prefix: "/schedules", key: "schedules.view" },
  { prefix: "/schedule-settings", key: "schedules.view" },
  { prefix: "/schedule-planner", key: "planner.view" },
  { prefix: "/topics", key: "topics.view" },
  { prefix: "/classes", key: "classes.view" },
  { prefix: "/subjects", key: "subjects.view" },
  { prefix: "/test-seasons", key: "tests.view" },
  { prefix: "/test-settings", key: "tests.view" },
  { prefix: "/market", key: "market.view" },
  { prefix: "/tasks", key: "tasks.view" },
  { prefix: "/penalties", key: "penalties.view" },
  { prefix: "/premium", key: "premium.view" },
  { prefix: "/coin-distribution", key: "coins.view" },
  { prefix: "/coin-settings", key: "coins.view" },
  // Moliya bo'limiga kirish `finance.view` bilan; katalog tablari esa
  // qo'shimcha o'z kalitini talab qiladi (eng UZUN mos prefiks yutadi).
  // Moliya hisobotlari bosh sahifaning "Moliya" tabida
  { prefix: "/reports", key: "reports.view" },
  { prefix: "/finance/main/income", key: "income.view" },
  { prefix: "/finance/main/payroll", key: "payroll.view" },
  { prefix: "/finance/main/expenses", key: "expenses.view" },
  { prefix: "/finance", key: "finance.view" },
  { prefix: "/finance/main/tariffs", key: "tariffs.view" },
  { prefix: "/finance/main/discounts", key: "discounts.view" },
  // Inventar bo'limiga kirish `inventory.view` bilan; monitoring va zarar
  // tablari esa o'z kalitini talab qiladi (eng UZUN mos prefiks yutadi).
  { prefix: "/inventory", key: "inventory.view" },
  { prefix: "/inventory/checks", key: "monitoring.view" },
  { prefix: "/inventory/damages", key: "damages.view" },
  { prefix: "/inventory/debtors", key: "damages.view" },
  { prefix: "/holidays", key: "holidays.view" },
  { prefix: "/monitors", key: "monitors.view" },
  { prefix: "/changelog", key: "changelog.view" },
  { prefix: "/messages", key: "messages.view" },
  { prefix: "/social-networks", key: "social.view" },
  { prefix: "/leads", key: "leads.view" },
  { prefix: "/roles", key: "roles" },
  { prefix: "/permissions", key: "permissions" },
];

/**
 * Berilgan yo'l (pathname yoki sidebar url) uchun talab qilinadigan ruxsat
 * kalitini qaytaradi. Hech bir prefiks mos kelmasa `null` (masalan "/",
 * "/profile" — doim ochiq). Eng aniq (uzun) mos kelgan prefiks tanlanadi.
 * @param {string} pathname
 * @returns {string|null}
 */
export const permissionForPath = (pathname = "") => {
  let match = null;
  for (const route of ROUTE_PERMISSIONS) {
    const hit = pathname === route.prefix || pathname.startsWith(`${route.prefix}/`);
    if (hit && (!match || route.prefix.length > match.prefix.length)) {
      match = route;
    }
  }
  return match?.key || null;
};
