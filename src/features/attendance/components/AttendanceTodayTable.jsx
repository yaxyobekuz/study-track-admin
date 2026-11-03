// Icons
import { Ban } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationUz, formatTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  STATUS_COLORS,
  STATUS_LABELS,
  LOCATION_STATUS_COLORS,
  buildRoleLabelMap,
  locationSummary,
  formatDistance,
} from "../data/attendance.data";

// Hooks
import { useRoles } from "@/features/roles/queries/roles.queries";
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

const formatTime = (iso) => formatTimeUz(iso, "-");

/**
 * Kunlik xodimlar davomati.
 *
 * @param {object[]} rows - `GET /attendance/today/all` qatorlari
 * @param {string} date - ko'rilayotgan kun (bekor qilish oynasiga uzatiladi)
 */
const AttendanceTodayTable = ({ rows, date }) => {
  const { data: roles = [] } = useRoles();
  const roleLabelMap = buildRoleLabelMap(roles);
  const { openModal } = useModal();
  const { can } = usePermissions();
  const { user: me } = useAuth();
  // ⚠️ `attendance.mark` YETMAYDI: bekor qilish kunni o'chiradi va o'sha
  // kungi jarimani ham qaytaradi (server bilan AYNI shart)
  const canCancel = can("attendance.cancel");

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
            <th className="text-left px-4 py-3">Joylashuv</th>
            {canCancel && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.user.id} className="border-t border-gray-100">
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
                {/* Dars jadvalidagi o'qituvchi: kutilgan vaqt — KELISH
                    (birinchi darsdan oldin), darsning o'zi alohida */}
                {row.firstLessonTime && (
                  <span className="block text-gray-400">
                    birinchi dars {row.firstLessonTime}
                  </span>
                )}
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

                {/* ⚠️ Bo'sh qator SABABI bilan bo'sh: aks holda admin
                    "bekor qilish tugmasi ishladimi?" deb qolardi */}
                {row.cancellation && (
                  <span
                    className="mt-1 block text-xs text-gray-500"
                    title={`${row.cancellation.reason} · ${row.cancellation.cancelledAtLabel}`}
                  >
                    Bekor qilindi
                    {row.cancellation.previousStatus &&
                      ` (${STATUS_LABELS[row.cancellation.previousStatus] || row.cancellation.previousStatus})`}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{formatTime(row.checkIn)}</td>
              <td className="px-4 py-3 text-gray-700">
                {formatTime(row.checkOut)}
                {/* Ishlar tugamay, rahbariyat ruxsati bilan ketgan */}
                {row.checkoutApproved && (
                  <span className="block text-xs text-amber-700">
                    Ruxsat bilan
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {row.isLate ? (
                  <span className="text-yellow-600 text-xs">
                    {formatDurationUz(row.lateMinutes)}
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <LocationCell row={row} />
              </td>

              {/* Bekor qilish — faqat qaydi BOR kunda (yo'g'ini bekor
                  qiladigan narsa yo'q) */}
              {canCancel && (
                <td className="px-4 py-3 text-right">
                  {/* ⚠️ O'Z QATORIDA YO'Q: server ham rad etadi — bekor
                      qilish o'sha kungi kech kelish jarimasini ham
                      o'chiradi, ya'ni o'zini o'zi oqlash yo'li bo'lardi */}
                  {row.status !== "not_marked" && row.user.id !== me?.id && (
                    <button
                      type="button"
                      title="Davomatni bekor qilish"
                      onClick={() =>
                        openModal("cancelAttendance", {
                          user: row.user,
                          date,
                          status: row.status,
                          checkIn: row.checkIn,
                          checkOut: row.checkOut,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Ban className="size-3.5" />
                      <span className="hidden sm:inline">Bekor qilish</span>
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Qayd etish joyi — bir qarashda.
 *
 * ⚠️ "Joylashuv berilmagan" ham ALOHIDA ko'rsatiladi: ilgari bunday
 * qator toza qator bilan bir xil ko'rinardi, ya'ni GPS-ni o'chirib
 * qo'yish tekshiruvdan butunlay qutulish yo'li edi.
 */
const LocationCell = ({ row }) => {
  const summary = locationSummary(row);

  if (!summary) return <span className="text-gray-300">-</span>;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        LOCATION_STATUS_COLORS[summary.status] || "bg-gray-100 text-gray-600",
      )}
    >
      {summary.label}
      {summary.distance !== null && ` · ${formatDistance(summary.distance)}`}
    </span>
  );
};

export default AttendanceTodayTable;
