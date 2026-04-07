import { formatUzDate } from "@/shared/utils/formatDate";
import Button from "@/shared/components/ui/button/Button";
import useModal from "@/shared/hooks/useModal";
import {
  EXCUSE_TYPE_LABELS,
  EXCUSE_STATUS_LABELS,
  EXCUSE_STATUS_COLORS,
} from "../data/attendance.data";

/**
 * Excuse so'rovlar jadvali
 * @param {{ excuses: Object[], isLoading: boolean }} props
 */
const ExcuseRequestsTable = ({ excuses, isLoading }) => {
  const { openModal } = useModal();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (!excuses || excuses.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Hozircha excuse so'rovlar yo'q
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Xodim</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Sana</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Turi</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Sabab</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Holat</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Amal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {excuses.map((ex) => (
            <tr key={ex._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">
                  {ex.user?.firstName} {ex.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{ex.user?.username}</p>
              </td>
              <td className="px-4 py-3 text-gray-700">{formatUzDate(ex.date)}</td>
              <td className="px-4 py-3 text-gray-700">
                {EXCUSE_TYPE_LABELS[ex.type] || ex.type}
              </td>
              <td className="px-4 py-3 text-gray-700 max-w-xs">
                <p className="truncate">{ex.reason}</p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    EXCUSE_STATUS_COLORS[ex.status]
                  }`}
                >
                  {EXCUSE_STATUS_LABELS[ex.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                {ex.status === "pending" && (
                  <Button
                    size="sm"
                    variant="neutral"
                    onClick={() => openModal("reviewExcuse", ex)}
                  >
                    Ko'rib chiqish
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcuseRequestsTable;
