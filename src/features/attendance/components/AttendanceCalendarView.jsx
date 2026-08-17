// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationUZ, formatTimeUZ } from "@/shared/utils/date.utils";

// Components
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

// Helpers
import { buildCalendarWeeks } from "@/shared/helpers/attendance.helpers";

// Data
import {
  ATTENDANCE_STATUS_META,
  CALENDAR_WEEKDAYS,
  SUMMARY_FILTERS,
} from "../data/userAttendance.data";

/**
 * Oylik davomat kalendari.
 *
 * Katak neytral qoladi, holatni faqat rangli nuqta bildiradi va tafsilot
 * tooltipda chiqadi — asosiy davomat bo'limidagi jadval (`AttendanceTable`)
 * bilan bir xil til. Shu tufayli ikkala sahifada bir xil nuqta bir xil
 * narsani anglatadi.
 *
 * Kataklar past (kvadrat emas): kalendar sahifaning yarmida turadi va
 * yonidagi kunlar ro'yxatini ezib qo'ymasligi kerak.
 *
 * @param {object} props
 * @param {number} props.month - 1..12
 * @param {number} props.year
 * @param {Record<number, object>} props.recordsByDay
 * @param {(record: object) => void} props.onSelectDay
 * @param {"staff"|"student"} props.variant
 * @param {string|null} [props.activeFilter]
 */
const AttendanceCalendarView = ({
  month,
  year,
  recordsByDay,
  onSelectDay,
  variant,
  activeFilter = null,
}) => {
  const weeks = buildCalendarWeeks(month, year);

  const now = new Date();
  const todayDay =
    now.getMonth() + 1 === month && now.getFullYear() === year
      ? now.getDate()
      : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {CALENDAR_WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-1 text-center text-xs font-medium text-gray-400"
          >
            {day}
          </div>
        ))}

        {weeks.flat().map((day, index) => {
          if (day == null) return <div key={`empty-${index}`} />;

          const record = recordsByDay[day];
          const meta = record && ATTENDANCE_STATUS_META[record.status];
          const isDimmed = Boolean(
            meta && activeFilter && record.status !== activeFilter,
          );

          const cell = (
            <div
              className={cn(
                "flex h-11 w-full flex-col items-center justify-center gap-1 rounded-lg",
                todayDay === day && "ring-1 ring-primary",
                isDimmed && "opacity-25",
              )}
            >
              <span
                className={cn(
                  "text-xs",
                  meta ? "font-medium text-gray-700" : "text-gray-300",
                )}
              >
                {day}
              </span>

              {/* Yozuvi yo'q kun ham nuqta oladi — kulrang (asosiy jadvaldek) */}
              <span
                className={cn(
                  "size-2.5 rounded-full transition-transform duration-200",
                  meta ? cn(meta.dot, "group-hover:scale-150") : "bg-gray-200",
                )}
              />
            </div>
          );

          if (!meta) return <div key={day}>{cell}</div>;

          return (
            <Tooltip
              key={day}
              content={<DayTooltip record={record} variant={variant} />}
            >
              <button
                type="button"
                onClick={() => onSelectDay(record)}
                className="group rounded-lg outline-none transition-colors hover:bg-gray-50 focus-visible:bg-gray-50"
              >
                {cell}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Izoh */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
        {SUMMARY_FILTERS.map((status) => {
          const meta = ATTENDANCE_STATUS_META[status];
          return (
            <span
              key={status}
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <span className={cn("size-2 rounded-full", meta.dot)} />
              {meta.label}
            </span>
          );
        })}

        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="size-2 rounded-full bg-gray-200" />
          Belgilanmagan
        </span>
      </div>
    </div>
  );
};

/** Asosiy davomat jadvalidagi tooltip bilan bir xil mazmun. */
const DayTooltip = ({ record, variant }) => {
  const meta = ATTENDANCE_STATUS_META[record.status];
  const reason = record.absenceReason?.title || record.excuseReason;

  return (
    <div className="space-y-1">
      <b className="font-bold">{meta.label}</b>

      {variant === "staff" ? (
        <>
          {record.checkIn && <p>Keldi: {formatTimeUZ(record.checkIn)}</p>}
          {record.checkOut && <p>Ketdi: {formatTimeUZ(record.checkOut)}</p>}
          {record.isLate && (
            <p className="text-yellow-300">
              {formatDurationUZ(record.lateMinutes)} kech
            </p>
          )}
          {record.isEarlyOut && (
            <p className="text-orange-300">
              {formatDurationUZ(record.earlyOutMinutes)} erta ketdi
            </p>
          )}
          {record.outOfOffice && (
            <p className="text-red-300">Ofisdan tashqarida</p>
          )}
        </>
      ) : (
        <>
          {record.class?.name && <p>Sinf: {record.class.name}</p>}
          {record.markedAt && (
            <p>Belgilangan: {formatTimeUZ(record.markedAt)}</p>
          )}
        </>
      )}

      {reason && <p>Sabab: {reason}</p>}
    </div>
  );
};

export default AttendanceCalendarView;
