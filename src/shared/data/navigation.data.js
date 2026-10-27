/**
 * Sidebar navigatsiyasi — YAGONA MANBA.
 *
 * Ikki joy o'qiydi: `AppSidebar` (menyu) va global qidiruv modali
 * (sahifalar bo'limi). Shuning uchun ro'yxat komponent ichida emas, shu
 * faylda turadi — aks holda qidiruvga yangi sahifa qo'shilmay qolardi.
 *
 * ⚠️ Ruxsat bu yerda FILTRLANMAYDI. Har bir yo'l uchun kalit
 * `permissionForPath` dan olinadi va ko'rsatuvchi tomonda kesiladi
 * (`AppSidebar` da menyu, qidiruvda natija) — ro'yxatning o'zi esa
 * to'liq qoladi.
 */

// Icons
import {
  Home,
  Hash,
  Store,
  BookOpen,
  Settings2,
  UserPlus,
  UserRound,
  AlertTriangle,
  MessageSquareWarning,
  BadgeDollarSign,
  Crown,
  Wallet,
  Boxes,
  Radar,
  Brain,
  Timer,
  Sparkles,
} from "lucide-react";

export const navItems = [
  {
    title: "Asosiy",
    url: "/",
    icon: Home,
    isActive: true,
    items: [
      {
        title: "Bosh sahifa",
        url: "/",
      },
      {
        title: "Filiallar",
        url: "/branches",
      },
      {
        title: "Filiallararo ko'chirish",
        url: "/transfers",
      },
      {
        title: "Xodimlar",
        url: "/users/staff",
      },
      {
        title: "O'quvchilar",
        url: "/users/students",
      },
      {
        title: "Statistika",
        url: "/statistics",
      },
      {
        // LAVOZIMLAR MARKAZI — bitta sahifa, ichida tablar (Dashboard /
        // Topshiriqlar / Hisobotlar / Sozlamalar), moliya bo'limi kabi.
        // Tablar ruxsat bo'yicha `TasksLayout` ichida filtrlanadi.
        //
        // ⚠️ YO'L `/tasks` BO'LIB QOLADI: ruxsat kaliti (`tasks.*`), server
        // yo'li va saqlangan havolalar o'shanga bog'langan — nomi
        // o'zgargani bilan kalitlar o'zgarmaydi.
        title: "Lavozimlar markazi",
        url: "/tasks",
      },
    ],
  },
  {
    // AI YORDAMCHI — FAQAT TIZIM EGASI (`ownerOnly`).
    //
    // ⚠️ Ruxsat filtri ham uni yashiradi (`/ai-assistant` kaliti berilmaydi),
    // lekin `ownerOnly` niyatni aniq yozadi: bo'lim ROLGA bog'liq, va kimdir
    // kelajakda kalitni katalogga qo'shib yuborsa ham u xodimlarga
    // ko'rinib qolmaydi.
    title: "AI yordamchi",
    icon: Sparkles,
    isActive: false,
    ownerOnly: true,
    items: [
      {
        title: "Suhbat",
        url: "/ai-assistant",
      },
      {
        title: "Amallar tarixi",
        url: "/ai-assistant/actions",
      },
    ],
  },
  {
    // SHAXSIY — XODIMNING O'ZI HAQIDA, RUXSAT TALAB QILMAYDI.
    //
    // ⚠️ Ma'muriy bo'limlar bilan chalkashtirmang: "Ta'lim → Davomat"
    // boshqalarning davomati (`attendance.view`), "Moliya → Xodimlar
    // oyligi" esa butun shtatning oyligi (`payroll.view`). Bu yerdagilar —
    // xodimning O'ZI kelgan-ketgani va O'Z oyligi; server ham ularni faqat
    // `protect` bilan himoyalaydi va identifikatorni TOKENDAN oladi.
    //
    // Ilgari bu ekranlar faqat o'qituvchi va xodim panellarida bo'lgani
    // uchun admin panelga kiradigan rahbar/ma'mur o'zini davomatdan
    // o'tkaza olmasdi va o'z oyligini ko'ra olmasdi — holbuki ular ham
    // ishga keladi va oylik oladi.
    //
    // `hideForOwner` — owner'da davomat yozuvi ham, oylik ham YO'Q
    // (`attendance.service.js` uni `student` bilan birga rad etadi),
    // shuning uchun unga hech qachon ishlamaydigan bo'lim ko'rsatilmaydi.
    title: "Shaxsiy",
    icon: UserRound,
    isActive: false,
    hideForOwner: true,
    items: [
      {
        title: "Mening davomatim",
        url: "/my-attendance",
      },
      {
        // ⚠️ Ruxsat kaliti YO'Q: topshiriq istalgan roldagi xodimga
        // berilishi mumkin (direktor, moliyachi, ma'mur) va u o'ziga
        // berilgan ishni ko'ra olishi SHART.
        title: "Topshiriqlarim",
        url: "/my-tasks",
      },
      {
        title: "Mening oyligim",
        url: "/my-salary",
      },
    ],
  },
  {
    title: "Ta'lim",
    url: "/classes",
    icon: BookOpen,
    isActive: false,
    items: [
      {
        title: "Davomat",
        url: "/attendance",
      },
      {
        title: "Baholar jurnali",
        url: "/grades",
      },
      {
        title: "Baholar tahlili",
        url: "/grade-analysis",
      },
      {
        title: "Dars jadvali",
        url: "/schedules",
      },
      {
        // Alohida ruxsat bo'limi (`scheduleSync.*`, istalgan biri) —
        // `permissionForPath` uni o'zi filtrlaydi.
        title: "Google Sheets",
        url: "/schedules/sheets",
      },
      {
        title: "Dars jadvalini rejalashtirish",
        url: "/schedule-planner",
      },
      {
        title: "Dars jadvali sozlamalari",
        url: "/schedule-settings",
      },
      {
        title: "Dars mavzulari",
        url: "/topics",
      },
      {
        title: "Sinflar",
        url: "/classes",
      },
      {
        // Ko'chirilganlar / sinfdan chiqarilganlar, sababi bilan —
        // alohida ruxsat (`classes.history`), `permissionForPath` filtrlaydi
        title: "Sinf o'zgarishlari",
        url: "/classes/changes",
      },
      {
        // O'quvchi ERP va Kundalik.com da bormi — belgi va Excel ro'yxatlari.
        // Alohida ruxsat (`studentSystems.*`), `permissionForPath` filtrlaydi
        title: "ERP va Kundalik.com",
        url: "/student-systems",
      },
      {
        // Kim qaysi sertifikatni qachon topshirmoqchi — reja, muddat,
        // mavzu progressi va statistika. Alohida ruxsat (`certificates.*`)
        title: "Sertifikat rejalari",
        url: "/certificates",
      },
      {
        title: "Fanlar",
        url: "/subjects",
      },
      {
        title: "Test mavsumlari",
        url: "/test-seasons",
      },
      {
        title: "Test sozlamalari",
        url: "/test-settings",
      },
    ],
  },
  {
    // DIAGNOSTIKA — "Ta'lim" guruhidan ALOHIDA bo'lim.
    //
    // ⚠️ "Test mavsumlari" bilan chalkashtirmang: u MAVSUM bo'yicha baho
    // qo'yadi (natija jurnalga tushadi, tanga taqsimlanadi), diagnostika
    // esa o'quvchi QAYERDA turganini o'lchaydi — baho qo'yilmaydi,
    // kamchilik va o'quv rejasi chiqadi. Ular alohida ruxsat bo'limlari
    // (`tests` va `diagnostics`) va bir-birining ma'lumotini ochmaydi.
    //
    // Bo'g'inlar ichki tablar bilan ochiladi (`DiagnosticsLayout`), lekin
    // yon menyuda ham turadi: har biri o'z ruxsati ortida va
    // `permissionForPath` ularni avtomatik filtrlaydi.
    title: "Diagnostika",
    url: "/diagnostics",
    icon: Brain,
    isActive: false,
    items: [
      {
        title: "Umumiy manzara",
        url: "/diagnostics",
      },
      {
        title: "Savollar bazasi",
        url: "/diagnostics/questions",
      },
      {
        title: "Diagnostika testlari",
        url: "/diagnostics/tests",
      },
      // ⚠️ KESIMLAR KENGDAN TORGA: sinf → fan → mavzu → o'quvchi.
      // Tartib ichki tablar bilan AYNI — yon menyu va tab qatori
      // boshqa-boshqa tartibda bo'lsa, foydalanuvchi har safar
      // qidirib yurardi.
      {
        title: "Sinflar kesimi",
        url: "/diagnostics/classes",
      },
      {
        title: "Fanlar kesimi",
        url: "/diagnostics/subjects",
      },
      {
        title: "Mavzular kesimi",
        url: "/diagnostics/topics",
      },
      {
        // "Reytingi" — pastdagi "natijalari" bilan chalkashmasligi
        // uchun: biri o'quvchilar ro'yxati, ikkinchisi urinishlar.
        title: "O'quvchilar reytingi",
        url: "/diagnostics/students",
      },
      {
        title: "O'quvchilar natijalari",
        url: "/diagnostics/attempts",
      },
    ],
  },
  {
    title: "Do'kon",
    icon: Store,
    isActive: false,
    items: [
      {
        title: "Mahsulotlar",
        url: "/market/products",
      },
      {
        title: "Buyurtmalar",
        url: "/market/orders",
      },
    ],
  },
  {
    // MUAMMOLAR — bitta sahifa, ichida tablar (Muammolar / Hisobotlar /
    // Kategoriyalar), topshiriqlar bo'limi kabi. Tablar ruxsat bo'yicha
    // `IssuesLayout` ichida filtrlanadi, yon menyudagi bo'g'inlar esa
    // `permissionForPath` orqali (eng uzun mos prefiks yutadi).
    title: "Muammolar",
    icon: MessageSquareWarning,
    isActive: false,
    items: [
      {
        title: "Murojaatlar",
        url: "/issues",
      },
      {
        title: "Hisobotlar",
        url: "/issues/reports",
      },
      {
        title: "Kategoriyalar",
        url: "/issues/categories",
      },
    ],
  },
  {
    title: "Jarimalar",
    icon: AlertTriangle,
    isActive: false,
    items: [
      {
        title: "Jarimalar ro'yxati",
        url: "/penalties",
      },
      {
        title: "Kategoriyalar",
        url: "/penalties/categories",
      },
      {
        title: "Kamaytirish paketlari",
        url: "/penalties/reduction-packages",
      },
      {
        title: "Sozlamalar",
        url: "/penalties/settings",
      },
    ],
  },
  {
    title: "MBSI Premium",
    icon: Crown,
    isActive: false,
    items: [
      {
        title: "Hisobot",
        url: "/premium",
      },
      {
        title: "Emojilar",
        url: "/premium/emojis",
      },
      {
        title: "Sozlamalar",
        url: "/premium/settings",
      },
    ],
  },
  {
    title: "Tangalar",
    icon: BadgeDollarSign,
    isActive: false,
    items: [
      {
        title: "Tarqatish/Olish",
        url: "/coin-distribution",
      },
      {
        title: "Sozlamalar",
        url: "/coin-settings",
      },
    ],
  },
  {
    // DARS SOATLARI — moliyadan ALOHIDA guruh va bu ataylab.
    //
    // Bo'lim ikki auditoriyaga xizmat qiladi: boshliq maosh rejimini
    // belgilaydi (`payroll.hours`), o'quv ishlari mas'uli esa kasal
    // o'qituvchining darsini ko'chiradi (`substitutions.*`). Ikkinchisiga
    // moliya bo'limini ochib berish "dars ko'chirish uchun qarzdorlik
    // registrini ham ko'r" degani bo'lardi.
    //
    // ⚠️ Bo'g'inlar RUXSAT bo'yicha o'zi filtrlanadi (`permissionForPath`),
    // shuning uchun bu yerda hech qanday shart yozilmaydi.
    title: "Dars soatlari",
    icon: Timer,
    isActive: false,
    items: [
      {
        title: "Ko'rsatkichlar",
        url: "/lesson-hours/overview",
      },
      {
        title: "Vedomost",
        url: "/lesson-hours/ledger",
      },
      {
        title: "O'rinbosarlik",
        url: "/lesson-hours/substitutions",
      },
    ],
  },
  {
    title: "Moliya",
    icon: Wallet,
    isActive: false,
    items: [
      {
        title: "Asosiy",
        url: "/finance/main",
      },
    ],
  },
  {
    // INVENTAR — moliyadan alohida guruh: xo'jalik mudiri partani sanaydi,
    // lekin maktabning qarzdorlik registrini ko'rmasligi kerak.
    title: "Inventar",
    icon: Boxes,
    isActive: false,
    items: [
      {
        title: "Umumiy",
        url: "/inventory/overview",
      },
      {
        title: "Kunlik hisobot",
        url: "/inventory/checks",
      },
      {
        title: "Zararlar",
        url: "/inventory/damages",
      },
      {
        title: "Qarzdorlar",
        url: "/inventory/debtors",
      },
      {
        title: "Xatlov",
        url: "/inventory/stock",
      },
      {
        title: "Katalog",
        url: "/inventory/catalog",
      },
      {
        title: "Sozlamalar",
        url: "/inventory/settings",
      },
    ],
  },
  {
    title: "Boshqaruv",
    url: "/users",
    icon: Settings2,
    isActive: false,
    items: [
      {
        title: "Rollar",
        url: "/roles",
      },
      {
        title: "Ruxsatlar",
        url: "/permissions",
      },
      {
        title: "Dam olish kunlari",
        url: "/holidays",
      },
      {
        title: "Monitorlar",
        url: "/monitors",
      },
      {
        title: "O'zgarishlar tarixi",
        url: "/changelog",
      },
    ],
  },
  {
    // NAZORAT — "Boshqaruv" dan ALOHIDA guruh va bu ataylab.
    //
    // "Boshqaruv" tizimni SOZLAYDI (rollar, ruxsatlar, dam olish
    // kunlari, monitorlar). Bu ikkisi esa tizimni KUZATADI: kim
    // foydalanyapti va kim kirdi. Ular sozlama emas, HISOBOT — va
    // ikkalasi ham shaxsiy ma'lumot bilan ishlaydi (kimning qachon
    // kirgani, qaysi IP dan). Bitta guruhga qo'shilsa, "sozlamalarga
    // kira olsin" degan qaror jimgina "hammaning kirish tarixini
    // ko'rsin" degan qarorga aylanardi.
    title: "Nazorat",
    url: "/activity",
    icon: Radar,
    isActive: false,
    items: [
      {
        title: "Faollik",
        url: "/activity",
      },
      {
        title: "Xavfsizlik",
        url: "/security",
      },
      // QURILMA NAZORATI — shu guruhda va bu ataylab. Faollik "kim
      // foydalanyapti", xavfsizlik "kim kirdi", bu esa "o'quvchi
      // telefonida nima ochiladi" degan savolga javob beradi: uchalasi
      // ham KUZATUV/NAZORAT, sozlama emas. Bo'g'inlar ichki tablar bilan
      // ham ochiladi, lekin yon menyuda ham turadi — har biri o'z
      // ruxsati ortida va `permissionForPath` ularni avtomatik filtrlaydi.
      {
        title: "Qurilmalar",
        url: "/devices/list",
      },
      {
        title: "Telefon qoidalari",
        url: "/devices/policies",
      },
      {
        title: "Vaqtinchalik ruxsatlar",
        url: "/devices/unlocks",
      },
      {
        title: "Ekran vaqti hisoboti",
        url: "/devices/reports",
      },
      // FACE ID — kiosk orqali yuz bilan davomatdan o'tish. Shu guruhda
      // va bu ataylab: faollik "kim foydalanyapti", xavfsizlik "kim
      // kirdi", qurilma nazorati "telefonda nima ochiladi", bu esa "kim
      // binoga kirdi" degan savolga javob beradi — to'rttasi ham
      // KUZATUV, sozlama emas.
      //
      // ⚠️ "Ta'lim → Davomat" bilan chalkashtirmang: u yerda davomatning
      // O'ZI (ro'yxat, belgilash, hisobot), bu yerda esa QURILMA va
      // BIOMETRIKA. Davomat qaydini kiosk ham, panel ham bitta
      // service'ga yozadi (`.claude/rules/face-id.md` §0).
      {
        title: "Face ID kiosklari",
        url: "/face-id/kiosks",
      },
      {
        title: "Yuzni ro'yxatga olish",
        url: "/face-id/enroll",
      },
      {
        title: "Face ID jurnali",
        url: "/face-id/events",
      },
    ],
  },
  {
    title: "Ijtimoiy tarmoqlar",
    icon: Hash,
    isActive: false,
    items: [
      {
        title: "Xabarlar",
        url: "/messages",
      },
      {
        title: "Ijtimoiy tarmoqlar",
        url: "/social-networks",
      },
    ],
  },
  {
    title: "Sotuvlar",
    icon: UserPlus,
    isActive: false,
    items: [
      {
        title: "Barcha sotuvlar",
        url: "/leads",
      },
      {
        title: "Sotuv tahlili",
        url: "/leads/analytics",
      },
    ],
  },
];

/**
 * Qidiruv uchun yassi ro'yxat: `{ title, url, section, icon }`.
 *
 * Bo'lim nomi (`section`) natijada ko'rsatiladi — "Hisob-fakturalar"
 * degan sahifa qaysi bo'limda turganini aytadi. URL i yo'q guruh
 * sarlavhalari ro'yxatga kirmaydi.
 */
export const flatNavPages = navItems.flatMap((group) =>
  (group.items || [])
    .filter((item) => item.url)
    .map((item) => ({
      title: item.title,
      url: item.url,
      section: group.title,
      icon: group.icon,
    })),
);
