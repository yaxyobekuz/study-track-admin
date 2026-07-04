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
    to: "/attendance/mark",
    label: "Belgilash",
    title: "Davomat belgilash",
    exact: false,
  },
  {
    to: "/attendance/reports",
    label: "Hisobotlar",
    title: "Davomat hisobotlari",
    exact: false,
  },
  {
    to: "/attendance/excuses",
    label: "Uzrli so'rovlar",
    title: "Uzrli so'rovlar",
    exact: false,
  },
  {
    to: "/attendance/reasons",
    label: "Kelmaslik sabablari",
    title: "Kelmaslik sabablari",
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

// Belgilash ichidagi sub-tablar
export const MARK_SUBTABS = [
  { to: "/attendance/mark/students", label: "O'quvchilar" },
  { to: "/attendance/mark/staff", label: "Xodimlar" },
];

// Hisobotlar ichidagi sub-tablar
export const REPORTS_SUBTABS = [
  { to: "/attendance/reports/students", label: "O'quvchilar" },
  { to: "/attendance/reports/staff", label: "Xodimlar" },
];
