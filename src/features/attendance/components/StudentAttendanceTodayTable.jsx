import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";
import CallButton from "@/shared/components/ui/CallButton";
import { STATUS_COLORS, STATUS_LABELS } from "../data/studentAttendance.data";

const formatTime = (iso) => formatTimeUz(iso, "-");

// O'quvchining sinf(lar)i nomini ko'rsatadi (populate qilingan classes massivi)
const formatClasses = (classes) => {
  if (!Array.isArray(classes) || classes.length === 0) return "-";
  return classes.map((c) => c?.name).filter(Boolean).join(", ") || "-";
};

/**
 * Kunlik o'quvchilar davomati jadvali.
 * @param {Array} students - [{ student, attendance, classId }] (server `row` shakli)
 * @param {boolean} showClass - "Sinf" ustuni (barcha sinflar rejimida)
 * @param {Function} [onRowClick] - (row) => void; berilsa qator bosiladigan bo'ladi
 *   (tahrirlash oynasi). Qo'ng'iroq tugmasi bosilishi qatorga tarqalmaydi.
 */
const StudentAttendanceTodayTable = ({
  students,
  showClass = false,
  onRowClick,
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Ma&apos;lumot topilmadi
      </div>
    );
  }

  // Familiya-ism bo'yicha A-Z tartib
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = `${a.student?.lastName || ""} ${a.student?.firstName || ""}`;
    const nameB = `${b.student?.lastName || ""} ${b.student?.firstName || ""}`;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-4 py-3">O&apos;quvchi</th>
            {showClass && <th className="text-left px-4 py-3">Sinf</th>}
            <th className="text-left px-4 py-3">Telefon</th>
            <th className="text-left px-4 py-3">Holat</th>
            <th className="text-left px-4 py-3">Belgilangan vaqt</th>
            <th className="text-left px-4 py-3">Sabab</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((row) => {
            const { student, attendance } = row;
            return (
              <tr
                key={student.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-t border-gray-100",
                  onRowClick && "cursor-pointer hover:bg-gray-50",
                )}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {student.lastName} {student.firstName}
                </td>
                {showClass && (
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatClasses(student.classes)}
                  </td>
                )}
                <td className="px-4 py-3">
                  <CallButton
                    compact
                    phone={student.phone}
                    parentPhone={student.parentPhone}
                  />
                </td>
                <td className="px-4 py-3">
                  {!attendance ? (
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                      Belgilanmagan
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[attendance.status],
                      )}
                    >
                      {STATUS_LABELS[attendance.status]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {attendance?.markedAt ? formatTime(attendance.markedAt) : "-"}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {attendance?.excuseReason || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendanceTodayTable;
