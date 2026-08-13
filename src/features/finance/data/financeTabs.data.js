// Moliya bo'limining asosiy sahifasidagi tablar.
// `to` - route path, `label` - tabdagi matn, `title`/`description` - layout sarlavhasi.
// `exact: false` - ichki sahifalarda ham tab aktiv bo'lishi uchun.
//
// Hozircha bitta tab. Keyingi bosqichlar (To'lovlar, Qarzdorlik, Hisobotlar)
// shu massivga bitta yozuv qo'shish bilan paydo bo'ladi.
export const FINANCE_TABS = [
  {
    to: "/finance/tariffs",
    label: "Tariflar",
    title: "Moliya",
    description: "Tariflar va oylik narxlar",
    exact: false,
  },
];
