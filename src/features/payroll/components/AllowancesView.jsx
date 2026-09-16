// React
import { useState } from "react";

// Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BadgePercent, Clock3, Wallet } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  ALLOWANCE_VIEW_COLUMNS,
  ALLOWANCE_STATUS_OPTIONS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";

const SummaryTile = ({ icon: Icon, label, value, cls }) => (
  <Card className="flex items-center gap-3">
    <span className={`rounded-xl p-2.5 ${cls}`}>
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </Card>
);

// Chip rangi manbaga qarab: zayavka / qoida / admin / kutilmoqda
const chipTone = (item) => {
  if (item.status === "pending") return "bg-amber-50 text-amber-700";
  if (item.source === "request") return "bg-indigo-50 text-indigo-700";
  if (item.source === "rule") return "bg-gray-100 text-gray-600";
  return "bg-blue-50 text-blue-700";
};

/**
 * USTAMALAR — "Yo'nalish → Ustamalar" tanlanganda. XODIMLAR RO'YXATI:
 * har qator bitta xodim, uning barcha ustamalari chiplarda (nomi, summasi,
 * manbasi), shu oydagi jami va holati. Kutilayotgan zayavka summasiz
 * ko'rinadi — tasdiqlanmaguncha oylikka qo'shilmaydi.
 *
 * Hamyon tugmasi bilan shu yerning o'zidan ustama qo'shiladi (oylik
 * qoidasi orqali) — xodimlar jadvalidagi bilan bir xil oyna.
 */
const AllowancesView = ({ month, departmentId }) => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    payrollQueries.allowancesView({
      month,
      page,
      limit: 24,
      ...(departmentId ? { departmentId } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    }),
  );

  const rows = data?.data ?? [];
  const totals = data?.totals;
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Yig'ma */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          icon={Wallet}
          label={`Faol ustamalar jami (${data?.monthLabel ?? ""})`}
          value={formatMoney(totals?.activeAmount)}
          cls="bg-green-50 text-green-600"
        />
        <SummaryTile
          icon={BadgePercent}
          label="Faol ustama komponentlari"
          value={`${totals?.activeCount ?? 0} ta`}
          cls="bg-blue-50 text-blue-600"
        />
        <SummaryTile
          icon={Clock3}
          label="Kutilayotgan zayavkalar"
          value={`${totals?.pendingCount ?? 0} ta`}
          cls="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Filtrlar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          triggerClassName="min-w-40"
          options={ALLOWANCE_STATUS_OPTIONS}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <input
          value={search}
          placeholder="Xodim qidirish..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 w-56 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : rows.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Ustama yo'q"
            description="Ustama xodim qatoridagi hamyon tugmasi orqali yoki o'qituvchi zayavkasi tasdiqlanganda paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={ALLOWANCE_VIEW_COLUMNS}>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td className="font-medium text-gray-900">
                  {row.fullName}
                  <span className="block text-xs font-normal text-gray-400">{row.role}</span>
                </Td>

                <Td className="text-gray-500">{row.departmentName || "—"}</Td>

                {/* Ustamalar chiplarda: nomi · summasi (kutilmoqda — summasiz) */}
                <Td nowrap={false}>
                  <div className="flex flex-wrap gap-1.5">
                    {row.items.map((item) => (
                      <span
                        key={item.key}
                        title={`${item.sourceLabel} · ${item.periodLabel}`}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${chipTone(item)}`}
                      >
                        {item.label}
                        {item.amount != null ? (
                          <> · {formatMoney(item.amount)}</>
                        ) : (
                          <> · kutilmoqda</>
                        )}
                        {item.type === "percent" && ` (${Number(item.value)}%)`}
                      </span>
                    ))}
                  </div>
                </Td>

                <Td align="right" className="font-semibold text-green-700">
                  {Number(row.activeTotal) > 0 ? formatMoney(row.activeTotal) : "—"}
                </Td>

                <Td>
                  <div className="flex flex-wrap items-center gap-1">
                    {row.activeItemCount > 0 && (
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {row.activeItemCount} faol
                      </span>
                    )}
                    {row.pendingCount > 0 && (
                      <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        {row.pendingCount} kutilmoqda
                      </span>
                    )}
                  </div>
                </Td>

                <Td>
                  <div className="flex items-center justify-end">
                    {/* Shu yerning o'zidan ustama qo'shish/tahrirlash —
                        xodimlar jadvalidagi hamyon tugmasi bilan bir xil */}
                    <Can do="payroll.assign">
                      <button
                        title="Ustama qo'shish / tahrirlash"
                        onClick={() =>
                          openModal("staffSalary", {
                            staff: { id: row.id, firstName: row.firstName, lastName: row.lastName },
                          })
                        }
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                      >
                        <Wallet className="size-3.5" />
                      </button>
                    </Can>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Hamyon tugmasi ishlashi uchun modal shu sahifada ham renderda
          bo'lishi kerak emas — PayrollPage'da allaqachon render qilinadi */}
    </div>
  );
};

export default AllowancesView;
