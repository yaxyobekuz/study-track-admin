/**
 * Reyting davrlari va ball chegaralari — BITTA joyda.
 *
 * Kalitlar serverning `STATISTICS_PERIODS` (helpers/statistics.helpers.js)
 * bilan AYNI: "day" | "week" | "month". Server noma'lum kalitni haftalikka
 * tushiradi, panel ham shunday qiladi — ikki tomonda bitta qoida.
 */
export const STATISTICS_PERIODS = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];

export const DEFAULT_PERIOD = "week";

/** URL'dagi (yoki tashqaridan kelgan) qiymat — noma'lumi haftalik. */
export const resolvePeriod = (value) =>
  STATISTICS_PERIODS.some((p) => p.value === value) ? value : DEFAULT_PERIOD;

/**
 * Ball ranglari ("a'lo / yaxshi / qoniqarli") davrga qarab o'zgaradi.
 *
 * ⚠️ HAFTALIK CHEGARA O'ZGARMAYDI (45 / 35) — u maktabda allaqachon
 * ishlatiladigan o'lchov. Qolgan ikkitasi O'SHANDAN keltirib chiqarilgan:
 * hafta 6 o'quv kuni (45 ÷ 6 ≈ 8, 35 ÷ 6 ≈ 6), oy esa 4 hafta
 * (45 × 4 = 180, 35 × 4 = 140).
 *
 * ⚠️ Aks holda bitta chegara uchala davrga qo'llanardi: kunlik ro'yxatda
 * hamma "qoniqarli" (bir kunda 35 ball imkonsiz), oylikda esa hamma
 * "a'lo" bo'lib, rang umuman ma'no bermay qolardi.
 */
export const SCORE_THRESHOLDS = {
  day: { high: 8, mid: 6 },
  week: { high: 45, mid: 35 },
  month: { high: 180, mid: 140 },
};

/** Jadvaldagi ball rangi (legend bilan AYNI chegaradan). */
export const scoreColor = (period, totalSum) => {
  const { high, mid } = SCORE_THRESHOLDS[resolvePeriod(period)];
  if (totalSum >= high) return "text-green-600";
  if (totalSum >= mid) return "text-blue-600";
  return "text-orange-600";
};

/**
 * Legend qatorlari — chegaradan QURILADI, qo'lda yozilmaydi: aks holda
 * chegara o'zgarganda ekrandagi izoh eski raqam bilan qolib ketardi.
 */
export const scoreLegend = (period) => {
  const { high, mid } = SCORE_THRESHOLDS[resolvePeriod(period)];
  return [
    { dot: "bg-green-500", range: `${high}+`, label: "A'lo natija" },
    { dot: "bg-blue-500", range: `${mid}-${high - 1}`, label: "Yaxshi natija" },
    {
      dot: "bg-orange-500",
      range: `${mid} dan past`,
      label: "Qoniqarli natija",
    },
  ];
};
