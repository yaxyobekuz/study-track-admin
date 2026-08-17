// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { ATTENDANCE_STATUS_META } from "../data/userAttendance.data";

/**
 * Davomat holati — belgi + matn.
 *
 * Faqat rang bilan cheklanmaydi: rang ko'rmaydigan yoki chop etilgan
 * hisobotda ham holat o'qiladi. Kechikish daqiqasi bo'lsa u ham shu yerda —
 * "Kechikdi" so'zining o'zi HR uchun yetarli ma'lumot emas.
 */
const AttendanceStatusPill = ({ status, lateMinutes = 0, className = "" }) => {
  const meta = ATTENDANCE_STATUS_META[status];
  if (!meta) return <span className="text-sm text-gray-400">—</span>;

  const { Icon } = meta;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
      {meta.label}
      {status === "late" && lateMinutes > 0 && (
        <span className="opacity-70">· {lateMinutes} daq</span>
      )}
    </span>
  );
};

export default AttendanceStatusPill;
