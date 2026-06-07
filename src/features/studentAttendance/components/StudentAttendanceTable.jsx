import { cn } from "@/shared/utils/cn";
import { STATUS_COLORS, STATUS_LABELS } from "../data/studentAttendance.data";
import { formatDateUZ } from "@/shared/utils/date.utils";

const StudentAttendanceTable = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Ma&apos;lumot topilmadi
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">O&apos;quvchi</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Sinf</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Sana</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Holat</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Sabab</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec._id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-medium text-gray-900">
                {rec.student?.lastName} {rec.student?.firstName}
              </td>
              <td className="px-4 py-3 text-gray-600">{rec.class?.name || "-"}</td>
              <td className="px-4 py-3 text-gray-500">
                {formatDateUZ(new Date(rec.date))}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_COLORS[rec.status]
                  )}
                >
                  {STATUS_LABELS[rec.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {rec.excuseReason || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendanceTable;
