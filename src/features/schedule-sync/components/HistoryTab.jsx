// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { History } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import LoadError from "./LoadError";
import Pill from "./Pill";

// Hooks, queries, helpers & data
import useSyncParams from "../hooks/useSyncParams";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { nameOf } from "../helpers/scheduleSync.helpers";
import {
  LATEST_META,
  PAGE_LIMIT,
  REVISION_COLUMNS,
  REVISION_STATUS,
} from "../data/scheduleSync.data";

/**
 * "Tarix" tabi — sheet qachon, kim tomonidan o'qilgani va qanday qaror
 * qabul qilingani.
 */
const HistoryTab = () => {
  const { page, setPage } = useSyncParams();
  const { data, isLoading, isError, refetch } = useQuery(
    scheduleSyncQueries.revisions({ page, limit: PAGE_LIMIT }),
  );

  if (isLoading) return <LoaderCard title="Tarix yuklanmoqda..." />;
  if (isError) return <LoadError title="Tarixni yuklab bo'lmadi" onRetry={refetch} />;

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={History}
          title="Tarix bo'sh"
          description="Sheet birinchi marta tekshirilgach, har bir o'qilgan holat shu yerda ko'rinadi."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table columns={REVISION_COLUMNS}>
        {rows.map((row) => (
          <Tr key={row.id}>
            <Td>
              <div className="flex flex-wrap gap-1">
                {REVISION_STATUS[row.status] && (
                  <Pill meta={REVISION_STATUS[row.status]} />
                )}
                {row.isLatest && <Pill meta={LATEST_META} />}
              </div>
            </Td>
            <Td className="text-gray-600">
              {formatDateTimeUz(row.createdAt)}
              {row.sheetTab && (
                <p className="text-xs text-gray-400">{row.sheetTab}</p>
              )}
            </Td>
            <Td className="text-gray-600">
              {row.fetchedBy ? nameOf(row.fetchedBy) : "Avtomatik"}
            </Td>
            <Td className="text-gray-600">
              {row.reviewedBy ? (
                <>
                  {nameOf(row.reviewedBy)}
                  <p className="text-xs text-gray-400">
                    {formatDateTimeUz(row.reviewedAt)}
                  </p>
                </>
              ) : (
                "—"
              )}
            </Td>
            <Td align="center">
              {row.classCount} / {row.lessonCount}
            </Td>
            <Td
              align="center"
              className={row.issueCount > 0 ? "font-medium text-red-600" : "text-gray-600"}
            >
              {row.issueCount}
            </Td>
            <Td nowrap={false} className="min-w-40 text-gray-600">
              {row.rejectReason || "—"}
            </Td>
          </Tr>
        ))}
      </Table>

      {pagination?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default HistoryTab;
