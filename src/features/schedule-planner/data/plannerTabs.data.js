// Dars jadvalini rejalashtirish bo'limining tab sahifalari.
//
// Tartib ISH KETMA-KETLIGI bo'yicha: avval kim qancha dars beradi (Asosiy),
// keyin kim qachon bo'sh (Bandlik), so'ng shakllantirish, natija va nihoyat
// kamdan-kam ochiladigan sozlamalar.
//
// `can` — ixtiyoriy ruxsat kaliti. Ko'rish tablari bo'limga kirish huquqining
// o'zi bilan ochiladi; o'zgartiradiganlari qo'shimcha kalit talab qiladi.

export const MAIN_TABS = [
  {
    to: "/schedule-planner/loads",
    label: "Asosiy",
    title: "Dars jadvalini rejalashtirish",
    exact: false,
  },
  {
    to: "/schedule-planner/availability",
    label: "Bandlik",
    title: "Dars jadvalini rejalashtirish",
    exact: false,
  },
  {
    to: "/schedule-planner/generate",
    label: "Shakllantirish",
    title: "Dars jadvalini rejalashtirish",
    can: "planner.generate",
    exact: false,
  },
  {
    to: "/schedule-planner/timetable",
    label: "Dars jadvali",
    title: "Dars jadvalini rejalashtirish",
    exact: false,
  },
  {
    to: "/schedule-planner/settings",
    label: "Sozlamalar",
    title: "Dars jadvalini rejalashtirish",
    can: "planner.settings",
    exact: false,
  },
];
