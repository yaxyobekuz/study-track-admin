// React
import { useMemo, useState } from "react";

// Icons
import { CalendarX2, X } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import AttendanceCalendarView from "./AttendanceCalendarView";
import AttendanceDayModal from "./AttendanceDayModal";
import AttendanceMonthNav from "./AttendanceMonthNav";
import AttendanceRecordRow from "./AttendanceRecordRow";
import AttendanceSummaryStats from "./AttendanceSummaryStats";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Helpers
import {
  buildAttendanceStats,
  groupRecordsByDay,
} from "@/shared/helpers/attendance.helpers";

// Data & queries
import { ATTENDANCE_STATUS_META } from "../data/userAttendance.data";
import { attendanceQueries } from "../queries/attendance.queries";

/**
 * Bitta foydalanuvchining oylik davomati.
 *
 * Sahifa "ro'yxatni ko'rish" emas, "holatni tez tushunish" uchun qurilgan:
 * yuqorida KPI kartalari (ular ayni paytda filtr ham), pastda kalendar va
 * kunlar ro'yxati yonma-yon. Kalendar naqshni, ro'yxat tafsilotni beradi —
 * ular bir-birini almashtirmaydi.
 *
 * Xodim va o'quvchi davomati boshqa jadvallarda saqlanadi (xodimda kelish/
 * ketish vaqti bor, o'quvchida sinf), lekin ko'rinishi bir xil bo'lishi kerak
 * — shuning uchun bitta komponent, ikkita `variant`.
 *
 * @param {object} props
 * @param {"staff"|"student"} props.variant
 * @param {object} props.user - kamida `{ id }`; xodimda ish grafigi ham
 */
const UserAttendancePanel = ({ variant, user }) => {
  const isStaff = variant === "staff";
  const { openModal } = useModal();

  const now = new Date();
  const [period, setPeriod] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [statusFilter, setStatusFilter] = useState(null);

  const { data, isLoading } = useQuery(
    isStaff
      ? attendanceQueries.userMonth(user.id, period.month, period.year)
      : attendanceQueries.studentMonth(user.id, period.month, period.year),
  );

  const records = useMemo(() => data?.records ?? [], [data]);
  const stats = useMemo(() => buildAttendanceStats(records), [records]);
  const recordsByDay = useMemo(() => groupRecordsByDay(records), [records]);

  const visibleRecords = statusFilter
    ? records.filter((record) => record.status === statusFilter)
    : records;

  const openDay = (record) =>
    openModal("attendanceDay", { record, variant, user });

  return (
    <div className="space-y-4">
      {/* Sarlavha va oy navigatsiyasi — kartadan tashqarida, sahifa boshqaruvi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">Davomat</h2>
        <AttendanceMonthNav {...period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : (
        <>
          <AttendanceSummaryStats
            stats={stats}
            showWorkTime={isStaff}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />

          {/* Chapda kalendar (naqsh), o'ngda kunlar ro'yxati (tafsilot) */}
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <Card title="Kalendar" className="space-y-4">
              {records.length === 0 ? (
                <EmptyState description="Bu oy uchun davomat hali qayd etilmagan." />
              ) : (
                <AttendanceCalendarView
                  {...period}
                  variant={variant}
                  onSelectDay={openDay}
                  activeFilter={statusFilter}
                  recordsByDay={recordsByDay}
                />
              )}
            </Card>

            <Card className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">Kunlar</h2>
                  <span className="text-sm text-gray-400">
                    {visibleRecords.length}
                  </span>
                </div>

                {statusFilter && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter(null)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  >
                    {ATTENDANCE_STATUS_META[statusFilter].label}
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {records.length === 0 ? (
                <EmptyState description="Bu oy uchun davomat hali qayd etilmagan." />
              ) : visibleRecords.length === 0 ? (
                <EmptyState
                  description={`${ATTENDANCE_STATUS_META[statusFilter].label} holati bu oyda uchramadi.`}
                />
              ) : (
                // Kalendar balandligiga yaqin — uzun oy kartani cho'zib yubormaydi
                <div className="hidden-scrollbar max-h-[340px] divide-y divide-gray-50 overflow-y-auto">
                  {visibleRecords.map((record) => (
                    <AttendanceRecordRow
                      key={record.id}
                      record={record}
                      variant={variant}
                      onSelect={openDay}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      <AttendanceDayModal />
    </div>
  );
};

/** Bo'sh holat — nima yo'qligi darhol tushunarli bo'lsin. */
const EmptyState = ({ description }) => (
  <div className="px-6 py-10 text-center">
    <CalendarX2 className="mx-auto size-8 text-gray-300" strokeWidth={1.5} />
    <p className="mt-3 text-sm text-gray-500">{description}</p>
  </div>
);

export default UserAttendancePanel;
