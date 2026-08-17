// Components
import AttendanceStatusPill from "./AttendanceStatusPill";

// Utils
import { formatDateUZ, formatTimeUZ } from "@/shared/utils/date.utils";

/**
 * Ro'yxatdagi bitta kun — bir qatorli yozuv.
 *
 * Ro'yxat sahifaning yarmida turadi, shuning uchun qatorda faqat uchta narsa:
 * sana, vaqt va holat. Ishlangan vaqt, sabab va qolgan tafsilotlar tooltipda
 * (kalendarda) hamda qator bosilganda ochiladigan modalda ko'rinadi.
 *
 * Uchala ustun ham bir o'qda tekislanadi (`items-center`) — ko'z qatordan
 * qatorga to'g'ri tushadi.
 */
const AttendanceRecordRow = ({ record, variant, onSelect }) => {
  const isStaff = variant === "staff";

  // Ikkala vaqt ham yo'q bo'lsa "— - —" o'rniga bitta chiziq
  const time = isStaff
    ? record.checkIn || record.checkOut
      ? `${formatTimeUZ(record.checkIn)} - ${formatTimeUZ(record.checkOut)}`
      : "—"
    : formatTimeUZ(record.markedAt);

  return (
    <button
      type="button"
      onClick={() => onSelect(record)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
        {formatDateUZ(record.date)}
      </span>

      <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
        {time}
      </span>

      <AttendanceStatusPill
        status={record.status}
        lateMinutes={record.lateMinutes}
      />
    </button>
  );
};

export default AttendanceRecordRow;
