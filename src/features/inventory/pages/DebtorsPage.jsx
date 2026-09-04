// React
import { useState } from "react";

// Icons
import { Wallet, HandCoins, Ban, Receipt } from "lucide-react";

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
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  CHARGE_COLUMNS,
  DEBTOR_COLUMNS,
  NO_ADVANCE_HINT,
  PAYMENT_COLUMNS,
  getChargeStatusBadge,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";

/**
 * QARZDORLAR — "kim qancha qarzdor va qanchasi undirildi".
 *
 * ⚠️ O'QISH TO'LOVI QARZDORLARI BILAN CHALKASHMASIN (/finance/main/debtors):
 * u yerda hisob-faktura qarzi, bu yerda moddiy zarar qarzi. Ikkalasi ham
 * "qarz", lekin manbasi va undirish jarayoni butunlay boshqa — shuning
 * uchun ro'yxat ham alohida.
 */
const DebtorsPage = () => {
  const [tab, setTab] = useState("people");

  const tabs = [
    { value: "people", label: "Qarzdorlar", content: <DebtorList /> },
    { value: "charges", label: "Qarzlar", content: <ChargeList /> },
    { value: "payments", label: "Undiruvlar", content: <PaymentList /> },
  ];

  return <TabsButtons items={tabs} value={tab} onChange={setTab} contentClassName="mt-4" />;
};

// ─────────────────────────────────────────────
// Odam kesimi
// ─────────────────────────────────────────────

