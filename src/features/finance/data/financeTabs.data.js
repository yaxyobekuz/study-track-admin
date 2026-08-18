// Moliya bo'limining tab sahifalari.
//
// Tartib ISH CHASTOTASI bo'yicha: kassir kun bo'yi "O'quvchilar" va
// "To'lovlar" da ishlaydi, "Tariflar"/"Chegirmalar"/"Sozlamalar" ga esa
// oyiga bir-ikki marta kiradi.

export const MAIN_TABS = [
  {
    to: "/finance/main/overview",
    label: "Umumiy",
    title: "Moliya",
    description: "Oylik manzara va hisob-faktura shakllantirish",
    exact: false,
  },
  {
    to: "/finance/main/students",
    label: "O'quvchilar",
    title: "Moliya",
    description: "Qarzdorlar, depozit va to'lov qabul qilish",
    exact: false,
  },
  {
    to: "/finance/main/payments",
    label: "To'lovlar",
    title: "Moliya",
    description: "To'lov cheklari registri",
    exact: false,
  },
  {
    to: "/finance/main/accounts",
    label: "To'lov turlari",
    title: "Moliya",
    description: "To'lov turlari, qoldiqlar va o'tkazmalar",
    exact: false,
  },
  {
    to: "/finance/main/tariffs",
    label: "Tariflar",
    title: "Moliya",
    description: "Tariflar va oylik narxlar",
    exact: false,
  },
  {
    to: "/finance/main/discounts",
    label: "Chegirmalar",
    title: "Moliya",
    description: "Chegirma turlari va o'quvchilarga biriktirish",
    exact: false,
  },
  {
    to: "/finance/main/settings",
    label: "Sozlamalar",
    title: "Moliya",
    description: "O'quv yili, ta'til oylari va shakllantirish qoidalari",
    exact: false,
  },
];
