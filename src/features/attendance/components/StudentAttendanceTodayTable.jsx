import { cn } from "@/shared/utils/cn";
import { STATUS_COLORS, STATUS_LABELS } from "../data/studentAttendance.data";

const formatTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudentAttendanceTodayTable = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Bu sinf uchun ma&apos;lumot topilmadi
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
            <th className="text-left px-4 py-3">Holat</th>
            <th className="text-left px-4 py-3">Belgilangan vaqt</th>
            <th className="text-left px-4 py-3">Sabab</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map(({ student, attendance }) => (
            <tr key={student._id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-medium text-gray-900">
                {student.lastName} {student.firstName}
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
                      STATUS_COLORS[attendance.status]
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendanceTodayTable;
