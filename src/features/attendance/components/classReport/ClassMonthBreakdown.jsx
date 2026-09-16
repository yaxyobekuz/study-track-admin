// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { getPercentColor } from "../../data/attendanceReports.data";

// Ustuncha rangi — foiz badge'i bilan bir xil shkala (90 / 75)
const barColor = (percent) =>
  percent >= 90 ? "bg-green-500" : percent >= 75 ? "bg-yellow-500" : "bg-red-500";

/**
 * Yillik hisobotda oylar kesimi: sinf qaysi oyda tushib ketganini ko'rsatadi.
 * Oy yorlig'i serverdan tayyor keladi ("Sentabr, 2026").
 *
 * @param {Array} byMonth - [{ month, monthLabel, percent, came, expected }]
 */
const ClassMonthBreakdown = ({ byMonth = [] }) => {
  if (!byMonth.length) {
    return <p className="py-4 text-sm text-gray-400">Ma&apos;lumot topilmadi</p>;
  }

  return (
    <div className="space-y-2.5">
      {byMonth.map((m) => (
        <div key={m.month} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-gray-600 sm:w-36">
            {m.monthLabel}
          </span>

          <div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
            {m.percent != null && (
              <div
                className={cn("h-full rounded-md transition-all", barColor(m.percent))}
                style={{ width: `${m.percent}%` }}
              />
            )}
          </div>

          <span className="flex w-40 shrink-0 items-center justify-end gap-2 text-right text-xs text-gray-500">
            {m.expected ? (
              <>
                {m.came} / {m.expected}
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 font-medium",
                    getPercentColor(m.percent),
                  )}
                >
                  {m.percent}%
                </span>
              </>
            ) : (
              "Ma'lumot yo'q"
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ClassMonthBreakdown;
