// Utils
import { formatMonthUz } from "@/shared/utils/date.utils";

// Hafta kunlari (server: 0=Yakshanba ... 6=Shanba)
export const WEEKDAY_LABELS = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  0: "Yakshanba",
};

/**
 * Umumiy davomat foizi kartalari (qiymatlar sahifada to'ldiriladi).
 *
 * ⚠️ "Shu hafta" OLIB TASHLANDI: u doim joriy haftaga tegishli edi va
 * tanlangan oyga bo'ysunmasdi — avgust hisobotida sentabr haftasining
 * foizi turardi. O'rniga har kartaga TAQQOSLASH tanlagichi qo'shildi.
 */
export const OVERALL_PERCENT_CARDS = [
  { key: "daily", label: "Kunlik" },
  { key: "monthly", label: "Oylik" },
];

/**
 * Taqqoslash uchun oy ro'yxati: tanlangan oydan ORQAGA qarab.
 *
 * ⚠️ Kelgusi oylar kiritilmaydi — ularda davomat yo'q va "0%" bo'lib
 * chiqib, taqqoslash yolg'on xulosa berardi.
 *
 * @param {number} month - 1-12
 * @param {number} year
 * @param {number} [back] - nechta oy orqaga
 * @returns {Array<{label: string, value: string}>} `value` = "YYYY-MM"
 */
export const buildCompareMonthOptions = (month, year, back = 12) => {
  const options = [];

  for (let i = 1; i <= back; i += 1) {
    const zeroBased = month - 1 - i;
    const y = year + Math.floor(zeroBased / 12);
    const m = ((zeroBased % 12) + 12) % 12;

    options.push({
      label: formatMonthUz(y * 100 + (m + 1)),
      value: `${y}-${String(m + 1).padStart(2, "0")}`,
    });
  }

  return options;
};

// Foizga qarab rang: yashil (yaxshi) -> qizil (yomon)
export const getPercentColor = (percent) => {
  if (percent == null) return "bg-gray-100 text-gray-400";
  if (percent >= 90) return "bg-green-100 text-green-700";
  if (percent >= 75) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

// Kun bo'yicha grafik: har bir status uchun stack segmenti (recharts hex ranglar)
export const DAILY_CHART_SERIES = [
  { key: "present", name: "Keldi", color: "#22c55e" },
  { key: "late", name: "Kech keldi", color: "#eab308" },
  { key: "absent", name: "Kelmadi", color: "#ef4444" },
  { key: "excused", name: "Sababli", color: "#3b82f6" },
  // Kutilgan-u belgilanmagan o'quvchilar (kulrang) - jim qolmasligi uchun
  { key: "unmarked", name: "Belgilanmagan", color: "#9ca3af" },
];

// Reyting (1-3 o'rin) badge ranglari
export const RANK_COLORS = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-gray-200 text-gray-700",
  3: "bg-orange-100 text-orange-700",
};

/**
 * Sinf hisoboti manzili. Kun ham uzatiladi: jadvalda qaysi kunning qatori
 * bosilgan bo'lsa, hisobot AYNAN o'sha kun bilan ochiladi va raqamlar mos
 * keladi.
 *
 * @param {string} classId
 * @param {string} [date] - "YYYY-MM-DD" (mashina qiymati)
 */
export const buildClassReportPath = (classId, date) =>
  `/attendance/reports/students/classes/${classId}${date ? `?date=${date}` : ""}`;

// Sinf hisoboti davrlari (server: `period` parametri)
export const CLASS_REPORT_PERIODS = [
  { value: "day", label: "Kunlik" },
  { value: "month", label: "Oylik" },
  { value: "year", label: "Yillik" },
];

/**
 * Kunlik ro'yxatdagi holat yorliqlari. `null` — belgilanmagan: u ham
 * kelmagan hisobiga kiradi, shuning uchun alohida ko'rinishi shart.
 */
export const DAY_STATUS_META = {
  present: { label: "Keldi", className: "bg-green-100 text-green-700" },
  late: { label: "Kech keldi", className: "bg-yellow-100 text-yellow-700" },
  absent: { label: "Kelmadi", className: "bg-red-100 text-red-700" },
  excused: { label: "Sababli", className: "bg-blue-100 text-blue-700" },
  unmarked: { label: "Belgilanmagan", className: "bg-gray-100 text-gray-500" },
};

/**
 * Sinf yig'indisi kartalari. `share` — qoldirilgan o'quvchi-kunlar ichidagi
 * ulush (server `summary.*Share`): foiz aynan nima hisobiga tushganini
 * ko'rsatadi — sababsiz kelmaslikmi, kasallikmi yoki belgilanmagan kunlar.
 */
export const CLASS_SUMMARY_CARDS = [
  { key: "expected", label: "Kutilgan", color: "bg-gray-100 text-gray-700" },
  { key: "came", label: "Kelgan", color: "bg-green-100 text-green-700" },
  { key: "late", label: "Shundan kech", color: "bg-yellow-100 text-yellow-700" },
  {
    key: "absent",
    label: "Kelmadi (sababsiz)",
    color: "bg-red-100 text-red-700",
    share: "absentShare",
  },
  {
    key: "excused",
    label: "Sababli",
    color: "bg-blue-100 text-blue-700",
    share: "excusedShare",
  },
  {
    key: "unmarked",
    label: "Belgilanmagan",
    color: "bg-gray-50 text-gray-500",
    share: "unmarkedShare",
  },
];

/**
 * Kun grafigi uchun oyning BARCHA kunlari: yozuvi yo'q kunlar ham o'z
 * o'rnida (0 chizig'ida) turadi.
 *
 * @param {Array} byDay - serverdan: [{ date: "YYYY-MM-DD", ...counts }]
 * @param {number} month - 1-12
 * @param {number} year
 */
export const fillMonthDays = (byDay = [], month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDayMap = Object.fromEntries(
    byDay.map((d) => [parseInt(d.date.slice(8, 10), 10), d]),
  );

  return Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const d = byDayMap[dayNumber];
    return d
      ? { ...d, day: dayNumber }
      : {
          day: dayNumber,
          date: `${year}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          unmarked: 0,
          came: 0,
          expected: 0,
          total: 0,
          percent: null,
        };
  });
};
