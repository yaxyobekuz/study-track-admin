// React
import { useState } from "react";

// Icons
import { CirclePause, Search, XCircle } from "lucide-react";

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
import { CancelSuspensionModal, CreateSuspensionModal } from "../components/SuspensionModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  DEDUCTION_STATUS_META,
  DEDUCTION_STATUS_OPTIONS,
  SUSPENSION_COLUMNS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";

/**
 * OYLIKNI TO'XTATISH — registr (Moliya → "Oylikni to'xtatish").
 *
 * Ro'yxat OY KESIMIDA: tanlangan oyni qamragan to'xtatishlar va o'sha oyda
 * har biri qancha summani va nechta xodimni to'xtatgani. Oylik
 * shakllantirilgan bo'lsa summa MUHRDAN, aks holda jonli hisobdan.
 */
const PayrollSuspensionsPage = () => {
  const { openModal } = useModal();

  const [month, setMonth] = useState(monthKeyToInputValue(currentMonthKey()));
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const monthKey = inputValueToMonthKey(month);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isLoading } = useQuery(
    payrollQueries.suspensions({
      page,
      limit: 20,
      ...(monthKey ? { month: monthKey } : {}),
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
  );

  const items = data?.data ?? [];
  const openCreate = () => openModal("createSuspension", { month: monthKey });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
          />

          <Select
            triggerClassName="min-w-40"
            value={status}
            options={DEDUCTION_STATUS_OPTIONS}
            onChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
          />

          <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-primary">
            <Search className="size-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Xodim, sabab yoki qo'shimcha"
              className="w-52 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <Can do="payroll.suspend">
          <Button variant="danger" onClick={openCreate}>
            <CirclePause />
            Oylikni to'xtatish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryTile
            label={`${data.monthLabel} — to'xtatilgan`}
            value={formatMoney(data.totals.monthAmount)}
            valueClassName="text-red-600"
            sub={data.totals.hasAllStaff ? "Barcha xodimlar uchun to'xtatish bor" : "Faol to'xtatishlar bo'yicha"}
          />
          <SummaryTile label="Faol yozuvlar" value={String(data.totals.activeCount)} />
        </div>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={CirclePause}
            title="To'xtatilgan oylik yo'q"
            description={`${formatMonthKey(monthKey)} uchun oylik to'xtatilmagan. Bitta, tanlangan yoki barcha xodimlar uchun oylikning butunini yoki bir qismini (asosiy, tyutorlik, qo'shimcha) to'xtatish mumkin.`}
            action={
              !debouncedSearch && (
                <Can do="payroll.suspend">
                  <Button variant="danger" onClick={openCreate}>
                    <CirclePause />
                    Oylikni to'xtatish
                  </Button>
                </Can>
              )
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={SUSPENSION_COLUMNS}>
            {items.map((row) => {
              const badge = DEDUCTION_STATUS_META[row.status];
              const isCancelled = row.status === "cancelled";

              return (
                <Tr key={row.id} className={cn(isCancelled && "opacity-60")}>
                  <Td className="font-medium text-gray-900">
                    <span className={cn(row.isAllStaff && "text-red-700")}>{row.staffName}</span>
                    <span className="block text-xs font-normal text-gray-400">
                      {row.createdByName} · {row.createdAtLabel}
                    </span>
                  </Td>

                  <Td nowrap={false} className="text-gray-700">
                    <span className="font-medium">{row.componentLabel}</span>
                    <span className="block text-xs text-gray-500">{row.reason}</span>
                    {row.note && <span className="block text-xs text-gray-400">{row.note}</span>}
                  </Td>

                  <Td className="text-gray-500">{row.periodLabel}</Td>

                  {/* Shu oyda aynan qancha — muhrdan yoki jonli hisobdan */}
                  <Td align="right">
                    {row.monthAmount != null ? (
                      <span className="font-medium text-red-600">
                        − {formatMoney(row.monthAmount)}
                        <span className="block text-xs font-normal text-gray-400">
                          {row.monthStaffCount} ta xodim
                        </span>
                      </span>
                    ) : (
                      <span
                        className="text-gray-400"
                        title={
                          isCancelled
                            ? "Bekor qilingan"
                            : "Bu qism yo'q, allaqachon to'xtatilgan yoki oylik to'langan"
                        }
                      >
                        —
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {isCancelled && row.cancelReason && (
                      <span className="block max-w-48 truncate text-xs text-gray-400" title={row.cancelReason}>
                        {row.cancelReason}
                      </span>
                    )}
                  </Td>

                  <Td>
                    {!isCancelled && (
                      <Can do="payroll.suspend">
                        <div className="flex justify-end">
                          <button
                            title="Bekor qilish — oylik qaytadi"
                            onClick={() => openModal("cancelSuspension", { suspension: row })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <XCircle className="size-3.5" />
                          </button>
                        </div>
                      </Can>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={page < data.pagination.totalPages}
              hasPrevPage={page > 1}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CreateSuspensionModal />
      <CancelSuspensionModal />
    </div>
  );
};

const SummaryTile = ({ label, value, sub, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </Card>
);

export default PayrollSuspensionsPage;
