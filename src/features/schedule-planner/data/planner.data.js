// Rejalashtirish bo'limining statik ma'lumotlari.
//
// Kun yorliqlari `@/shared/data/days.data` dan keladi — bu yerda nusxa
// yaratilmaydi (oy nomlari bilan bo'lgan xatoning aynan o'zi takrorlanmasin).

import { days } from "@/shared/data/days.data";

/** `{ dushanba: "Dushanba", ... }` */
export const DAY_LABEL = Object.fromEntries(
  days.map((day) => [day.value, day.label]),
);

/** Qisqa yorliq — tor ustunlar uchun: "Du", "Se", ... */
export const DAY_SHORT = Object.fromEntries(
  days.map((day) => [day.value, day.label.slice(0, 2)]),
);

export const DAY_OPTIONS = days;

/** "Bandlik" tabidagi ikki ko'rinish. */
export const AVAILABILITY_VIEWS = [
  { value: "matrix", label: "Umumiy ko'rinish" },
  { value: "teacher", label: "O'qituvchi bo'yicha" },
];

/**
 * Sozlamalar tabidagi cheklovlar.
 *
 * Har biri yonida NIMA UCHUN kerakligi turadi: raqamning ma'nosini
 * bilmasdan uni o'zgartirish jadvalni tushunarsiz buzardi.
 */
export const CLASS_CONSTRAINTS = [
  {
    key: "maxLessonsPerDay",
    label: "Kuniga eng ko'pi bilan",
    suffix: "dars",
    min: 1,
    max: 20,
    hint: "Bitta sinfga bir kunda qo'yiladigan darslar chegarasi.",
  },
  {
    key: "minLessonsPerDay",
    label: "Kuniga eng kami bilan",
    suffix: "dars",
    min: 0,
    max: 20,
    hint: "Boshlangan kunni shu songacha to'ldirishga harakat qilinadi. Qat'iy talab emas.",
  },
  {
    key: "maxSameSubjectPerDay",
    label: "Bir kunda bitta fandan",
    suffix: "marta",
    min: 1,
    max: 10,
    hint: "Masalan 2 bo'lsa, matematika bir kunda ikki martadan ko'p bo'lmaydi.",
  },
];

export const TEACHER_CONSTRAINTS = [
  {
    key: "teacherMaxPerDay",
    label: "Kuniga eng ko'pi bilan",
    suffix: "dars",
    min: 1,
    max: 20,
    hint: "Bitta o'qituvchiga bir kunda beriladigan darslar chegarasi.",
  },
];

export const CONSTRAINT_FLAGS = [
  {
    key: "allowClassGaps",
    label: "Sinf jadvalida \"oyna\"ga ruxsat berilsin",
    hint: "O'chirilgan bo'lsa, sinfning darslari kun boshidan ketma-ket turadi — o'quvchi bo'sh soat kutib o'tirmaydi.",
  },
  {
    key: "allowTeacherGaps",
    label: "O'qituvchi jadvalida \"oyna\"ga ruxsat berilsin",
    hint: "Odatda yoqiq qoldiriladi: butunlay taqiqlash ko'p holda jadvalni umuman shakllantirib bo'lmaydigan qilib qo'yadi.",
  },
  {
    key: "avoidConsecutiveSame",
    label: "Ketma-ket ikkita bir xil dars bo'lmasin",
    hint: "O'chirilsa \"juft dars\" (masalan ketma-ket ikkita matematika) qo'yish mumkin bo'ladi.",
  },
];

/** Tayyorgarlik kartalari — Shakllantirish tabida. */
export const PREFLIGHT_GROUPS = [
  {
    key: "settings",
    label: "Sozlamalar",
    codes: ["no_periods", "no_days"],
  },
  {
    key: "classes",
    label: "Sinflar",
    codes: [
      "class_over_capacity",
      "class_over_daily_limit",
      "class_under_minimum",
      "shared_subject",
    ],
  },
  {
    key: "teachers",
    label: "O'qituvchilar",
    codes: [
      "teacher_over_capacity",
      "teacher_over_daily_limit",
      "teacher_saturated",
      "no_demand",
      "no_class",
    ],
  },
];

/** Katak holati → Tailwind sinflari (bandlik matritsasi uchun). */
export const SLOT_TONE = {
  free: "bg-gray-100 hover:bg-gray-200",
  busy: "bg-red-400 hover:bg-red-500",
  lesson: "bg-blue-400 hover:bg-blue-500",
};
