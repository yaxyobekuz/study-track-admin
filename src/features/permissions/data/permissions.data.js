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
  EDUCATION: "education",
  ACHIEVEMENTS: "achievements",
  CLUBS: "clubs",
  SCHEDULES: "schedules",
  SCHEDULE_SYNC: "scheduleSync",
  PLANNER: "planner",
  SUBSTITUTIONS: "substitutions",
  TOPICS: "topics",
  CLASSES: "classes",
  SUBJECTS: "subjects",
  TESTS: "tests",
  DIAGNOSTICS: "diagnostics",
  MARKET: "market",
  TASKS: "tasks",
  PENALTIES: "penalties",
  PREMIUM: "premium",
  COINS: "coins",
  TARIFFS: "tariffs",
  DISCOUNTS: "discounts",
  SERVICES: "services",
  FINANCE: "finance",
  DEBTORS: "debtors",
  REPORTS: "reports",
  INCOME: "income",
  PAYROLL: "payroll",
  PAYROLL_REQUESTS: "payrollRequests",
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
  ACTIVITY: "activity",
  SECURITY: "security",
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
      // TELEFON — `update` DAN ALOHIDA. Raqam maktabdan TASHQARIGA
      // qo'ng'iroq qilish yo'li (davomatdagi "Qo'ng'iroq" tugmasi shu
      // raqamga boradi), shuning uchun uni kim tahrirlashini owner o'zi
      // hal qiladi. Boshida faqat owner'da bo'ladi. O'quvchi o'z raqamini
      // o'zgartira olmaydi.
      { key: "phone", label: "Telefon raqamini tahrirlash" },
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
    // TA'LIM DASHBOARDI — bitta ekranda butun maktabning o'quv manzarasi.
    //
    // ⚠️ `grades.view` DAN ALOHIDA: baholar jurnalini ko'rish huquqi bitta
    // sinfning kunlik ishi, dashboard esa butun maktabning kesimi
    // (o'qituvchilar KPI si, sinflar reytingi). Moliya tomonida ham
    // `reports.view` shu sababdan `finance.view` dan ajratilgan.
    //
    // `plan` — reja belgilash. Amaldagi qiymat DOIM hisoblanadi, reja esa
    // "bajarildi" ko'rinishini o'zgartiradi, shuning uchun alohida amal.
    key: SECTIONS.EDUCATION,
    label: "Ta'lim dashboardi",
    group: "Ta'lim",
    actions: [A.view, { key: "plan", label: "Reja belgilash" }],
  },
  {
    // Olimpiada va musobaqa yutuqlari — tashqi hodisa qaydi.
    key: SECTIONS.ACHIEVEMENTS,
    label: "Olimpiada yutuqlari",
    group: "Ta'lim",
    actions: [A.view, A.create, A.update, A.delete],
  },
  {
    // To'garaklar va ularning a'zolari.
    //
    // `members` ALOHIDA amal: to'garak ochish — ma'muriy qaror, a'zo
    // biriktirish esa kunlik ish va uni to'garak rahbariga berish mumkin.
    key: SECTIONS.CLUBS,
    label: "To'garaklar",
    group: "Ta'lim",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "members", label: "A'zolarni boshqarish" },
    ],
  },
  {
    key: SECTIONS.SCHEDULES,
    label: "Dars jadvali",
    group: "Ta'lim",
    actions: [A.view, A.create, A.update, A.delete, A.export, A.settings],
  },
  {
    // Dars jadvalini Google Sheets orqali boshqarish.
    //
    // ⚠️ ALOHIDA BO'LIM, `schedules` ichidagi amal EMAS. Eski yozuvlardagi
    // bare "schedules" kaliti o'z bo'limining HAMMA amalini beradi
    // (`hasPermission`, `expandLegacyKeys`). Bu amallar o'sha yerda bo'lsa,
    // "Dars jadvali" ga eski umumiy ruxsati bor har kim butun maktab
    // jadvalini almashtira olardi — owner hech kimga bermagan bo'lsa ham.
    //
    // `review` — kunlik ish (o'zgarishni ko'rish, nomlarni moslash,
    // qo'llash / rad etish). `source` — butun maktab jadvalini bir bosishda
    // almashtiradigan qaror (manba, havola, versiyani tiklash).
    //
    // ⚠️ Server katalogi bilan QO'LDA sinxron: `server/src/utils/permissions.js`.
    key: SECTIONS.SCHEDULE_SYNC,
    label: "Google Sheets jadvali",
    group: "Ta'lim",
    actions: [
      A.view,
      { key: "review", label: "O'zgarishlarni ko'rib chiqish va qo'llash" },
      { key: "source", label: "Manbani almashtirish va versiyani tiklash" },
    ],
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
    // DIAGNOSTIKA — mavjud "Testlar" bo'limidan ALOHIDA.
    //
    // ⚠️ Ikkalasi bir xil ko'rinsa ham, boshqa savolga javob beradi:
    // "Testlar" — MAVSUM bo'yicha baho qo'yish (natija jurnalga tushadi,
    // tanga taqsimlanadi), "Diagnostika" — o'quvchi QAYERDA turganini
    // o'lchash (baho qo'yilmaydi, kamchilik va reja chiqadi). Bitta
    // bo'limga qo'shilsa, test mavsumini boshqaradigan odam avtomatik
    // ravishda har bir o'quvchining zaif tomonlari ro'yxatini ham olardi.
    //
    // ⚠️ SERVER BILAN QO'LDA SINXRON: `server/src/utils/permissions.js`.
    key: SECTIONS.DIAGNOSTICS,
    label: "Diagnostika",
    group: "Ta'lim",
    actions: [
      A.view,
      A.create,
      A.update,
      A.delete,
      { key: "questions", label: "Savollar bazasi" },
      { key: "moderate", label: "Savolni tasdiqlash" },
      { key: "attempts", label: "O'quvchilar natijalari" },
      { key: "analytics", label: "Tahlil" },
      { key: "ai", label: "AI tahlilini ishga tushirish" },
      A.settings,
      A.export,
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
    // Qo'shimcha xizmatlar (yotoqxona, ovqat, ...) — chegirmalar uslubida
    // alohida bo'lim: xizmat katalogini boshqaradigan xodim tarif/chegirma
    // qarorlarini ham qabul qila olmasligi kerak.
    key: SECTIONS.SERVICES,
    label: "Qo'shimcha xizmatlar",
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
    label: "Moliya hisobotlari va dashboard",
    group: "Moliya",
    actions: [
      A.view,
      // REJA (byudjet) — ko'rishdan ALOHIDA. Rejani o'zgartirish
      // "bajarilish 78%" ni "bajarilish 100%" ga aylantiradigan yagona
      // tugma, ya'ni hisobotni chiroyli qilib qo'yish yo'li.
      { key: "plan", label: "Reja (byudjet) belgilash" },
    ],
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
    // DARS O'RINBOSARLIGI — "kim kimning o'rniga dars o'tadi".
    //
    // ⚠️ ATAMA: "almashtirish" EMAS — u tizimda FILIAL almashtirishni
    // bildiradi. Yorliqlarda "o'rinbosar".
    //
    // Amallar ATAYLAB mayda: o'rinbosarlik BIR VAQTDA uch narsani
    // harakatlantiradi — jurnal huquqini, jarima mas'uliyatini va
    // OYLIKNI. Bekor qilish esa o'tgan davr soatini egasiga qaytaradi,
    // ya'ni pulga tegadi.
    //
    // ⚠️ Server katalogi bilan QO'LDA sinxron:
    // `server/src/utils/permissions.js`.
    key: SECTIONS.SUBSTITUTIONS,
    label: "Dars o'rinbosarligi",
    group: "Ta'lim",
    actions: [
      A.view,
      { key: "create", label: "O'rinbosar biriktirish" },
      { key: "cancel", label: "Bekor qilish / o'chirish" },
    ],
  },
  {
    key: SECTIONS.PAYROLL,
    label: "Xodimlar oyligi",
    group: "Moliya",
    actions: [
      A.view,
      { key: "assign", label: "Oylik belgilash" },
      // DARS SOATI HISOBOTI — `view` DAN ALOHIDA. `payroll.view` qarzdorlik
      // registri ("kimga qancha qarzdormiz"), bu esa butun shtatning dars
      // yuklamasi va jonli maosh prognozi: boshqa savol, boshqa qaror.
      { key: "hours", label: "Dars soatlari hisoboti" },
      { key: "generate", label: "Oylik shakllantirish" },
      { key: "pay", label: "To'lash" },
      { key: "void", label: "To'lovni bekor qilish" },
      { key: "cancel", label: "Majburiyatni bekor qilish" },
    ],
  },
  {
    // OYLIK ZAYAVKALARI — o'qituvchi/xodim o'zi uchun TOIFA o'zgartirish yoki
    // USTAMA haq so'raydi (hujjat biriktirib). Ko'rib chiqish oylik miqdoriga
    // TA'SIR QILADI — shuning uchun alohida bo'lim (server bilan qo'lda sinxron).
    key: SECTIONS.PAYROLL_REQUESTS,
    label: "Oylik zayavkalari",
    group: "Moliya",
    actions: [
      A.view,
      { key: "review", label: "Ko'rib chiqish (tasdiqlash / rad etish)" },
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
      // ⚠️ DASHBOARD — `view` DAN ALOHIDA. `inventory.view` xatlov ekrani
      // ("shu xonada nechta parta bor"), dashboard esa butun bo'limning
      // kesimi va uning ichida PUL bor: bazaning qiymati, zarar summasi,
      // qarzdorlik qoldig'i. Server tomonidagi izoh to'liqroq
      // (`server/src/utils/permissions.js`).
      { key: "dashboard", label: "Dashboard (umumiy tahlil)" },
      { key: "catalog", label: "Jihoz katalogini boshqarish" },
      { key: "locations", label: "Xonalarni boshqarish" },
      { key: "stock", label: "Xatlovga jihoz kiritish" },
      { key: "transfer", label: "Xonalar orasida ko'chirish" },
      { key: "repair", label: "Ta'mirlanganini belgilash" },
      { key: "writeoff", label: "Hisobdan chiqarish" },
      { key: "adjust", label: "Qo'lda to'g'rilash" },
      // ⚠️ O'CHIRISH — `writeoff` EMAS va u bilan almashtirilmaydi.
      // Hisobdan chiqarish HODISANI qayd etadi: jihoz bor edi, endi yo'q —
      // daftarga qator yoziladi va tarix saqlanadi ("qachon, kim, nechta").
      // O'chirish esa yozuvning O'ZI bo'lmasligi kerakligini bildiradi
      // (KIRITISH XATOSI: noto'g'ri xonaga kiritilgan qator, ikki marta
      // kiritilgan jihoz) — u daftar qatorlarini ham olib tashlaydi.
      // Shuning uchun alohida kalit: hisobdan chiqara oladigan xo'jalik
      // mudiri tarixni o'chira olmasligi kerak.
      A.delete,
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
  {
    // FAOLLIK — "tizimdan KIM foydalanyapti?".
    //
    // ⚠️ `statistics.view` DAN ALOHIDA: statistika NATIJANI o'lchaydi
    // (baho, davomat, tushum), faollik esa JALB QILINGANLIKNI — ota-ona
    // botni ochdimi, o'qituvchi panelga kirdimi. Ikkinchisi kadrlar
    // qarori.
    //
    // ⚠️ `roster` ALOHIDA AMAL. Umumiy foizni ko'rish huquqi
    // FOYDALANMAYOTGANLARNING ISM-RO'YXATINI ochmasligi kerak:
    // birinchisi hisobot, ikkinchisi aniq odamlar haqidagi ma'lumot va
    // u bilan ota-onaga qo'ng'iroq qilinadi.
    key: SECTIONS.ACTIVITY,
    label: "Faollik",
    group: "Nazorat",
    actions: [
      A.view,
      { key: "roster", label: "Foydalanmayotganlar ro'yxati" },
      { key: "sessions", label: "Foydalanuvchi tafsiloti" },
      A.export,
    ],
  },
  {
    // XAVFSIZLIK — "hisobga KIM kirdi?".
    //
    // ⚠️ AMALLAR ATAYLAB MAYDA (moliyadagi bilan bir xil mantiq):
    // `sessions` — IP va qurilma bilan ro'yxat (shaxsiy ma'lumot),
    // `revoke` — birovni tizimdan CHIQARIB YUBORISH, `alerts` —
    // ogohlantirishlarni yopish. `revoke` alohida turadi, chunki u
    // boshqa odamning ochiq ishini uzadi.
    key: SECTIONS.SECURITY,
    label: "Xavfsizlik",
    group: "Nazorat",
    actions: [
      A.view,
      { key: "sessions", label: "Seanslar ro'yxati" },
      { key: "revoke", label: "Seansni tugatish" },
      { key: "alerts", label: "Ogohlantirishlarni boshqarish" },
      A.export,
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

/**
 * Amal kaliti bo'yicha label: "users.create" → "Qo'shish".
 * Kalitlar ro'yxati (`ROUTE_PERMISSIONS` dagi "istalgan biri") " / " bilan.
 */
export const actionLabel = (key = "") => {
  if (Array.isArray(key)) return key.map(actionLabel).join(" / ");
  const [section, action] = key.split(".");
  const found = SECTION_BY_KEY[section]?.actions.find((a) => a.key === action);
  return found?.label || action || key;
};

/** To'liq label: "users.create" → "Foydalanuvchilar → Qo'shish". */
export const permissionLabel = (key = "") => {
  if (Array.isArray(key)) return key.map(permissionLabel).join(" / ");
  const [section, action] = key.split(".");
  if (!action) return sectionLabel(section);
  return `${sectionLabel(section)} → ${actionLabel(key)}`;
};

/**
 * Foydalanuvchida berilgan ruxsat bormi? (server `hasPermission` bilan bir xil)
 * Eski, amalga bo'linmagan bo'lim kaliti ham qabul qilinadi.
 *
 * Kalitlar RO'YXATI — "istalgan biri" (any-of): sahifaga bir nechta
 * amaldan istalgani bilan kirish mumkin bo'lganda (`ROUTE_PERMISSIONS`).
 * ⚠️ Ro'yxat `.split` dan OLDIN tekshiriladi — massivda `split` yo'q.
 *
 * @param {string[]} permissions
 * @param {string|string[]|null} key
 */
export const hasPermission = (permissions = [], key) => {
  if (Array.isArray(key)) {
    return key.length === 0 || key.some((k) => hasPermission(permissions, k));
  }
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

/**
 * Google Sheets jadvali bo'limiga kirish — uchala amaldan ISTALGAN biri.
 *
 * `view` ni avtomatik qo'shish (`normalizePermissions`) eski yozuvlarda
 * bo'lmasligi mumkin: faqat `review` yoki `source` berilgan odam ham
 * sahifani ochishi kerak. Sidebar, route guard va "Dars jadvali"
 * sahifasidagi tugma shu bitta ro'yxatdan o'qiydi.
 */
export const SCHEDULE_SYNC_ACCESS = [
  "scheduleSync.view",
  "scheduleSync.review",
  "scheduleSync.source",
];

// Route prefiks → talab qilinadigan ruxsat kaliti. Sidebar filtri va route
// guard shu jadvaldan foydalanadi — sahifaga kirish uchun `.view` yetarli.
// `/roles` va `/permissions` grant qilinmaydi — kalitlari katalogda yo'q,
// shuning uchun can() ular uchun faqat owner'ga true qaytaradi (owner-only).
//
// `key` RO'YXAT bo'lishi mumkin — "istalgan biri" (`hasPermission`).
const ROUTE_PERMISSIONS = [
  { prefix: "/branches", key: "branches.view" },
  { prefix: "/users", key: "users.view" },
  { prefix: "/statistics", key: "statistics.view" },
  { prefix: "/attendance", key: "attendance.view" },
  { prefix: "/grades", key: "grades.view" },
  { prefix: "/schedules", key: "schedules.view" },
  // ⚠️ `/schedules` dan UZUNROQ — eng uzun mos prefiks yutadi. Aks holda
  // sahifa `schedules.view` bilan ochilib ketardi (bo'limlar alohida).
  { prefix: "/schedules/sheets", key: SCHEDULE_SYNC_ACCESS },
  { prefix: "/schedule-settings", key: "schedules.view" },
  { prefix: "/schedule-planner", key: "planner.view" },
  { prefix: "/topics", key: "topics.view" },
  { prefix: "/classes", key: "classes.view" },
  { prefix: "/subjects", key: "subjects.view" },
  { prefix: "/test-seasons", key: "tests.view" },
  { prefix: "/test-settings", key: "tests.view" },
  // Diagnostika — bo'limga kirish `diagnostics.view` bilan; ichki tablar
  // o'z kalitini talab qiladi (eng UZUN mos prefiks yutadi).
  { prefix: "/diagnostics", key: "diagnostics.view" },
  { prefix: "/diagnostics/questions", key: "diagnostics.questions" },
  { prefix: "/diagnostics/attempts", key: "diagnostics.attempts" },
  // ⚠️ KESIM EKRANLARI `diagnostics.analytics` ORTIDA: ular butun
  // registrni (sinf, fan, mavzu, o'quvchi) ochadi, `diagnostics.view`
  // esa faqat bo'limga kirish huquqi.
  { prefix: "/diagnostics/classes", key: "diagnostics.analytics" },
  { prefix: "/diagnostics/subjects", key: "diagnostics.analytics" },
  { prefix: "/diagnostics/topics", key: "diagnostics.analytics" },
  { prefix: "/diagnostics/students", key: "diagnostics.analytics" },
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
  { prefix: "/finance/main/dashboard", key: "reports.view" },
  { prefix: "/finance/main/income", key: "income.view" },
  { prefix: "/finance/main/payroll", key: "payroll.view" },
  { prefix: "/finance/main/salary-requests", key: "payrollRequests.view" },
  { prefix: "/finance/main/expenses", key: "expenses.view" },
  { prefix: "/finance", key: "finance.view" },
  { prefix: "/finance/main/tariffs", key: "tariffs.view" },
  { prefix: "/finance/main/discounts", key: "discounts.view" },
  // Dars soatlari — ichida ikki xil ruxsatli tab bor, shuning uchun
  // eng UZUN prefiks yutadigan qoidaga tayanamiz: bo'limga kirish
  // `payroll.hours` bilan, o'rinbosarlik tabiga esa o'z kaliti bilan.
  { prefix: "/lesson-hours/substitutions", key: "substitutions.view" },
  { prefix: "/lesson-hours", key: "payroll.hours" },
  // Bosh sahifadagi "Dars soatlari" tabi — `/lesson-hours/overview` bilan
  // AYNI sahifa, shuning uchun kalit ham bir xil (moliya `/reports` bilan
  // bir xil naqsh).
  { prefix: "/lesson-load", key: "payroll.hours" },
  // Inventar dashboardi bosh sahifaning "Inventar" tabida — moliya
  // hisobotlari `/reports` da turgani bilan bir xil naqsh
  { prefix: "/equipment", key: "inventory.dashboard" },
  // Inventar bo'limiga kirish `inventory.view` bilan; monitoring va zarar
  // tablari esa o'z kalitini talab qiladi (eng UZUN mos prefiks yutadi).
  { prefix: "/inventory", key: "inventory.view" },
  { prefix: "/inventory/dashboard", key: "inventory.dashboard" },
  { prefix: "/inventory/checks", key: "monitoring.view" },
  { prefix: "/inventory/damages", key: "damages.view" },
  { prefix: "/inventory/debtors", key: "damages.view" },
  // Sozlamalar sahifasi faqat `inventory.settings` bilan: tab ham shu kalit
  // bilan yashiriladi, sidebar va guard undan farq qilmasligi kerak
  { prefix: "/inventory/settings", key: "inventory.settings" },
  { prefix: "/holidays", key: "holidays.view" },
  { prefix: "/monitors", key: "monitors.view" },
  { prefix: "/changelog", key: "changelog.view" },
  { prefix: "/messages", key: "messages.view" },
  { prefix: "/social-networks", key: "social.view" },
  { prefix: "/leads", key: "leads.view" },
  // Faollik va xavfsizlik — "Boshqaruv" guruhida, ikkalasi ham o'z
  // bo'limi. Faollik bosh sahifaning tabida ham ochiladi (`/pulse`),
  // moliya `/reports` da turgani bilan bir xil naqsh.
  { prefix: "/pulse", key: "activity.view" },
  { prefix: "/activity", key: "activity.view" },
  { prefix: "/security", key: "security.view" },
  // Bosh sahifadagi "Xavfsizlik" tabi — `/security` bilan ayni sahifa
  { prefix: "/watch", key: "security.view" },
  { prefix: "/roles", key: "roles" },
  { prefix: "/permissions", key: "permissions" },
];

/**
 * Berilgan yo'l (pathname yoki sidebar url) uchun talab qilinadigan ruxsat
 * kalitini qaytaradi. Hech bir prefiks mos kelmasa `null` (masalan "/",
 * "/profile" — doim ochiq). Eng aniq (uzun) mos kelgan prefiks tanlanadi.
 *
 * ⚠️ Kalitlar ro'yxati ("istalgan biri") qaytishi mumkin — natijani faqat
 * `can()` / `hasPermission` ga bering, `.split` qilmang.
 * @param {string} pathname
 * @returns {string|string[]|null}
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
