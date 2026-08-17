// React
import { useState } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// Icons
import { PiggyBank, Users, Wallet } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import RecordPaymentModal from "../components/RecordPaymentModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  FINANCE_STATUS_META,
  RESOLVE_REASON_LABELS,
  STUDENT_FINANCE_TABLE_COLUMNS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

const FILTER_OPTIONS = [
  { label: "Barchasi", value: "all" },
  { label: "Qarzdorlar", value: "debtors" },
  { label: "Depoziti borlar", value: "deposit" },
  { label: "Tarifsizlar", value: "noTariff" },
];

/**
 * Kassirning asosiy ekrani.
 *
 * O'quvchini topadi → qarzini va depozitini ko'radi → to'lovni qabul
 * qiladi. Qatorda hamma narsa bir qarashda: tarif, chegirma, shu oydagi
 * summa, depozit va JAMI qarz (bitta oy emas, hammasi).
 */
const StudentsFinancePage = () => {
  const { openModal } = useModal();
  const [month, setMonth] = useState(currentMonthKey);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const filter = searchParams.get("filter") || "all";
  const classId = searchParams.get("classId") || "";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
      if (key !== "page") prev.delete("page");
      return prev;
    });

  const { data: classes = [] } = useQuery(classesQueries.list());

  const { data, isLoading } = useQuery(
    financeQueries.studentRegistry({
      page,
      limit: 24,
      month,
      ...(filter !== "all" ? { filter } : {}),
      ...(classId ? { classId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
  );

  const students = data?.data ?? [];
  const pagination = data?.pagination;
  const totals = data?.totals;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <InputField
          name="search"
          value={search}
          placeholder="O'quvchini qidirish..."
          className="min-w-52 flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={String(month)}
          triggerClassName="min-w-40"
          options={MONTH_OPTIONS}
          onChange={(v) => setMonth(Number(v))}
        />

        <Select
          value={filter}
          triggerClassName="min-w-40"
          options={FILTER_OPTIONS}
          onChange={(v) => setParam("filter", v)}
        />

        <SelectSearch
          value={classId}
          triggerClassName="min-w-44"
          placeholder="Barcha sinflar"
          onChange={(v) => setParam("classId", v)}
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      {/* Yig'ma */}
      {totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-gray-500">Jami qarz</p>
            <p className="mt-1 text-xl font-semibold text-red-600">
              {formatMoney(totals.totalDebt)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {totals.debtorCount} ta qarzdor
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500">Depozitda</p>
            <p className="mt-1 text-xl font-semibold text-blue-600">
              {formatMoney(totals.totalBalance)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Oldindan to'langan</p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500">O'quvchilar</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {pagination?.total ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{data?.monthLabel}</p>
          </Card>
        </div>
      )}

      {/* Jadval */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : students.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Users}
            title="O'quvchi topilmadi"
            description="Qidiruv yoki filtrlarni o'zgartirib ko'ring."
          />
        </Card>
      ) : (
        <Table columns={STUDENT_FINANCE_TABLE_COLUMNS}>
          {students.map((student) => {
            const statusMeta = FINANCE_STATUS_META[student.status];
            const reason = RESOLVE_REASON_LABELS[student.tariffReason];

            return (
              <Tr key={student.id}>
                <Td nowrap={false}>
                  <Link
                    to={`/users/${student.id}?tab=finance`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {student.fullName}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {student.className || "Sinfsiz"}
                    {student.status !== "active" && (
                      <span
                        className={`ml-1.5 rounded-md px-1.5 py-0.5 ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    )}
                  </p>
                </Td>

                <Td className="text-gray-500">
                  {student.tariff ? (
                    student.tariff.name
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${reason?.className ?? ""}`}
                    >
                      {reason?.label ?? "—"}
                    </span>
                  )}
                </Td>

                <Td nowrap={false}>
                  {student.discounts.length === 0 ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {student.discounts.map((discount) => (
                        <span
                          key={discount.id}
                          title={discount.name}
                          className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                        >
                          {discount.valueLabel}
                        </span>
                      ))}
                    </div>
                  )}
                </Td>

                <Td align="right" className="font-medium">
                  {student.monthlyAmount ? formatMoney(student.monthlyAmount) : "—"}
                </Td>

                <Td align="right">
                  {Number(student.balance) > 0 ? (
                    <span className="font-medium text-blue-600">
                      {formatMoney(student.balance)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </Td>

                <Td align="right">
                  {student.hasDebt ? (
                    <span className="font-medium text-red-600">
                      {formatMoney(student.debt)}
                    </span>
                  ) : (
                    <span className="text-green-600">Qarzsiz</span>
                  )}
                </Td>

                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <Can do="finance.pay">
                      <button
                        title="To'lov qabul qilish"
                        onClick={() => openModal("recordPayment", { student })}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                      >
                        <Wallet className="size-3.5" />
                      </button>
                    </Can>

                    <Link
                      to={`/users/${student.id}?tab=finance`}
                      title="Moliya kartasi"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PiggyBank className="size-3.5" />
                    </Link>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(next) => setParam("page", next)}
        />
      )}

      <RecordPaymentModal />
    </div>
  );
};

export default StudentsFinancePage;
