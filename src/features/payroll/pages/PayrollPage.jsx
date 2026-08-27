// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, Pencil, Plus, RefreshCw, Users, Wallet, XCircle } from "lucide-react";

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
import {
  SalaryRuleModal,
  SalaryPaymentModal,
  VoidSalaryPaymentModal,
  CancelPayrollEntryModal,
} from "../components/PayrollModals";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  monthKeyToInputValue,
  inputValueToMonthKey,
  formatMonthKey,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  ENTRY_STATUS_META,
  ENTRY_STATUS_OPTIONS,
  ENTRY_TABLE_COLUMNS,
  PAYROLL_TABS,
  RULE_TABLE_COLUMNS,
  SALARY_TYPE_META,
  getRuleStatus,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useGeneratePayroll, useCloseSalary } from "../queries/payroll.mutations";

/**
 * XODIMLAR OYLIGI — chiqim tomonining o'quvchi registriga o'xshashi.
 *
 * Qoida belgilanadi → har oy majburiyat hisoblanadi → to'lov uni yopadi.
 * Shu tufayli "kimga qancha qarzdormiz" degan savolga javob bor.
 */
const PayrollPage = () => {
  const [tab, setTab] = useState("entries");

  const tabs = PAYROLL_TABS.map((item) => ({
    ...item,
    content: item.value === "entries" ? <EntriesView /> : <RulesView />,
  }));

  return (
    <div className="space-y-4">
      <TabsButtons
        items={tabs}
        value={tab}
        onChange={setTab}
        contentClassName="mt-4"
      />

      <SalaryRuleModal />
      <SalaryPaymentModal />
      <VoidSalaryPaymentModal />
      <CancelPayrollEntryModal />
    </div>
  );
};

// ─────────────────────────────────────────────
// Oyliklar — majburiyatlar va to'lovlar
// ─────────────────────────────────────────────

