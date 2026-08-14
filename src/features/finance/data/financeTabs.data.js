// Moliya bo'limining ASOSIY SAHIFASIDAGI tablar.
//
// Iyerarxiya: /finance (bo'lim) → /finance/main (asosiy sahifa) →
// /finance/main/tariffs (tab). Tab asosiy sahifaga tegishli, bo'limga emas —
// shuning uchun keyingi sahifalar (/finance/payments va h.k.) o'z tablariga
// ega bo'ladi.
//
// `to` - route path, `label` - tabdagi matn, `title`/`description` - sarlavha.
// `exact: false` - ichki sahifalarda ham tab aktiv bo'lishi uchun.
export const MAIN_TABS = [
  {
    to: "/finance/main/tariffs",
    label: "Tariflar",
    title: "Moliya",
    description: "Tariflar va oylik narxlar",
    exact: false,
  },
  {
    to: "/finance/main/invoices",
    label: "Hisob-fakturalar",
    title: "Moliya",
    description: "Oylik to'lov majburiyatlari va to'lovlar",
    exact: false,
  },
  {
    to: "/finance/main/settings",
    label: "Sozlamalar",
    title: "Moliya",
    description: "O'quv yili va hisob-faktura shakllantirish qoidalari",
    exact: false,
  },
];
