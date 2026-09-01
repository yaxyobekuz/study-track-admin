// React
import { useState } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// Icons
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Lock,
  Users,
  Wallet,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import RecordPaymentModal from "../components/RecordPaymentModal";
import RemindDebtorsModal from "../components/RemindDebtorsModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  DEBTOR_SORT_OPTIONS,
  DEBTOR_TABLE_COLUMNS,
  getDebtAgeMeta,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const StatCard = ({ icon: Icon, label, value, sub, className }) => (
  <Card className="flex items-center gap-3">
    <span className={`rounded-xl p-2.5 ${className}`}>
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-lg font-semibold text-gray-900">{value}</p>
      {sub && <p className="truncate text-[11px] text-gray-400">{sub}</p>}
    </div>
  </Card>
);

/**
 * QARZDORLAR — "kimdan undirish kerak" degan savolga javob beradigan ekran.
 *
 * Ro'yxat o'quvchidan emas, QARZDAN boshlanadi: server to'lanmagan
 * majburiyatlarni guruhlab, qarzi bor o'quvchilarnigina qaytaradi. Shuning
 * uchun "jami qarz" har qanday sahifada bir xil — u butun ro'yxatniki,
 * ko'rinib turgan qatorlarniki emas.
 */
const DebtorsPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const allowed = can("debtors.view");

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const classId = searchParams.get("classId") || "";
  const sort = searchParams.get("sort") || "debt";

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

  const { data, isLoading } = useQuery({
    ...financeQueries.debtors({
      page,
      limit: 24,
      sort,
      ...(classId ? { classId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    // Ruxsat yo'q bo'lsa so'rov ham yuborilmaydi — 403 ni kutib turishning
    // ma'nosi yo'q va konsolda keraksiz xato paydo bo'lardi.
    enabled: allowed,
  });

  const debtors = data?.data ?? [];
  const pagination = data?.pagination;
  const totals = data?.totals;
  const currentMonth = data?.currentMonth;

  const isFiltered = Boolean(classId || debouncedSearch);

  // Havolani to'g'ridan-to'g'ri ochgan xodimga tushunarli javob berish
  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Qarzdorlar ro'yxatini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Yig'ma — filtrga bo'ysunadi, shuning uchun sinf tanlansa o'sha
          sinfning qarzi ko'rinadi */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label={isFiltered ? "Tanlangan bo'yicha qarz" : "Jami qarz"}
          value={formatMoney(totals?.totalDebt)}
          className="bg-red-50 text-red-600"
        />
        <StatCard
          icon={Users}
          label="Qarzdorlar"
          value={`${totals?.debtorCount ?? 0} ta`}
          className="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={CalendarClock}
          label="Eng eski qarz"
          value={totals?.oldestMonthLabel ?? "—"}
          sub={
            totals?.oldestMonth && currentMonth
              ? getDebtAgeMeta(totals.oldestMonth, currentMonth).label
              : null
          }
          className="bg-gray-100 text-gray-600"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-2">
        <InputField
          name="search"
          type="search"
          value={search}
          placeholder="O'quvchini qidirish..."
          className="min-w-52 flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />

        <SelectSearch
          value={classId}
          triggerClassName="min-w-44"
          placeholder="Barcha sinflar"
          onChange={(v) => setParam("classId", v)}
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
        />

        <Select searchable
          value={sort}
          triggerClassName="min-w-40"
          options={DEBTOR_SORT_OPTIONS}
          onChange={(v) => setParam("sort", v)}
        />

        {/* Faqat SHU SAHIFADAGI qarzdorlarga — butun ro'yxatga emas. Xodim
            kimga xabar ketishini ko'rib turgan bo'lishi kerak, "hammasi"
            esa keyingi sahifalardagi ko'rinmagan odamlarni ham qamrardi. */}
        {debtors.length > 0 && (
          <Can do="debtors.remind">
            <Button
              variant="secondary"
              onClick={() =>
                openModal("remindDebtors", {
                  students: debtors.map((d) => ({
                    id: d.id,
                    fullName: d.fullName,
                    debt: d.debt,
                  })),
                })
              }
            >
              <BellRing />
              Eslatma yuborish ({debtors.length})
            </Button>
          </Can>
        )}
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : debtors.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={CheckCircle2}
            title={isFiltered ? "Qarzdor topilmadi" : "Qarzdor yo'q"}
            description={
              isFiltered
                ? "Tanlangan shart bo'yicha qarzdor o'quvchi yo'q. Filtrni o'zgartirib ko'ring."
                : "Hamma o'quvchi to'lovini yopgan. Yangi majburiyatlar shakllantirilgach bu ro'yxat to'ladi."
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={DEBTOR_TABLE_COLUMNS}>
            {debtors.map((debtor) => {
              const age = getDebtAgeMeta(debtor.oldestMonth, currentMonth);

              return (
                <Tr key={debtor.id}>
                  <Td>
                    <Link
                      to={`/users/${debtor.id}?tab=finance`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {debtor.fullName}
                    </Link>
                    {/* Arxivlangan o'quvchining qarzi ham ko'rinadi —
                        arxivlash qarzni bekor qilmaydi */}
                    {debtor.isArchived && (
                      <span className="block text-xs text-gray-400">
                        arxivlangan
                      </span>
                    )}
                  </Td>

                  <Td className="text-gray-500">{debtor.unpaidCount} oy</Td>

                  <Td>
                    <span className="text-gray-700">{debtor.oldestMonthLabel}</span>
                    <span
                      className={`ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${age.className}`}
                    >
                      {age.label}
                    </span>
                  </Td>


                  <Td className="font-semibold text-red-600">
                    {formatMoney(debtor.debt)}
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Can do="debtors.remind">
                        <Button
                          size="sm"
                          variant="secondary"
                          title="Ota-onaga eslatma yuborish"
                          onClick={() =>
                            openModal("remindDebtors", {
                              students: [
                                {
                                  id: debtor.id,
                                  fullName: debtor.fullName,
                                  debt: debtor.debt,
                                },
                              ],
                            })
                          }
                        >
                          <BellRing />
                          Eslatma
                        </Button>
                      </Can>

                      <Can do="finance.pay">
                        <Button
                          size="sm"
                          onClick={() =>
                            openModal("recordPayment", {
                              student: {
                                id: debtor.id,
                                fullName: debtor.fullName,
                              },
                            })
                          }
                        >
                          To'lov qabul qilish
                        </Button>
                      </Can>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={(next) => setParam("page", next)}
            />
          )}
        </>
      )}

      <RecordPaymentModal />
      <RemindDebtorsModal />
    </div>
  );
};

export default DebtorsPage;
