// Tyutor guruhlari — statik ma'lumot (yorliqlar, ranglar, ustunlar).

/** Biriktirish holati (server `status`) → nishon rangi. */
export const GROUP_STATUS_META = {
  active: { label: "Amalda", className: "bg-green-50 text-green-700" },
  planned: { label: "Rejada", className: "bg-blue-50 text-blue-700" },
  ended: { label: "Tugagan", className: "bg-gray-100 text-gray-500" },
};

/** Bugungi davomat holati → nishon. `null` — hali belgilanmagan. */
export const ATTENDANCE_STATUS_META = {
  present: { label: "Keldi", className: "bg-green-50 text-green-700" },
  late: { label: "Kech keldi", className: "bg-amber-50 text-amber-700" },
  absent: { label: "Kelmadi", className: "bg-red-50 text-red-700" },
  excused: { label: "Sababli", className: "bg-blue-50 text-blue-700" },
  unmarked: { label: "Belgilanmagan", className: "bg-gray-100 text-gray-500" },
};

/** Olib tashlash qaysi oydan kuchga kiradi. */
export const REMOVE_EFFECTIVE_OPTIONS = [
  {
    value: "next",
    title: "Keyingi oydan",
    description:
      "Shu oy uchun qo'shimcha oylik hisoblanadi, keyingi oydan to'xtaydi. Sinf keyingi oydan boshqa tyutorga biriktirilishi mumkin.",
  },
  {
    value: "current",
    title: "Shu oydan",
    description:
      "Shu oy uchun ham hisoblanmaydi. Xato biriktirilgan bo'lsa yoki sinf shu oydan boshqa tyutorga o'tsa.",
  },
];

/** Guruh o'quvchilari jadvali. */
export const STUDENT_COLUMNS = [
  { label: "#", className: "w-10" },
  "O'quvchi",
  "Bugun",
  { label: "Davomat", align: "right" },
  { label: "Qoldirgan", align: "right" },
  { label: "Kech keldi", align: "right" },
  { label: "O'rtacha baho", align: "right" },
];

/** Fanlar bo'yicha baholar jadvali. */
export const SUBJECT_COLUMNS = [
  "Fan",
  { label: "O'rtacha baho", align: "right" },
  { label: "Baholar soni", align: "right" },
];
