// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import {
  ArrowLeftRight,
  Ban,
  Landmark,
  Pencil,
  Plus,
  Scale,
  Wallet,
} from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ReasonModal from "../components/ReasonModal";
import PaymentAccountModal from "../components/PaymentAccountModal";
import AccountTransferModal from "../components/AccountTransferModal";
import { AdjustAccountModal } from "../components/DepositModals";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data & queries
import {
  ACCOUNT_ENTRY_TABLE_COLUMNS,
  ENTRY_TYPE_META,
  ENTRY_TYPE_OPTIONS,
  TRANSFER_TABLE_COLUMNS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { useVoidTransfer } from "../queries/finance.mutations";

const VIEW_TABS = [
  { value: "entries", label: "Harakatlar" },
  { value: "transfers", label: "O'tkazmalar" },
];

/**
 * To'lov turlari — pul qayerga tushadi va qayerda turadi.
 *
 * Yuqorida turlar va ularning qoldig'i, pastda tanlangan turning
 * daftari. Daftar QO'SHILISH tartibida ko'rsatiladi ("Qoldiq" ustuni
 * shunga bog'liq) — orqaga sanalgan to'lov ro'yxat o'rtasiga tushib,
 * ustunni ma'nosiz qilib qo'ymasligi uchun.
 */
const AccountsPage = () => {
  const { openModal } = useModal();

  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("entries");
  const [entryType, setEntryType] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(financeQueries.accountList({}));
  const accounts = data?.items ?? [];

  // Birinchi hisob avtomatik tanlanadi — bo'sh ekran ma'nosiz
  const activeId = selectedId ?? accounts[0]?.id ?? null;
  const activeAccount = accounts.find((a) => a.id === activeId) ?? null;

  const { data: entriesData } = useQuery({
    ...financeQueries.accountEntries(activeId, {
      page,
      limit: 24,
      ...(entryType !== "all" ? { type: entryType } : {}),
    }),
    enabled: Boolean(activeId) && view === "entries",
  });

  const { data: transfersData } = useQuery({
    ...financeQueries.transferList({ page, limit: 24, includeVoided: "true" }),
    enabled: view === "transfers",
  });

  const { mutate: voidTransfer } = useVoidTransfer();

  const askVoidTransfer = (transfer) =>
    openModal("financeReason", {
      description: `${transfer.fromAccount?.name} → ${transfer.toAccount?.name}, ${formatMoney(transfer.amount)}`,
      consequences: [
        "Pul teskari yo'nalishda qaytariladi",
        "Eski yozuvlar o'chirilmaydi — kompensatsiya qatorlari yoziladi",
      ],
      confirmLabel: "Bekor qilish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        voidTransfer(
          { id: transfer.id, reason },
          {
            onSuccess: () => {
              close();
              toast.success("O'tkazma bekor qilindi");
            },
            onError: (err) =>
              toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Can do="finance.transfer">
          <Button
            variant="outline"
            onClick={() => openModal("accountTransfer", { fromAccount: activeAccount })}
          >
            <ArrowLeftRight />
            O'tkazma
          </Button>
        </Can>

        <Can do="finance.accounts">
          <Button onClick={() => openModal("paymentAccount", {})}>
            <Plus />
            To'lov turi qo'shish
          </Button>
        </Can>
      </div>

      {/* To'lov turlari */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : accounts.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Landmark}
            title="To'lov turi yo'q"
            description="To'lov qabul qilish uchun kamida bitta tur kerak: Naqd, terminal yoki bank hisob-raqami."
            action={
              <Can do="finance.accounts">
                <Button onClick={() => openModal("paymentAccount", {})}>
                  <Plus />
                  To'lov turi qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={cn(
                "cursor-pointer transition-colors",
                account.id === activeId && "ring-1 ring-primary",
              )}
              onClick={() => {
                setSelectedId(account.id);
                setPage(1);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{account.name}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Can do="finance.adjust">
                    <button
                      title="Qoldiqni to'g'rilash"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("adjustAccount", { account });
                      }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Scale className="size-3.5" />
                    </button>
                  </Can>

                  <Can do="finance.accounts">
                    <button
                      title="Tahrirlash"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("paymentAccount", {
                          account: { ...account, hasEntries: true },
                        });
                      }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </Can>
                </div>
              </div>

              <p className="mt-3 text-xl font-semibold text-gray-900">
                {formatMoney(account.balance)}
              </p>

              {!account.isActive && (
                <p className="mt-1 text-xs text-amber-700">Nofaol</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {accounts.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsButtons
              items={VIEW_TABS}
              value={view}
              onChange={(v) => {
                setView(v);
                setPage(1);
              }}
            />

            {view === "entries" && (
              <Select
                value={entryType}
                triggerClassName="min-w-44"
                options={ENTRY_TYPE_OPTIONS}
                onChange={(v) => {
                  setEntryType(v);
                  setPage(1);
                }}
              />
            )}
          </div>

          {view === "entries" ? (
            <EntriesView
              account={activeAccount}
              data={entriesData}
              page={page}
              onPageChange={setPage}
            />
          ) : (
            <TransfersView
              data={transfersData}
              page={page}
              onPageChange={setPage}
              onVoid={askVoidTransfer}
            />
          )}
        </>
      )}

      {/* Modals */}
      <PaymentAccountModal />
      <AccountTransferModal />
      <AdjustAccountModal />
      <ReasonModal />
    </div>
  );
};

/** Tanlangan to'lov turining daftari. */
const EntriesView = ({ account, data, page, onPageChange }) => {
  const entries = data?.data ?? [];
  const pagination = data?.pagination;
  const totals = data?.totals;

  if (entries.length === 0) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Wallet}
          title="Harakat yo'q"
          description={
            account
              ? `"${account.name}" bo'yicha hali pul harakati qayd etilmagan.`
              : "To'lov turini tanlang."
          }
        />
      </Card>
    );
  }

  return (
    <>
      {totals && (
        <p className="text-xs text-gray-500">
          Kirim {formatMoney(totals.income)} · chiqim {formatMoney(totals.expense)} ·{" "}
          {totals.count} ta yozuv
        </p>
      )}

      <Table columns={ACCOUNT_ENTRY_TABLE_COLUMNS}>
        {entries.map((entry) => {
          const meta = ENTRY_TYPE_META[entry.type];

          return (
            <Tr key={entry.id}>
              <Td className="text-gray-500">{formatDateUZ(entry.occurredAt)}</Td>

              <Td>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${meta?.className ?? ""}`}
                >
                  {meta?.label ?? entry.type}
                </span>
              </Td>

              <Td nowrap={false} className="text-gray-500">
                {entry.note || "—"}
              </Td>

              <Td
                align="right"
                className={cn(
                  "font-medium",
                  entry.isIncome ? "text-green-600" : "text-red-600",
                )}
              >
                {entry.isIncome ? "+" : ""}
                {formatMoney(entry.amount)}
              </Td>

              <Td align="right" className="text-gray-900">
                {formatMoney(entry.balanceAfter)}
              </Td>
            </Tr>
          );
        })}
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

/** To'lov turlari orasidagi o'tkazmalar. */
const TransfersView = ({ data, page, onPageChange, onVoid }) => {
  const transfers = data?.data ?? [];
  const pagination = data?.pagination;

  if (transfers.length === 0) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={ArrowLeftRight}
          title="O'tkazma yo'q"
          description="Naqd pulni bankka topshirganingizda shu yerda qayd etiladi."
        />
      </Card>
    );
  }

  return (
    <>
      <Table columns={TRANSFER_TABLE_COLUMNS}>
        {transfers.map((transfer) => (
          <Tr key={transfer.id} className={transfer.isVoided ? "opacity-50" : ""}>
            <Td className="text-gray-500">{formatDateUZ(transfer.occurredAt)}</Td>
            <Td>{transfer.fromAccount?.name ?? "—"}</Td>
            <Td>{transfer.toAccount?.name ?? "—"}</Td>

            <Td align="right" className="font-medium">
              {formatMoney(transfer.amount)}
              {Number(transfer.fee) > 0 && (
                <span className="ml-1 text-xs text-gray-400">
                  → {formatMoney(transfer.receivedAmount)}
                </span>
              )}
            </Td>

            <Td align="right" className="text-gray-500">
              {Number(transfer.fee) > 0 ? formatMoney(transfer.fee) : "—"}
            </Td>

            <Td>
              <div className="flex items-center justify-end gap-1">
                {!transfer.isVoided && (
                  <Can do="finance.transfer">
                    <button
                      title="Bekor qilish"
                      onClick={() => onVoid(transfer)}
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

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default AccountsPage;
