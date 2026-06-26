// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationUZ } from "@/shared/utils/date.utils";

// Data
import {
  STATUS_COLORS,
  STATUS_LABELS,
  buildRoleLabelMap,
} from "../data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const formatTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AttendanceTodayTable = ({ rows }) => {
  const { getCollectionData } = useArrayStore("roles");
  const roleLabelMap = buildRoleLabelMap(getCollectionData());

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Bugun uchun ma&apos;lumot topilmadi
      </div>
    );
  }

  // Ism-familiya bo'yicha A-Z tartib
  const sortedRows = [...rows].sort((a, b) => {
    const nameA = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`;
    const nameB = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-4 py-3">Xodim</th>
            <th className="text-left px-4 py-3">Rol</th>
            <th className="text-left px-4 py-3">Kutilgan vaqt</th>
            <th className="text-left px-4 py-3">Holat</th>
            <th className="text-left px-4 py-3">Keldi</th>
            <th className="text-left px-4 py-3">Ketdi</th>
            <th className="text-left px-4 py-3">Kechikish</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.user._id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.user.firstName} {row.user.lastName}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {roleLabelMap[row.user.role] || row.user.role}
              </td>
              <td className="px-4 py-3 text-gray-700 text-xs">
                {row.expectedStart && row.expectedEnd
                  ? `${row.expectedStart}–${row.expectedEnd}`
                  : "-"}
              </td>
              <td className="px-4 py-3">
                {row.status === "not_marked" ? (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                    Belgilanmagan
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_COLORS[row.status],
                    )}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{formatTime(row.checkIn)}</td>
              <td className="px-4 py-3 text-gray-700">{formatTime(row.checkOut)}</td>
              <td className="px-4 py-3">
                {row.isLate ? (
                  <span className="text-yellow-600 text-xs">
                    {formatDurationUZ(row.lateMinutes)}
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTodayTable;
