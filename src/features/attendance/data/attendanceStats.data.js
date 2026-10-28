/**
 * DAVOMAT HISOBOTLARI — hujjat ko'rinishidagi sahifalarning yo'llari va
 * ekrandagi yorliqlar.
 *
 * ⚠️ YO'L `/attendance/...` EMAS: `/attendance` — tabli layout
 * (`AttendanceLayout`), hujjat esa A4 sahifa bo'lib ochilishi kerak.
 * Yo'l alohida bo'lagi bilan turadi, ya'ni layout ichiga tushmaydi.
 */
export const ATTENDANCE_REPORT_PATHS = {
  students: "/attendance-report/students",
  teachers: "/attendance-report/teachers",
};

/**
 * JONLI HOLAT YORLIQLARI — serverdagi `STATE_LABELS` bilan AYNI so'zlar
 * (`lessonAbsence.service.js`). Server yorliqni o'zi yuboradi; bu ro'yxat
 * faqat zaxira (eski javobda yorliq bo'lmasa).
 */
export const LESSON_STATE_LABELS = {
  absent: "Kelmagan",
  excused: "Sababli kelmagan",
  cameAfter: "Darsdan keyin keldi",
  late: "Dars boshlangach keldi",
  left: "Darsdan oldin ketgan",
};

/**
 * Son: "32 611" (minglik ajratgich bilan) / "0".
 *
 * ⚠️ `toLocaleString` ISHLATILMAYDI: ajratgich brauzer locale'iga va
 * Node ICU qurilishiga bog'liq bo'lib qoladi — ekranda "32,611",
 * Word faylida esa "32 611" chiqardi va bitta hujjatning ikki nusxasi
 * boshqacha ko'rinardi (`dates.md` §3 bilan AYNI sabab; serverda
 * `attendanceStatsExport.service.js` → `grouped`).
 *
 * ⚠️ Ajratgich — UZILMAS BO'SHLIQ (U+00A0): oddiy bo'shliq tor ustunda
 * raqamni ikki qatorga bo'lib yuborardi ("32" / "611").
 */
export const countText = (value) =>
  String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");

/**
 * Daqiqa: "2 soat 15 daqiqa" / "45 daqiqa" / "—" (server bilan AYNI qoida).
 *
 * ⚠️ SOAT ham minglik ajratgich bilan: yillik yig'indida "46924 soat"
 * degan raqamni o'qib bo'lmasdi.
 */
export const minutesText = (value) => {
  const total = Math.round(Number(value) || 0);
  if (!total) return "—";

  const hours = Math.floor(total / 60);
  const rest = total - hours * 60;
  if (!hours) return `${rest} daqiqa`;
  return rest
    ? `${countText(hours)} soat ${rest} daqiqa`
    : `${countText(hours)} soat`;
};

