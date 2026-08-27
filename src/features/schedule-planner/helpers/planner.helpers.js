/**
 * Rejalashtirish — mijoz tomonidagi sof yordamchilar.
 *
 * Bu yerda faqat KO'RSATISH mantig'i: gridni yig'ish, katak holatini aniqlash,
 * ko'chirish mumkinligini oldindan taxmin qilish. Haqiqiy tekshiruv har doim
 * serverda — bu yerdagisi shunchaki katakni yashil yoki kulrang qilib
 * chizish uchun.
 */

/** Katak kaliti — `Map` lar uchun. */
export const slotKey = (day, order) => `${day}|${order}`;

/** O'qituvchi bandligi kaliti. */
export const busyKey = (teacherId, day, order) => `${teacherId}|${day}|${order}`;

/**
 * Darslarni katak bo'yicha indekslaydi.
 * @param {Array} lessons
 * @param {(lesson) => string} owner - `l => l.class.id` yoki `l => l.teacher.id`
 * @returns {Map<string, object>} "ownerId|day|order" → dars
 */
export const indexLessons = (lessons = [], owner) => {
  const map = new Map();
  for (const lesson of lessons) {
    map.set(`${owner(lesson)}|${lesson.day}|${lesson.order}`, lesson);
  }
  return map;
};

/** Bandlik ro'yxatidan tez qidiriladigan to'plam. */
export const toBusySet = (busy = []) =>
  new Set(busy.map((slot) => busyKey(slot.teacherId, slot.day, slot.order)));

/**
 * Tanlangan darsni shu katakka ko'chirish MUMKINMI?
 *
 * Faqat QATTIQ qoidalar tekshiriladi — serverdagi bilan bir xil uchtasi:
 * o'qituvchi band emasmi, o'qituvchining boshqa sinfda darsi yo'qmi, va
 * (almashtiruvda) ikkinchi darsning o'qituvchisi bo'shmi.
 *
 * @returns {"move"|"swap"|"blocked"|"current"}
 */
export const slotState = ({ selected, day, order, byClass, byTeacher, busySet }) => {
  if (!selected) return "blocked";
  if (selected.day === day && selected.order === order) return "current";

  if (busySet.has(busyKey(selected.teacher.id, day, order))) return "blocked";

  const teacherHere = byTeacher.get(`${selected.teacher.id}|${day}|${order}`);
  const classHere = byClass.get(`${selected.class.id}|${day}|${order}`);

  // O'qituvchining o'sha katakda BOSHQA sinfda darsi bor — ko'chirib bo'lmaydi.
  if (teacherHere && teacherHere.id !== classHere?.id) return "blocked";

  if (!classHere) return "move";

  // Almashtirish: ikkinchi dars tanlangan darsning katagiga o'ta oladimi?
  if (busySet.has(busyKey(classHere.teacher.id, selected.day, selected.order))) {
    return "blocked";
  }
  const otherAtSource = byTeacher.get(
    `${classHere.teacher.id}|${selected.day}|${selected.order}`,
  );
  if (otherAtSource && otherAtSource.id !== selected.id) return "blocked";

  return "swap";
};

/**
 * Jadval gridi: `rows[order][day]`.
 * @param {Array} lessons - allaqachon bitta sinf/o'qituvchi bo'yicha filtrlangan
 */
export const buildWeekGrid = (lessons, days, periods) => {
  const map = new Map(lessons.map((l) => [slotKey(l.day, l.order), l]));
  return periods.map((period) => ({
    period,
    cells: days.map((day) => ({
      day,
      order: period.order,
      lesson: map.get(slotKey(day, period.order)) || null,
    })),
  }));
};

/** Foizni xavfsiz hisoblaydi (0 ga bo'lish yo'q). */
export const percent = (value, total) =>
  total > 0 ? Math.round((value / total) * 100) : 0;
