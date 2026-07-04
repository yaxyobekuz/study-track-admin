// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { getPercentColor } from "../data/attendanceReports.data";

/**
 * Umumiy davomat foizi kartalari (Bugun / Shu hafta / Oy).
 * AttendanceSummaryCards bilan bir xil vizual oilada.
 * @param {Array} items - [{ key, label, percent, came, total }]
 */
const ReportPercentCards = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ key, label, percent, came, total }) => (
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
        </div>
      ))}
    </div>
  );
};

export default ReportPercentCards;
