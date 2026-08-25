// Bosh sahifaning tab sahifalari.
//
// `exact: true` — "Asosiy" tabi FAQAT `/` da aktiv bo'lishi kerak. Aks holda
// `/reports` da ham u yoqilib qolardi, chunki har qanday yo'l `/` bilan
// boshlanadi.
//
// `can` — ixtiyoriy ruxsat kaliti. Berilgan bo'lsa, tab faqat o'sha ruxsatga
// ega xodimga ko'rinadi.

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
