import { DoorClosed, Pencil } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatDateUz, formatTimeUz } from "@/shared/utils/date.utils";
import CallButton from "@/shared/components/ui/CallButton";
import { STATUS_COLORS, STATUS_LABELS } from "../data/studentAttendance.data";

const formatTime = (iso) => formatTimeUz(iso, "-");

// O'quvchining sinf(lar)i nomini ko'rsatadi (populate qilingan classes massivi)
const formatClasses = (classes) => {
  if (!Array.isArray(classes) || classes.length === 0) return "-";
  return (
    classes
      .map((c) => c?.name)
      .filter(Boolean)
      .join(", ") || "-"
  );
};

/**
 * Kunlik o'quvchilar davomati jadvali.
 * @param {Array} students - [{ student, attendance, classId, enrollment }] (server `row` shakli)
 * @param {boolean} showClass - "Sinf" ustuni (barcha sinflar rejimida)
 * @param {Function} [onRowClick] - (row) => void; berilsa qator bosiladigan bo'ladi
 *   (o'quvchi profili). Qo'ng'iroq va amal tugmalarining bosilishi qatorga
 *   TARQALMAYDI — aks holda tugma bilan birga profil ham ochilib ketardi.
 * @param {Function} [onEdit] - (row) => void; berilsa har qatorda "Tahrirlash"
 *   tugmasi chiqadi (davomatni to'g'rilash oynasi).
 * @param {Function} [onCloseEnrollment] - (row) => void; berilsa ochiq davrli
 *   qatorda "O'qishni tugatish" tugmasi chiqadi (profilga kirmasdan).
 *
 * Davri allaqachon yopilgan, lekin shu kunni hali qamragan o'quvchida
 * (`endDate` INKLYUZIV — oxirgi o'qigan kun) ismi ostida "Oxirgi kuni"
 * yoziladi: yopilgandan keyin qator shu kuni ro'yxatda qoladi va admin
 * "yopilmadimi?" deb qayta urinmasligi kerak.
 */
const StudentAttendanceTodayTable = ({
  students,
  showClass = false,
  onRowClick,
  onEdit,
  onCloseEnrollment,
}) => {
  const hasActions = Boolean(onEdit || onCloseEnrollment);

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
            {hasActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((row) => {
            const { student, attendance, enrollment } = row;
            const canClose =
              onCloseEnrollment && enrollment && !enrollment.endDate;

            return (
              <tr
                key={student.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-t border-gray-100",
                  onRowClick && "cursor-pointer hover:bg-gray-50",
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {student.lastName} {student.firstName}
                  </p>
                  {enrollment?.endDate && (
                    <p className="text-xs text-amber-600">
                      Oxirgi kuni: {formatDateUz(enrollment.endDate)}
                    </p>
                  )}
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
                {hasActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          title="Davomatni tahrirlash"
                          aria-label="Davomatni tahrirlash"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}
                      {canClose && (
                        <button
                          type="button"
                          title="O'qishni tugatish"
                          aria-label="O'qishni tugatish"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseEnrollment(row);
                          }}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <DoorClosed className="size-4" />
                          <span className="hidden lg:inline">
                            O&apos;qishni tugatish
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendanceTodayTable;
