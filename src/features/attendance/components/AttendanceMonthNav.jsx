// Icons
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helpers
import { isFutureMonth, shiftMonth } from "@/shared/helpers/attendance.helpers";

// Data
import { MONTH_OPTIONS } from "../data/studentAttendance.data";

/**
 * ‹ Avgust 2026 › + "Bugun".
 *
 * Dropdown o'rniga strelka: 90% hollarda kerak bo'ladigan harakat — qo'shni
 * oyga o'tish, u endi bitta bosishda bajariladi. Kelajakdagi oyga o'tib
 * bo'lmaydi — u yerda davomat bo'lishi mumkin emas.
 */
const AttendanceMonthNav = ({ month, year, onChange }) => {
  const now = new Date();
  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  const next = shiftMonth(month, year, 1);
  const canGoForward = !isFutureMonth(next.month, next.year);

  const label = MONTH_OPTIONS.find((option) => option.value === month)?.label;

  const arrowClass =
    "rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Oldingi oy"
        className={arrowClass}
        onClick={() => onChange(shiftMonth(month, year, -1))}
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="min-w-32 text-center text-sm font-medium text-gray-900">
        {label} {year}
      </span>

      <button
        type="button"
        title="Keyingi oy"
        className={arrowClass}
        disabled={!canGoForward}
        onClick={() => onChange(next)}
      >
        <ChevronRight className="size-4" />
      </button>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() =>
            onChange({ month: now.getMonth() + 1, year: now.getFullYear() })
          }
          className="ml-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Bugun
        </button>
      )}
    </div>
  );
};

export default AttendanceMonthNav;
