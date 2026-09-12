// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Archive, Eye } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import SnapshotDetail from "./SnapshotDetail";
import LoadError from "./LoadError";
import Pill from "./Pill";

// Hooks, queries, helpers & data
import useSyncParams from "../hooks/useSyncParams";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { nameOf, snapshotKindLabel } from "../helpers/scheduleSync.helpers";
import { MODE_META, PAGE_LIMIT, SNAPSHOT_COLUMNS } from "../data/scheduleSync.data";

const SnapshotList = ({ page, onPageChange, onOpen }) => {
  const { data, isLoading, isError, refetch } = useQuery(
    scheduleSyncQueries.snapshots({ page, limit: PAGE_LIMIT }),
  );

  if (isLoading) return <LoaderCard title="Versiyalar yuklanmoqda..." />;
  if (isError) return <LoadError title="Versiyalarni yuklab bo'lmadi" onRetry={refetch} />;

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Archive}
          title="Hali versiya yo'q"
          description="Jadval almashtirilganda, qo'llanganda yoki tiklanganda oldingi holat shu yerga saqlanadi."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Jadval har safar almashtirilishidan oldin shu yerga saqlanadi — hech
        narsa yo'qolmaydi. Versiyani ochib, tiklansa nima o'zgarishini ko'rish
        mumkin.
      </p>

      <Table columns={SNAPSHOT_COLUMNS}>
        {rows.map((row) => (
          <Tr key={row.id}>
            <Td nowrap={false} className="min-w-48">
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="text-left font-medium text-gray-900 hover:text-primary"
              >
                {snapshotKindLabel(row)}
              </button>
              {MODE_META[row.mode] && (
                <div className="mt-1">
                  <Pill meta={MODE_META[row.mode]} />
                </div>
              )}
            </Td>
            <Td className="text-gray-600">{formatDateTimeUz(row.createdAt)}</Td>
            <Td className="text-gray-600">{nameOf(row.createdBy, "Tizim")}</Td>
            <Td align="center">{row.classCount}</Td>
            <Td align="center">{row.lessonCount}</Td>
            <Td nowrap={false} className="min-w-40 text-gray-600">
              {row.note || "—"}
            </Td>
            <Td align="right">
              <Button size="sm" variant="outline" onClick={() => onOpen(row.id)}>
                <Eye className="size-4" strokeWidth={1.5} />
                Ko'rish
              </Button>
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
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

/**
 * "Versiyalar" tabi — saqlangan jadvallar ro'yxati va bitta versiya.
 *
 * @param {{ status: object }} props
 */
const SnapshotsTab = ({ status }) => {
  const { page, snapshotId, setPage, openSnapshot, closeSnapshot } = useSyncParams();

  if (snapshotId) {
    return (
      <SnapshotDetail
        id={snapshotId}
        canSource={Boolean(status.can?.source)}
        onBack={closeSnapshot}
      />
    );
  }

  return <SnapshotList page={page} onPageChange={setPage} onOpen={openSnapshot} />;
};

export default SnapshotsTab;
