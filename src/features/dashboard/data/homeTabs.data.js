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
];
