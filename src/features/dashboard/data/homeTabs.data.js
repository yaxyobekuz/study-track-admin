// Bosh sahifaning tab sahifalari.
//
// `exact: true` — "Asosiy" tabi FAQAT `/` da aktiv boʻlishi kerak. Aks holda
// `/reports` da ham u yoqilib qolardi, chunki har qanday yoʻl `/` bilan
// boshlanadi.
//
// `can` — ixtiyoriy ruxsat kaliti. Berilgan boʻlsa, tab faqat oʻsha ruxsatga
// ega xodimga koʻrinadi.
//
// ⚠️ "Moliya" tabi va moliya boʻlimidagi "Dashboard" tabi AYNI BIR sahifani
// ochadi (`FinanceDashboardPage`). Ikki kirish nuqtasi ataylab: rahbar bosh
// sahifadan chiqmasdan koʻradi, moliyachi esa oʻz boʻlimida topadi. Ikkita
// BOSHQACHA ekran esa yoʻq — bir xil raqamni ikki xil koʻrinishda
// koʻrsatish ishonchni yoʻqotardi.

export const HOME_TABS = [
  {
    to: "/",
    label: "Asosiy",
    exact: true,
  },
  {
    to: "/reports",
    label: "Moliya",
    can: "reports.view",
    exact: false,
  },
  // "Ta'lim" — moliyaning akademik ko'zgusi. Ikkalasi bosh sahifadan
  // ochiladi, chunki rahbar uchun ular BITTA savolning ikki yarmi:
  // "pul qanday" va "o'qish qanday".
  {
    to: "/education",
    label: "Ta'lim",
    can: "education.view",
    exact: false,
  },
  // "Inventar" — uchinchi yarim: "mulkimiz qanday". Moliya pulni,
  // ta'lim o'qishni, inventar esa MODDIY BAZANI ko'rsatadi va uchalasi
  // ham rahbarning bir ekrandan ochadigan savollari.
  //
  // ⚠️ `inventory.dashboard` — `inventory.view` DAN ALOHIDA kalit.
  // Xatlov ekraniga kirish huquqi bu tabni ochmaydi: bu yerda bazaning
  // pul qiymati va qarzdorlik qoldig'i turadi
  // (`server/src/utils/permissions.js` dagi izoh).
  {
    to: "/assets",
    label: "Inventar",
    can: "inventory.dashboard",
    exact: false,
  },
];
