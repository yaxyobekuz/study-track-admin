// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { getPercentColor } from "../data/attendanceReports.data";

/**
 * Umumiy davomat foizi kartalari (Bugun / Shu hafta / Oy).
 * AttendanceSummaryCards bilan bir xil vizual oilada.
 * Foiz = kelganlar / KUTILGAN (jadval bo'yicha bo'lishi kerak bo'lganlar),
 * belgilanganlarga nisbatan emas — shuning uchun "Belgilanmagan" ham ko'rinadi.
 * @param {Array} items - [{ key, label, percent, came, total, unmarked }]
 */
const ReportPercentCards = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ key, label, percent, came, total, unmarked }) => (
        <div
          key={key}
          className={cn(
            "rounded-xl px-4 py-3 text-center",
            getPercentColor(percent),
          )}
        >
          <p className="text-2xl font-bold">
            {percent == null ? "-" : `${percent}%`}
          </p>
          <p className="text-xs mt-0.5">{label}</p>
          <p className="text-[11px] mt-0.5 opacity-80">
            {total ? `Kelgan: ${came} / ${total}` : "Ma'lumot yo'q"}
          </p>
          {total > 0 && (
            <p className="text-[11px] opacity-80">Belgilanmagan: {unmarked ?? 0}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportPercentCards;
