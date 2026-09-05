// Moliya bo'limining tab sahifalari.
//
// Tartib ISH CHASTOTASI bo'yicha: kassir kun bo'yi "To'lovlar" da ishlaydi,
// "Tariflar"/"Chegirmalar"/"Sozlamalar" ga esa oyiga bir-ikki marta kiradi.
//
// `description` YO'Q — sarlavha ostidagi izoh olib tashlangan (davomat
// bo'limidagi kabi). Layout uni shartli chizadi, shuning uchun qo'shimcha
// o'zgarish talab qilinmaydi.
//
// `can` — ixtiyoriy ruxsat kaliti. Berilgan bo'lsa, tab faqat o'sha
// ruxsatga ega xodimga ko'rinadi. Qolgan tablar moliya bo'limiga kirish
// huquqining o'zi bilan ochiladi.

export const MAIN_TABS = [
  {
    // Rahbar dashboardi BIRINCHI turadi: bo'limga kirgan odam avval "ishlar
    // qanday ketyapti" ni ko'radi, keyin registrga tushadi.
    to: "/finance/main/dashboard",
    label: "Dashboard",
    title: "Moliya",
    can: "reports.view",
    exact: false,
  },
  {
    to: "/finance/main/overview",
    label: "Umumiy",
    title: "Moliya",
    exact: false,
  },
  {
    to: "/finance/main/debtors",
    label: "Qarzdorlar",
    title: "Moliya",
    can: "debtors.view",
    exact: false,
  },
  {
    to: "/finance/main/payments",
    label: "To'lovlar",
    title: "Moliya",
    exact: false,
  },
  {
    to: "/finance/main/accounts",
    label: "To'lov turlari",
    title: "Moliya",
    exact: false,
  },
  {
    to: "/finance/main/income",
    label: "Tashqi kirimlar",
    title: "Moliya",
    can: "income.view",
    exact: false,
  },
  {
    to: "/finance/main/payroll",
    label: "Xodimlar oyligi",
    title: "Moliya",
    can: "payroll.view",
    exact: false,
  },
  {
    to: "/finance/main/expenses",
    label: "Chiqimlar",
    title: "Moliya",
    can: "expenses.view",
    exact: false,
  },
  {
    to: "/finance/main/tariffs",
    label: "Tariflar",
    title: "Moliya",
    exact: false,
  },
  {
    to: "/finance/main/discounts",
    label: "Chegirmalar",
    title: "Moliya",
    exact: false,
  },
  {
    to: "/finance/main/settings",
    label: "Sozlamalar",
    title: "Moliya",
    exact: false,
  },
];
