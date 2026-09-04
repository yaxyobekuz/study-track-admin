// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ClipboardList, Plus, Trash2, ChevronRight } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  CHECK_COLUMNS,
  CHECK_STATUS_OPTIONS,
  getCheckStatusBadge,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import { useDeleteCheck } from "../queries/inventory.mutations";

/**
 * KUNLIK HISOBOTLAR RO'YXATI.
 *
 * Yuqorida — bugun hisobot bermagan xonalar. Bu ro'yxat kun davomida
 * eng ko'p kerak bo'ladigan blok: mas'ul shaxs shu yerdan to'g'ridan-
 * to'g'ri o'z varag'ini ochadi.
 */
const ChecksPage = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { mutate: deleteCheck } = useDeleteCheck();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState("");

  const { data, isLoading } = useQuery(
    inventoryQueries.checks({
      page,
      limit: 20,
      ...(status ? { status } : {}),
      ...(locationId ? { locationId } : {}),
    }),
  );

  const { data: pending } = useQuery(inventoryQueries.pendingChecks());
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());

  const items = data?.data ?? [];

  const handleDelete = (check) => {
    if (!window.confirm(`"${check.locationName}" qoralamasi o'chirilsinmi?`)) return;

    deleteCheck(check.id, {
      onSuccess: (result) => toast.success(result.message),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
      {/* ── Bugun hisobot bermaganlar ── */}
      {pending && pending.pendingCount > 0 && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-gray-900">
                Bugun hisobot kutilmoqda — {pending.pendingCount} ta xona
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">{pending.dateLabel}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {pending.locations.map((location) => (
              <Can key={location.id} do="monitoring.submit" fallback={
                <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
                  {location.name}
                </span>
              }>
                <button
                  onClick={() => openModal("inventoryOpenCheck", { locationId: location.id })}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
                >
                  {location.name}
                  <ChevronRight className="size-3.5" />
                </button>
              </Can>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filtrlar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            triggerClassName="min-w-48"
            value={locationId}
            placeholder="Barcha xonalar"
            onChange={(v) => {
              setLocationId(v);
              setPage(1);
            }}
            options={[
              { label: "Barcha xonalar", value: "" },
              ...locations.map((l) => ({ label: l.name, value: l.id })),
            ]}
          />

          <Select
            triggerClassName="min-w-36"
            value={status}
            placeholder="Barchasi"
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={CHECK_STATUS_OPTIONS}
          />
        </div>

        <Can do="monitoring.submit">
          <Button onClick={() => openModal("inventoryOpenCheck", {})}>
            <Plus />
            Hisobot ochish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniStat label="Yuborilgan hisobot" value={`${data.totals.submittedCount} ta`} />
            <MiniStat
              label="Singan"
              value={`${data.totals.brokenCount} ta`}
              className="text-amber-700"
            />
            <MiniStat
              label="Yo'qolgan"
              value={`${data.totals.missingCount} ta`}
              className="text-red-600"
            />
            <MiniStat
              label="Zarar summasi"
              value={formatMoney(data.totals.damageAmount)}
              className="text-gray-900"
            />
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={ClipboardList}
            title="Hisobot yo'q"
            description="Har kuni mas'ul shaxs o'z xonasidagi jihozlar holatini kiritib yuboradi."
            action={
              <Can do="monitoring.submit">
                <Button onClick={() => openModal("inventoryOpenCheck", {})}>
                  <Plus />
                  Hisobot ochish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={CHECK_COLUMNS}>
            {items.map((check) => {
              const badge = getCheckStatusBadge(check);

              return (
                <Tr
                  key={check.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/inventory/checks/${check.id}`)}
                >
                  <Td className="text-gray-500">
                    {formatDateUz(check.date, { utc: true })}
                  </Td>

                  <Td className="font-medium text-gray-900">{check.locationName}</Td>
                  <Td className="text-gray-500">{check.reporterName ?? "—"}</Td>

                  <Td
                    align="right"
                    className={cn(check.brokenCount > 0 ? "font-medium text-amber-700" : "text-gray-300")}
                  >
                    {check.brokenCount}
                  </Td>

                  <Td
                    align="right"
                    className={cn(check.missingCount > 0 ? "font-medium text-red-600" : "text-gray-300")}
                  >
                    {check.missingCount}
                  </Td>

                  <Td align="right" className="font-semibold text-gray-900">
                    {formatMoney(check.damageAmount)}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end">
                      {check.isDraft && (
                        <Can do="monitoring.delete">
                          <button
                            title="Qoralamani o'chirish"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(check);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </Can>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

const MiniStat = ({ label, value, className }) => (
  <div>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={cn("mt-0.5 text-lg font-bold text-gray-900", className)}>{value}</p>
  </div>
);

export default ChecksPage;
