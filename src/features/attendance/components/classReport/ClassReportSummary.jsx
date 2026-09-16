// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  CLASS_SUMMARY_CARDS,
  getPercentColor,
} from "../../data/attendanceReports.data";

/**
 * "Nega past?" — raqamlarni jumlaga aylantiradi. Hisob serverda, bu yerda
 * faqat matn: aks holda ekrandagi jumla bilan jadval ikki xil manbadan
 * hisoblanib qolardi.
 */
const buildInsights = ({ period, summary, concentration }) => {
  if (!summary.missed) {
    return [
      period === "day"
        ? "Bu kuni sinfda kelmagan o'quvchi yo'q."
        : "Bu davrda sinfda qoldirilgan kun yo'q.",
    ];
  }

  const insights = [
    period === "day"
      ? `${summary.missed} ta o'quvchi kelmagan: sababsiz — ${summary.absent}, sababli — ${summary.excused}, belgilanmagan — ${summary.unmarked}.`
      : `Jami ${summary.missed} marta darsga kelinmagan: sababsiz ${summary.absentShare}%, sababli ${summary.excusedShare}%, belgilanmagan ${summary.unmarkedShare}%.`,
  ];

  if (concentration && concentration.students < concentration.missedStudents) {
    insights.push(
      `Qoldirilgan kunlarning ${concentration.share}% i ro'yxat boshidagi ${concentration.students} ta o'quvchiga to'g'ri keladi` +
        (concentration.percentWithout != null
          ? ` — ularsiz sinf davomati ${concentration.percentWithout}% bo'lardi.`
          : "."),
    );
  }

  // Belgilanmagan kunlar ko'pchilik bo'lsa — muammo bolalarda emas, belgilashda
  if ((summary.unmarkedShare ?? 0) >= 50) {
    insights.push(
      "Foizni asosan belgilanmagan kunlar tushiryapti — davomat o'z vaqtida belgilanmagan bo'lishi mumkin.",
    );
  }

  return insights;
};

/**
 * Sinf hisobotining yuqori qismi: umumiy foiz, holatlar kesimi va
 * "nega past" izohi.
 *
 * @param {object} props
 * @param {"day"|"month"|"year"} props.period
 * @param {object} props.summary - server `summary`
 * @param {object|null} props.concentration - server `concentration`
 */
const ClassReportSummary = ({ period, summary, concentration }) => {
  const insights = buildInsights({ period, summary, concentration });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,14rem)_1fr]">
        {/* Umumiy foiz */}
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl px-4 py-4 text-center",
            getPercentColor(summary.percent),
          )}
        >
          <p className="text-xs font-semibold">Davomat</p>
          <p className="text-3xl font-bold">
            {summary.percent == null ? "-" : `${summary.percent}%`}
          </p>
          <p className="text-[11px] opacity-80">
            Kelgan: {summary.came} / {summary.expected}
          </p>
          {period !== "day" && (
            <p className="text-[11px] opacity-80">
              O&apos;quv kunlari: {summary.schoolDays}
            </p>
          )}
        </div>

        {/* Holatlar kesimi */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CLASS_SUMMARY_CARDS.map(({ key, label, color, share }) => (
            <div key={key} className={cn("rounded-xl px-4 py-3 text-center", color)}>
              <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
              <p className="mt-0.5 text-xs">
                {label}
                {share && summary[share] != null && (
                  <span className="opacity-70"> · {summary[share]}%</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nega past */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold text-gray-700">Tahlil</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-gray-600">
          {insights.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClassReportSummary;
