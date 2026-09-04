// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert, Plus, UserPlus, ShieldOff, Ban, RotateCcw } from "lucide-react";

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
  DAMAGE_COLUMNS,
  DAMAGE_REASON_OPTIONS,
  DAMAGE_STATUS_OPTIONS,
  SEALED_HINT,
  getDamageStatusBadge,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import { useUnwaiveDamage } from "../queries/inventory.mutations";

/**
 * ZARARLAR REGISTRI.
 *
 * Har bir hodisa uchta yo'ldan birini tanlaydi:
 *   → aybdorga yoziladi (`charge`)
 *   → maktab hisobidan qoplanadi (`waive`)
 *   → xato yozuv sifatida bekor qilinadi (`cancel`)
 *
 * ⚠️ Summani TAHRIRLASH tugmasi YO'Q: u hodisa paytidagi narxda
 * muhrlangan. Bu ataylab — narx keyin oshsa, o'tgan zarar qimmatlashib
 * qolmasligi kerak.
 */
const DamagesPage = () => {
  const { openModal } = useModal();
  const { mutate: unwaive } = useUnwaiveDamage();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState("");

  const { data, isLoading } = useQuery(
    inventoryQueries.damages({
      page,
      limit: 20,
      ...(status ? { status } : {}),
      ...(reason ? { reason } : {}),
      ...(locationId ? { locationId } : {}),
    }),
  );

  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const items = data?.data ?? [];

  const handleUnwaive = (damage) => {
    unwaive(damage.id, {
      onSuccess: () => toast.success("Qaror qaytarildi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
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
            triggerClassName="min-w-44"
            value={status}
            placeholder="Barcha holatlar"
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={DAMAGE_STATUS_OPTIONS}
          />

          {/* Sabab kesimi — "nega yo'qotdik" degan savol "kim to'laydi"
              dan alohida javob talab qiladi */}
          <Select
            triggerClassName="min-w-48"
            value={reason}
            placeholder="Barcha sabablar"
            onChange={(v) => {
              setReason(v);
              setPage(1);
            }}
            options={DAMAGE_REASON_OPTIONS}
          />
        </div>

        <Can do="damages.create">
          <Button onClick={() => openModal("inventoryDamage", {})}>
            <Plus />
            Zarar qayd etish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniStat label="Hodisalar" value={`${data.totals.count} ta`} />
            <MiniStat label="Jami zarar" value={formatMoney(data.totals.amount)} />
            <MiniStat
              label="Aybdorlarga yozilgan"
              value={formatMoney(data.totals.chargedAmount)}
              className="text-blue-700"
            />
            <MiniStat
              label="Qaror kutmoqda"
              value={formatMoney(data.totals.unchargedAmount)}
              className="text-amber-700"
            />
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={TriangleAlert}
            title="Zarar yo'q"
            description="Kunlik hisobotdan kelgan va qo'lda kiritilgan zararlar shu yerda ko'rinadi."
            action={
              <Can do="damages.create">
                <Button onClick={() => openModal("inventoryDamage", {})}>
                  <Plus />
                  Zarar qayd etish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={DAMAGE_COLUMNS}>
            {items.map((damage) => {
              const badge = getDamageStatusBadge(damage.status);
              const isCancelled = damage.status === "cancelled";
              const canCharge = damage.status === "pending" || damage.status === "charged";

              return (
                <Tr key={damage.id} className={cn(isCancelled && "opacity-50")}>
                  <Td className="text-gray-500">{formatDateUz(damage.occurredAt)}</Td>

                  <Td className="font-medium text-gray-900">
                    {damage.itemName}
                    {/* Yorliqlar SERVERDAN tayyor keladi (`kindLabel` /
                        `reasonLabel`) — enum kalitini yorliqqa aylantirish
                        frontendning ishi emas */}
                    <span className="block text-xs font-normal text-gray-400">
                      {damage.kindLabel}
                      {damage.reasonLabel && ` · ${damage.reasonLabel}`}
                    </span>
                  </Td>

                  <Td className="text-gray-500">{damage.locationName}</Td>

                  <Td align="right" className="text-gray-900">
                    {damage.quantity}
                    <span className="ml-1 text-xs text-gray-400">{damage.unit}</span>
                  </Td>

                  <Td
                    align="right"
                    className={cn(
                      "font-semibold",
                      isCancelled ? "text-gray-400 line-through" : "text-gray-900",
                    )}
                  >
                    {formatMoney(damage.amount)}
                  </Td>

                  <Td align="right" className="text-gray-500">
                    {formatMoney(damage.chargedAmount)}
                    {Number(damage.unchargedAmount) > 0 && damage.status !== "waived" && (
                      <span className="block text-xs text-amber-600">
                        qoldiq {formatMoney(damage.unchargedAmount)}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {canCharge && Number(damage.unchargedAmount) > 0 && (
                        <Can do="damages.charge">
                          <IconButton
                            title="Aybdorga yozish"
                            icon={UserPlus}
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => openModal("inventoryCharge", { damage })}
                          />
                        </Can>
                      )}

                      {damage.status === "waived" ? (
                        <Can do="damages.waive">
                          <IconButton
                            title="Qarorni qaytarish"
                            icon={RotateCcw}
                            className="hover:bg-gray-100 hover:text-gray-600"
                            onClick={() => handleUnwaive(damage)}
                          />
                        </Can>
                      ) : (
                        canCharge && (
                          <Can do="damages.waive">
                            <IconButton
                              title="Maktab hisobidan"
                              icon={ShieldOff}
                              className="hover:bg-gray-100 hover:text-gray-600"
                              onClick={() => openModal("inventoryWaive", { damage })}
                            />
                          </Can>
                        )
                      )}

                      {!isCancelled && (
                        <Can do="damages.cancel">
                          <IconButton
                            title="Bekor qilish"
                            icon={Ban}
                            className="hover:bg-red-50 hover:text-red-500"
                            onClick={() => openModal("inventoryCancelDamage", { damage })}
                          />
                        </Can>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>

          <p className="text-xs text-gray-500">{SEALED_HINT}</p>

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

const IconButton = ({ icon: Icon, title, className, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    className={cn("rounded-lg p-1.5 text-gray-400", className)}
  >
    <Icon className="size-3.5" />
  </button>
);

export default DamagesPage;
