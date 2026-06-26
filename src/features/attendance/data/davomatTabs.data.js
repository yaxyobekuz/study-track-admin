// Davomat bo'limining asosiy tablari.
// `to` - route path, `label` - tabdagi matn, `title`/`description` - layout sarlavhasi.
// `exact: false` - ichki sahifalarda ham (masalan /attendance/daily/students) tab aktiv bo'lishi uchun.
export const ATTENDANCE_TABS = [
  {
    to: "/attendance/daily",
    label: "Kunlik davomat",
    title: "Kunlik davomat",
    exact: false,
  },
  {
    to: "/attendance/monthly",
    label: "Oylik davomat",
    title: "Oylik davomat",
    exact: false,
  },
  {
    to: "/attendance/excuses",
    label: "Uzrli so'rovlar",
    title: "Uzrli so'rovlar",
    exact: false,
  },
  {
    to: "/attendance/settings",
    label: "Sozlamalar",
    title: "Davomat sozlamalari",
    exact: false,
  },
];

// Kunlik davomat ichidagi sub-tablar
export const DAILY_SUBTABS = [
  { to: "/attendance/daily/students", label: "O'quvchilar" },
  { to: "/attendance/daily/staff", label: "Xodimlar" },
];

// Oylik davomat ichidagi sub-tablar
export const MONTHLY_SUBTABS = [
  { to: "/attendance/monthly/students", label: "O'quvchilar" },
  { to: "/attendance/monthly/staff", label: "Xodimlar" },
];
