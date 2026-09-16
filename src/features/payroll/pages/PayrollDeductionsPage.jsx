// React
import { useState } from "react";

// Icons
import { MinusCircle, Search, XCircle } from "lucide-react";

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
import { CancelDeductionModal, CreateDeductionModal } from "../components/DeductionModals";

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
  DEDUCTION_COLUMNS,
  DEDUCTION_STATUS_META,
  DEDUCTION_STATUS_OPTIONS,
  formatDeductionValue,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";

/**
 * OYLIKDAN USHLAB QOLISH — registr (Moliya → "Ushlab qolish").
 *
 * Ro'yxat OY KESIMIDA: tanlangan oyni qamragan ushlab qolishlar va o'sha oyda
 * har biri qancha bo'lgani. Oylik shakllantirilgan bo'lsa summa MUHRDAN
 * (aynan shuncha ushlangan), aks holda jonli hisobdan.
 *
 * ⚠️ "Shu oy" bo'sh ("—") bo'lishi mumkin va bu xato emas: oylik to'lab
 * bo'lingandan keyin qo'shilgan ushlab qolish o'sha oyga ta'sir qilmaydi.
 */
const PayrollDeductionsPage = () => {
  const { openModal } = useModal();

  const [month, setMonth] = useState(monthKeyToInputValue(currentMonthKey()));
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const monthKey = inputValueToMonthKey(month);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isLoading } = useQuery(
    payrollQueries.deductions({
      page,
      limit: 20,
      ...(monthKey ? { month: monthKey } : {}),
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
  );

  const items = data?.data ?? [];
  const openCreate = () => openModal("createDeduction", { month: monthKey });

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

          <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3">
            <Search className="size-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Xodim yoki sabab"
              className="w-44 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <Can do="payroll.deduct">
          <Button onClick={openCreate}>
            <MinusCircle />
            Ushlab qolish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile
            label={`${data.monthLabel} — ushlab qolinadi`}
            value={formatMoney(data.totals.monthAmount)}
            valueClassName="text-red-600"
            sub="Faol ushlab qolishlar bo'yicha"
          />
          <SummaryTile label="Xodimlar" value={String(data.totals.staffCount)} />
          <SummaryTile label="Faol yozuvlar" value={String(data.totals.activeCount)} />
        </div>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={MinusCircle}
            title="Ushlab qolish yo'q"
            description={`${formatMonthKey(monthKey)} uchun ushlab qolish yozilmagan. Hammadan, tanlanganlardan yoki bitta xodimdan so'mda, foizda yoki dars soatida ushlab qolish mumkin.`}
            action={
              <Can do="payroll.deduct">
                <Button onClick={openCreate}>
                  <MinusCircle />
                  Ushlab qolish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={DEDUCTION_COLUMNS}>
            {items.map((row) => {
              const badge = DEDUCTION_STATUS_META[row.status];
              const isCancelled = row.status === "cancelled";

              return (
                <Tr key={row.id} className={cn(isCancelled && "opacity-60")}>
                  <Td className="font-medium text-gray-900">
                    {row.staffName}
                    <span className="block text-xs font-normal text-gray-400">
                      {row.createdByName} · {row.createdAtLabel}
                    </span>
                  </Td>

                  <Td nowrap={false} className="text-gray-700">
                    {row.reason}
                    {row.note && (
                      <span className="block text-xs text-gray-400">{row.note}</span>
                    )}
                  </Td>

                  <Td align="right" className="font-medium">
                    {formatDeductionValue(row.type, row.value)}
                  </Td>

                  <Td className="text-gray-500">{row.periodLabel}</Td>

                  {/* Shu oyda aynan qancha — muhrdan yoki jonli hisobdan */}
                  <Td align="right">
                    {row.monthAmount != null ? (
                      <span className="font-medium text-red-600">
                        − {formatMoney(row.monthAmount)}
                        {(row.monthCapped || row.monthSealed) && (
                          <span className="block text-xs font-normal text-gray-400">
                            {[row.monthSealed && "muhrlangan", row.monthCapped && "oylikdan oshmadi"]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span
                        className="text-gray-400"
                        title={
                          isCancelled
                            ? "Bekor qilingan"
                            : "Oylik to'langandan keyin qo'shilgan — shu oyga ta'sir qilmadi"
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
                      <Can do="payroll.deduct">
                        <div className="flex justify-end">
                          <button
                            title="Bekor qilish"
                            onClick={() => openModal("cancelDeduction", { deduction: row })}
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
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CreateDeductionModal />
      <CancelDeductionModal />
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

export default PayrollDeductionsPage;