const DebtorList = () => {
  const { openModal } = useModal();
  const [overdueOnly, setOverdueOnly] = useState(false);

  const { data, isLoading } = useQuery(
    inventoryQueries.debtors({ ...(overdueOnly ? { overdueOnly: "true" } : {}) }),
  );

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant={overdueOnly ? "default" : "outline"}
          onClick={() => setOverdueOnly((v) => !v)}
        >
          Faqat muddati o'tganlar
        </Button>

        {data?.totals && (
          <p className="text-sm text-gray-500">
            {data.totals.count} ta qarzdor ·{" "}
            <span className="font-semibold text-red-600">
              {formatMoney(data.totals.amount)}
            </span>
          </p>
        )}
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Qarzdor yo'q"
            description="Moddiy zarar bo'yicha undirilmagan qarz yo'q."
          />
        </Card>
      ) : (
        <Table columns={DEBTOR_COLUMNS}>
          {items.map((debtor) => (
            <Tr key={debtor.personId}>
              <Td className="font-medium text-gray-900">{debtor.personName}</Td>

              <Td className="text-gray-500">
                {debtor.className || debtor.role || "—"}
              </Td>

              <Td align="right" className="text-gray-500">
                {debtor.chargeCount}
              </Td>

              <Td align="right" className="text-gray-900">
                {formatMoney(debtor.amount)}
              </Td>

              <Td align="right" className="text-green-700">
                {formatMoney(debtor.paidAmount)}
              </Td>

              <Td align="right" className="font-semibold text-red-600">
                {formatMoney(debtor.remainingAmount)}
              </Td>

              <Td>
                <div className="flex items-center justify-end">
                  <Can do="damages.pay">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openModal("inventoryDamagePayment", {
                          personId: debtor.personId,
                          personName: debtor.personName,
                        })
                      }
                    >
                      <HandCoins />
                      Undirish
                    </Button>
                  </Can>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <p className="text-xs text-gray-500">{NO_ADVANCE_HINT}</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Qarzlar registri
// ─────────────────────────────────────────────

const ChargeList = () => {
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("outstanding");

  const { data, isLoading } = useQuery(
    inventoryQueries.charges({
      page,
      limit: 20,
      ...(filter === "outstanding" ? { outstanding: "true" } : {}),
      ...(filter === "overdue" ? { overdue: "true" } : {}),
      ...(filter === "paid" ? { status: "paid" } : {}),
    }),
  );

  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          triggerClassName="min-w-44"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
          options={[
            { label: "To'lanmaganlar", value: "outstanding" },
            { label: "Muddati o'tganlar", value: "overdue" },
            { label: "To'langanlar", value: "paid" },
            { label: "Barchasi", value: "all" },
          ]}
        />

        {data?.totals && (
          <p className="text-sm text-gray-500">
            Jami {formatMoney(data.totals.amount)} · to'langan{" "}
            <span className="text-green-700">{formatMoney(data.totals.paidAmount)}</span> ·
            qoldiq{" "}
            <span className="font-semibold text-red-600">
              {formatMoney(data.totals.remainingAmount)}
            </span>
          </p>
        )}
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Qarz yo'q"
            description="Zarar aybdorga yozilganda bu yerda qator paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={CHARGE_COLUMNS}>
            {items.map((charge) => {
              const badge = getChargeStatusBadge(charge);

              return (
                <Tr key={charge.id}>
                  <Td className="font-medium text-gray-900">
                    {charge.personName}
                    {charge.personSnapshot?.className && (
                      <span className="block text-xs font-normal text-gray-400">
                        {charge.personSnapshot.className}
                      </span>
                    )}
                  </Td>

                  <Td className="text-gray-500">
                    {charge.damage?.itemName ?? "—"}
                    <span className="block text-xs text-gray-400">
                      {charge.damage?.locationName ?? ""}
                      {charge.damage?.occurredAt &&
                        ` · ${formatDateUz(charge.damage.occurredAt)}`}
                    </span>
                  </Td>

                  <Td align="right" className="text-gray-900">
                    {formatMoney(charge.amount)}
                  </Td>

                  <Td align="right" className="text-green-700">
                    {formatMoney(charge.paidAmount)}
                  </Td>

                  <Td
                    align="right"
                    className={cn(
                      "font-semibold",
                      Number(charge.remainingAmount) > 0 ? "text-red-600" : "text-gray-300",
                    )}
                  >
                    {formatMoney(charge.remainingAmount)}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {charge.dueDate && (
                      <span className="block text-xs text-gray-400">
                        {formatDateUz(charge.dueDate, { utc: true })} gacha
                      </span>
                    )}
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {charge.status !== "paid" && charge.status !== "cancelled" && (
                        <>
                          <Can do="damages.pay">
                            <button
                              title="Undirish"
                              onClick={() =>
                                openModal("inventoryDamagePayment", {
                                  personId: charge.personId,
                                  personName: charge.personName,
                                })
                              }
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            >
                              <HandCoins className="size-3.5" />
                            </button>
                          </Can>

                          {Number(charge.paidAmount) === 0 && (
                            <Can do="damages.cancel">
                              <button
                                title="Bekor qilish"
                                onClick={() => openModal("inventoryCancelCharge", { charge })}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Ban className="size-3.5" />
                              </button>
                            </Can>
                          )}
                        </>
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

// ─────────────────────────────────────────────
// Undiruvlar
// ─────────────────────────────────────────────

const PaymentList = () => {
  const { openModal } = useModal();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(inventoryQueries.payments({ page, limit: 20 }));
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      {data?.totals && (
        <Card>
          <p className="text-xs font-medium text-gray-500">Undirilgan jami</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {formatMoney(data.totals.amount)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {data.totals.count} ta to'lov · bekor qilinganlari sanalmaydi
          </p>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Receipt}
            title="Undiruv yo'q"
            description="Aybdordan pul qabul qilinganda bu yerda chek paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={PAYMENT_COLUMNS}>
            {items.map((payment) => (
              <Tr key={payment.id} className={cn(payment.isVoided && "opacity-50")}>
                <Td className="font-mono text-xs text-gray-500">#{payment.receiptNo}</Td>
                <Td className="text-gray-500">{formatDateUz(payment.paidAt)}</Td>
                <Td className="font-medium text-gray-900">{payment.personName}</Td>
                <Td className="text-gray-500">{payment.accountName ?? "—"}</Td>

                <Td
                  align="right"
                  className={cn(
                    "font-semibold",
                    payment.isVoided ? "text-gray-400 line-through" : "text-green-700",
                  )}
                >
                  {formatMoney(payment.amount)}
                </Td>

                <Td>
                  <div className="flex items-center justify-end">
                    {payment.isVoided ? (
                      <span className="text-xs text-gray-400">Bekor qilingan</span>
                    ) : (
                      <Can do="damages.void">
                        <button
                          title="Bekor qilish"
                          onClick={() => openModal("inventoryVoidPayment", { payment })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Ban className="size-3.5" />
                        </button>
                      </Can>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
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

export default DebtorsPage;
