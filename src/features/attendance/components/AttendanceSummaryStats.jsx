// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationShortUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import {
  ATTENDANCE_STATUS_META,
  SUMMARY_FILTERS,
} from "../data/userAttendance.data";

/**
 * Oylik KPI kartalari — har biri alohida `Card`.
 *
 * Rang faqat holatni ajratuvchi nuqta sifatida ishlatiladi, kartaning fonini
 * bo'yamaydi. Kartalar past: uchta qatordan ortiq ma'lumot sig'maydi, chunki
 * ular sahifaning asosiy mazmuni emas — kalendar va ro'yxat asosiy.
 *
 * Holat kartalari ayni paytda filtr — bosilganda kunlar ro'yxati va kalendar
 * shu holat bo'yicha qisqaradi. Bosiladigan qism `Card` ichidagi tugma, ya'ni
 * klaviatura bilan ham ishlaydi (kartaning padding'i tugmaga ko'chiriladi).
 *
 * @param {object} props
 * @param {object} props.stats - `buildAttendanceStats` natijasi
 * @param {string|null} props.activeFilter
 * @param {(status: string|null) => void} props.onFilterChange
 * @param {boolean} [props.showWorkTime] - ish vaqti ko'rsatkichlari (xodim)
 */
const AttendanceSummaryStats = ({
  stats,
  activeFilter,
  onFilterChange,
  showWorkTime = false,
}) => {
  // Ish vaqti hali yozilmagan bo'lsa qatorni umuman ko'rsatmaymiz
  const hasWorkTime =
    showWorkTime && (stats.averageMinutes != null || stats.lateMinutes > 0);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Davomat foizi */}
        <Card className="p-4 max-sm:col-span-2 sm:col-span-3 lg:col-span-1 xs:p-4">
          <p className="text-xs text-gray-500">Davomat</p>

          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold text-gray-900">
              {stats.rate == null ? "—" : `${stats.rate}%`}
            </span>
            <span className="text-xs text-gray-400">
              {stats.total ? `${stats.attended} / ${stats.total} kun` : "—"}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${stats.rate ?? 0}%` }}
            />
          </div>
        </Card>

        {/* Holatlar — bosiladigan filtrlar */}
        {SUMMARY_FILTERS.map((status) => {
          const meta = ATTENDANCE_STATUS_META[status];
          const isActive = activeFilter === status;
          const count = stats[status] ?? 0;
          const share = stats.total
            ? Math.round((count / stats.total) * 100)
            : null;

          return (
            // Padding tugmaga ko'chadi — butun karta bosiladigan bo'lsin
            <Card key={status} className="p-0 xs:p-0">
              <button
                type="button"
                aria-pressed={isActive}
                title={`${meta.label} bo'yicha filtrlash`}
                onClick={() => onFilterChange(isActive ? null : status)}
                className={cn(
                  "w-full rounded-2xl p-4 text-left transition-colors",
                  isActive ? "ring-2 ring-inset ring-primary" : "hover:bg-gray-50",
                )}
              >
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", meta.dot)}
                  />
                  <span className="truncate">{meta.label}</span>
                </span>

                <span className="mt-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    {count}
                  </span>
                  <span className="text-xs text-gray-400">
                    {share == null ? "—" : `${share}%`}
                  </span>
                </span>
              </button>
            </Card>
          );
        })}
      </div>

      {hasWorkTime && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-1 text-xs text-gray-500">
          <span>
            O'rtacha ish vaqti{" "}
            <span className="font-medium text-gray-900">
              {formatDurationShortUZ(stats.averageMinutes)}
            </span>
          </span>
          <span>
            Jami kechikish{" "}
            <span className="font-medium text-gray-900">
              {stats.lateMinutes ? `${stats.lateMinutes} daqiqa` : "—"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummaryStats;
