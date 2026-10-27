/**
 * YOTOQXONA DAVOMATI — panel ma'lumotlari.
 *
 * ⚠️ Holatlar `attendance/data/attendance.data.js` DAN OLINMAYDI: u yerda
 * `late` ("Kech keldi") bor va yotoqxonada uning ma'nosi yo'q — bola
 * kechqurun keldi, demak keldi. Server enumi ham uchta holatdan iborat
 * (`DormAttendanceStatus`), shuning uchun ro'yxat shu yerda va u bilan
 * BIR XIL tartibda.
 */

export const DORM_STATUSES = ["present", "absent", "excused"];

export const DORM_STATUS_LABELS = {
  present: "Keldi",
  absent: "Kelmadi",
  excused: "Sababli",
};

export const DORM_STATUS_OPTIONS = DORM_STATUSES.map((value) => ({
  value,
  label: DORM_STATUS_LABELS[value],
}));

/** Tanlangan tugma rangi (belgilash jadvali va paneli uchun). */
export const DORM_STATUS_COLORS = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  excused: "bg-blue-100 text-blue-700",
};

/**
 * Yig'indi kartalari — kalitlar server `summary` si bilan AYNI.
 *
 * ⚠️ "Qoldi" va "Kelmadi" — IKKI XIL raqam va ikkalasi ham ko'rsatiladi:
 * "kelmadi" faqat tarbiyachi aynan shunday belgilagan o'quvchilar
 * (`dormAttendance.service.js` → `buildSummary`). "Jami − qoldi" deb
 * hisoblash butun maktabni (yotoqxonada yashamaydiganlarni ham)
 * "kelmadi" ga qo'shib, yolg'on raqam berardi — shuning uchun
 * "Belgilanmagan" alohida turadi.
 */
export const DORM_SUMMARY_CARDS = [
  { key: "total", label: "Ro'yxatda", color: "bg-gray-100 text-gray-700" },
  { key: "stayed", label: "Yotoqxonada qoldi", color: "bg-green-100 text-green-700" },
  { key: "absent", label: "Kelmadi", color: "bg-red-100 text-red-700" },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
  { key: "unmarked", label: "Belgilanmagan", color: "bg-gray-50 text-gray-500" },
];

/** Ro'yxat filtri — saqlangan holat + "belgilanmagan". */
export const DORM_FILTER_OPTIONS = [
  { value: "all", label: "Barcha holatlar" },
  ...DORM_STATUS_OPTIONS,
  { value: "unmarked", label: "Belgilanmagan" },
];

export const ALL_CLASSES = "all";
export const NO_CLASS = "none";

/** Sinf tanlagich: butun maktab → sinflar → sinfsizlar. */
export const buildClassOptions = (classes = []) => [
  { value: ALL_CLASSES, label: "Barcha sinflar" },
  ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  { value: NO_CLASS, label: "Sinfsiz o'quvchilar" },
];

/**
 * Tarix oynasi — sinf sahifasidagi "oxirgi kunlar" necha kunni qamraydi.
 *
 * ⚠️ Qiymatlar server chegarasi ichida (`HISTORY_DAYS_MAX = 60`): undan
 * kattasi jimgina 60 ga qisqartirilib, ekranda boshqa raqam turardi.
 */
export const HISTORY_WINDOW_OPTIONS = [
  { value: "7", label: "Oxirgi 7 kun" },
  { value: "14", label: "Oxirgi 14 kun" },
  { value: "30", label: "Oxirgi 30 kun" },
  { value: "60", label: "Oxirgi 60 kun" },
];

/** "322 daqiqa" emas, "5 soat 22 daqiqa". */
export const formatWaitUz = (minutes) => {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins} daqiqa`;
  if (mins === 0) return `${hours} soat`;
  return `${hours} soat ${mins} daqiqa`;
};
