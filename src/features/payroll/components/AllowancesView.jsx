// React
import { useState } from "react";

// Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BadgePercent, Clock3, Wallet } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";

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

const SOURCE_META = {
  request: "bg-indigo-50 text-indigo-700",
  rule: "bg-gray-100 text-gray-600",
  admin: "bg-blue-50 text-blue-700",
};

/**
 * USTAMA HAQ ko'rinishi — "Yo'nalish → Ustama haq".
 *
 * Har bir ustama komponenti alohida qator: kimga, nomi, turi, shu oydagi
 * summasi, MANBASI (tasdiqlangan zayavka / oylik qoidasi / admin) va HOLATI.
 * Kutilayotgan zayavkalar ko'rinadi, lekin summaga QO'SHILMAYDI —
 * tasdiqlanmagan ustama payrollga ta'sir qilmaydi.
 */
const AllowancesView = ({ month, departmentId }) => {
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
            description="Ustama xodim qatoridagi 'Oylik/ustama belgilash' orqali yoki o'qituvchi zayavkasi tasdiqlanganda paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={ALLOWANCE_VIEW_COLUMNS}>
            {rows.map((row) => (
              <Tr key={row.key}>
                <Td className="font-medium text-gray-900">
                  {row.fullName}
                  <span className="block text-xs font-normal text-gray-400">{row.role}</span>
                </Td>

                <Td className="text-gray-500">{row.departmentName || "—"}</Td>

                <Td nowrap={false}>
                  <p className="text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.periodLabel}</p>
                </Td>

                <Td align="right" className="text-gray-600">
                  {row.type === "percent" ? `${Number(row.value)}%` : formatMoney(row.value)}
                </Td>

                <Td align="right" className="font-semibold">
                  {row.amount != null ? (
                    <span className="text-green-700">{formatMoney(row.amount)}</span>
                  ) : (
                    // Tasdiqlanmagan — summaga kirmaydi
                    <span className="text-gray-400">—</span>
                  )}
                </Td>

                <Td>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${SOURCE_META[row.source] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {row.sourceLabel}
                  </span>
                </Td>

                <Td>
                  {row.status === "active" ? (
                    <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Faol
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Kutilmoqda
                    </span>
                  )}
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
    </div>
  );
};

export default AllowancesView;
