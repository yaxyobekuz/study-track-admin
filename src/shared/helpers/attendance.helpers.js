/**
 * Bir foydalanuvchining oylik davomati bo'yicha sof hisob-kitoblar.
 *
 * `date` maydoni bazada UTC yarim tunga normallashtirilgan, shuning uchun
 * kun raqami har doim `getUTCDate()` bilan olinadi — mahalliy vaqt zonasi
 * kunni bir kunga surib yuborishi mumkin.
 */

/**
 * Yozuvdan ishlangan daqiqalar. Kelish yoki ketish belgilanmagan bo'lsa —
 * `null` (nol emas: "ishlamagan" bilan "ma'lum emas" farqlanadi).
 * @param {{checkIn?: string, checkOut?: string}} record
 * @returns {number|null}
 */
export const getWorkedMinutes = (record) => {
  if (!record?.checkIn || !record?.checkOut) return null;

  const diff = new Date(record.checkOut) - new Date(record.checkIn);
  return diff > 0 ? Math.round(diff / 60000) : null;
};

/**
 * Oylik yig'ma ko'rsatkichlar.
 *
 * Davomat foizi = (keldi + kechikdi) / belgilangan kunlar. Kechikkan bo'lsa
 * ham kelgan hisoblanadi; "sababli" esa kelmagan (lekin uzrli) — shuning
 * uchun u maxrajda qoladi, suratda emas.
 *
 * Maxraj — belgilangan kunlar soni, ya'ni davomat qayd etilgan ish kunlari.
 * Dam olish kunlari va bayramlar yozuv yaratmaydi, shuning uchun ular hisobga
 * kirmaydi.
 *
 * @param {Array} records
 * @returns {{present: number, late: number, absent: number, excused: number,
 *   total: number, attended: number, lateMinutes: number,
 *   workedMinutes: number, averageMinutes: number|null, rate: number|null}}
 */
export const buildAttendanceStats = (records = []) => {
  const counts = { present: 0, late: 0, absent: 0, excused: 0 };

  let lateMinutes = 0;
  let workedMinutes = 0;
  let workedDays = 0;

  for (const record of records) {
    if (counts[record.status] !== undefined) counts[record.status] += 1;
    lateMinutes += record.lateMinutes ?? 0;

    const minutes = getWorkedMinutes(record);
    if (minutes != null) {
      workedMinutes += minutes;
      workedDays += 1;
    }
  }

  const total = records.length;
  const attended = counts.present + counts.late;

  return {
    ...counts,
    total,
    attended,
    lateMinutes,
    workedMinutes,
    averageMinutes: workedDays ? Math.round(workedMinutes / workedDays) : null,
    rate: total ? Math.round((attended / total) * 100) : null,
  };
};

/**
 * Yozuvlarni oy kuni bo'yicha indekslaydi: `{ 3: record, 4: record }`.
 * @param {Array} records
 * @returns {Record<number, object>}
 */
export const groupRecordsByDay = (records = []) => {
  const byDay = {};
  for (const record of records) {
    byDay[new Date(record.date).getUTCDate()] = record;
  }
  return byDay;
};

/**
 * Oyni dushanbadan boshlanadigan haftalarga bo'ladi. Bo'sh kataklar `null`.
 * @param {number} month - 1..12
 * @param {number} year
 * @returns {(number|null)[][]}
 */
export const buildCalendarWeeks = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  // JS'da hafta yakshanbadan boshlanadi — dushanbaga suramiz
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

/**
 * Berilgan oy joriy oydan keyinmi (kelajakka o'tishni to'sish uchun).
 * @param {number} month - 1..12
 * @param {number} year
 */
export const isFutureMonth = (month, year) => {
  const now = new Date();
  return year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1);
};

/**
 * Oyni siljitadi: `shiftMonth(1, 2026, -1)` → `{ month: 12, year: 2025 }`.
 * @param {number} month - 1..12
 * @param {number} year
 * @param {number} delta
 */
export const shiftMonth = (month, year, delta) => {
  const index = month - 1 + delta;
  return {
    month: ((index % 12) + 12) % 12 + 1,
    year: year + Math.floor(index / 12),
  };
};