const EntriesView = () => {
  const { openModal } = useModal();

  const [month, setMonth] = useState(monthKeyToInputValue(currentMonthKey()));
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const monthKey = inputValueToMonthKey(month);

  const { data, isLoading } = useQuery(
    payrollQueries.entries({
      page,
      limit: 20,
      ...(monthKey ? { month: monthKey } : {}),
      ...(status ? { status } : {}),
    }),
  );

  const { mutate: generate, isPending: isGenerating } = useGeneratePayroll();

  const items = data?.data ?? [];

  const handleGenerate = () => {
    generate(
      { month: monthKey },
      {
        onSuccess: (result) => {
          if (result.created > 0) {
            toast.success(
              `${result.monthLabel}: ${result.created} ta oylik shakllantirildi`,
            );
          } else if (result.skipped.alreadyExists > 0) {
            toast.info("Bu oy allaqachon shakllantirilgan");
          } else {
            toast.warning("Oylik belgilangan xodim topilmadi");
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
          />

          <Select
            triggerClassName="min-w-40"
            value={status}
            options={ENTRY_STATUS_OPTIONS}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
        </div>

        <Can do="payroll.generate">
          <Button onClick={handleGenerate} loading={isGenerating}>
            <RefreshCw />
            Shakllantirish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile
            label="Hisoblangan"
            value={formatMoney(data.totals.accrued)}
            sub={`${data.pagination?.total ?? 0} ta majburiyat`}
          />
          <SummaryTile
            label="To'langan"
            value={formatMoney(data.totals.paid)}
            valueClassName="text-green-700"
          />
          <SummaryTile
            label="Qarzimiz"
            value={formatMoney(data.totals.debt)}
            valueClassName="text-red-600"
            sub="Xodimlarga to'lanmagan"
          />
        </div>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Oylik majburiyati yo'q"
            description={
              monthKey
                ? `${formatMonthKey(monthKey)} uchun hali shakllantirilmagan. "Qoidalar" tabida xodimlarga oylik belgilang, so'ng "Shakllantirish" tugmasini bosing.`
                : "Oy tanlang."
            }
            action={
              <Can do="payroll.generate">
                <Button onClick={handleGenerate} loading={isGenerating}>
                  <RefreshCw />
                  Shakllantirish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={ENTRY_TABLE_COLUMNS}>
            {items.map((entry) => {
              const badge = ENTRY_STATUS_META[entry.status];
              const isCancelled = entry.status === "cancelled";

              return (
                <Tr key={entry.id} className={cn(isCancelled && "opacity-50")}>
                  <Td className="font-medium text-gray-900">
                    {entry.staffName}
                    {entry.roleLabel && (
                      <span className="block text-xs font-normal text-gray-400">
                        {entry.roleLabel}
                      </span>
                    )}
                  </Td>

                  <Td className="text-gray-500">{entry.monthLabel}</Td>
                  <Td className="font-medium">
                    {formatMoney(entry.amount)}
                    {Number(entry.kpiAmount) > 0 && (
                      <span className="block text-xs font-normal text-gray-400">
                        {Number(entry.fixedAmount) > 0
                          ? `Fiksa ${formatMoney(entry.fixedAmount)} + `
                          : ""}
                        KPI {formatMoney(entry.kpiAmount)} ({entry.lessonHours} soat)
                      </span>
                    )}
                  </Td>
                  <Td className="text-green-600">{formatMoney(entry.paidAmount)}</Td>

                  <Td>
                    {isCancelled ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className="font-medium text-red-600">
                        {formatMoney(entry.debt)}
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
                      {!isCancelled && entry.status !== "paid" && (
                        <>
                          <Can do="payroll.pay">
                            <button
                              title="To'lash"
                              onClick={() =>
                                openModal("salaryPayment", {
                                  staff: {
                                    id: entry.staffId,
                                    firstName: entry.staffSnapshot?.firstName,
                                    lastName: entry.staffSnapshot?.lastName,
                                  },
                                })
                              }
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            >
                              <Wallet className="size-3.5" />
                            </button>
                          </Can>

                          {Number(entry.paidAmount) === 0 && (
                            <Can do="payroll.cancel">
                              <button
                                title="Majburiyatni bekor qilish"
                                onClick={() =>
                                  openModal("cancelPayrollEntry", { entry })
                                }
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <XCircle className="size-3.5" />
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
// Qoidalar — kimga qancha oylik
// ─────────────────────────────────────────────

const RulesView = () => {
  const { openModal } = useModal();
  const [page, setPage] = useState(1);
  const now = currentMonthKey();

  const { data, isLoading } = useQuery(payrollQueries.salaries({ page, limit: 20 }));
  const { mutate: closeSalary } = useCloseSalary();

  const items = data?.data ?? [];

  const handleClose = (rule) => {
    closeSalary(
      { id: rule.id },
      {
        onSuccess: () => toast.success("Qoida yopildi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Kimga qancha oylik belgilangani — fiksa, dars soatlariga qarab KPI, yoki
          ikkalasi. Har oy shu qoidadan majburiyat hisoblanadi.
        </p>

        <Can do="payroll.assign">
          <Button onClick={() => openModal("staffSalary", {})}>
            <Plus />
            Oylik belgilash
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Users}
            title="Oylik belgilanmagan"
            description="Xodimlarga fiksa oylik belgilang — keyin har oy majburiyat avtomatik hisoblanadi."
            action={
              <Can do="payroll.assign">
                <Button onClick={() => openModal("staffSalary", {})}>
                  <Plus />
                  Oylik belgilash
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={RULE_TABLE_COLUMNS}>
            {items.map((rule) => {
              const badge = getRuleStatus(rule, now);
              const typeMeta = SALARY_TYPE_META[rule.type] ?? SALARY_TYPE_META.fixed;

              return (
                <Tr key={rule.id}>
                  <Td className="font-medium text-gray-900">
                    {rule.staffName}
                    {rule.staff?.role && (
                      <span className="block text-xs font-normal text-gray-400">
                        {rule.staff.role}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeMeta.className}`}
                    >
                      {typeMeta.label}
                    </span>
                  </Td>

                  <Td className="font-medium">
                    {Number(rule.fixedAmount) > 0 && (
                      <span className="block">{formatMoney(rule.fixedAmount)}</span>
                    )}
                    {Number(rule.perHourRate) > 0 && (
                      <span className="block text-xs font-normal text-indigo-600">
                        {formatMoney(rule.perHourRate)} / dars soati
                      </span>
                    )}
                    {Number(rule.fixedAmount) === 0 &&
                      Number(rule.perHourRate) === 0 && (
                        <span className="text-gray-400">—</span>
                      )}
                  </Td>
                  <Td nowrap={false} className="text-gray-500">
                    {rule.periodLabel}
                    {rule.note && (
                      <span className="block text-xs text-gray-400">{rule.note}</span>
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
                      <Can do="payroll.assign">
                        <button
                          title="Tahrirlash"
                          onClick={() => openModal("staffSalary", { rule })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </Can>

                      {rule.isOpen && (
                        <Can do="payroll.assign">
                          <button
                            title="Qoidani yopish"
                            onClick={() => handleClose(rule)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Ban className="size-3.5" />
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

const SummaryTile = ({ label, value, sub, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </Card>
);

export default PayrollPage;
