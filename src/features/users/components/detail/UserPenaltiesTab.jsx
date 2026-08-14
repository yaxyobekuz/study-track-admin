// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data & queries
import {
  penaltyStatusColors,
  penaltyStatusLabels,
} from "@/features/penalties/data/penalties.data";
import { penaltiesQueries } from "@/features/penalties/queries/penalties.queries";

/**
 * Foydalanuvchining jarimalari.
 *
 * Sahifa raqami URL'ga yozilmaydi — u tabga tegishli mayda holat, detal
 * sahifasining manzilini bulg'ashi shart emas.
 */
const UserPenaltiesTab = ({ userId, penaltyPoints = 0 }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    penaltiesQueries.byUser(userId, { page, limit: 10 }),
  );

  const penalties = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs text-gray-500">Jami jarima ballari</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {penaltyPoints}
        </p>
      </Card>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : penalties.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Jarimalar yo'q</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="min-w-full text-sm">
            <tbody>
              {penalties.map((penalty) => (
                <tr
                  key={penalty.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {penalty.title || penalty.category?.title || "Jarima"}
                    </p>
                    {penalty.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {penalty.description}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatDateUZ(penalty.createdAt)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-medium text-red-600">
                    +{penalty.points}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${penaltyStatusColors[penalty.status]}`}
                    >
                      {penaltyStatusLabels[penalty.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          showPageNumbers
          maxPageButtons={5}
          onPageChange={setPage}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      )}
    </div>
  );
};

export default UserPenaltiesTab;
