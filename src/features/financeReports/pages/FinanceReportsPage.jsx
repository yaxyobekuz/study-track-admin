// React
import { useMemo, useState } from "react";

// Icons
import { Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Select from "@/shared/components/ui/select/Select";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ReportKpiCards from "../components/ReportKpiCards";
import { InvoicedVsCollectedChart, DebtBuildupChart } from "../components/OverviewCharts";
import { CashflowChart, AccountShareChart } from "../components/CashflowCharts";
import {
  DebtAgingChart,
  DebtByClassChart,
  DebtByMonthChart,
  TopDebtorsList,
} from "../components/DebtCharts";
import { TariffShareChart, DiscountProrationChart } from "../components/TariffCharts";
import {
  IncomeSourceChart,
  IncomeCategoryChart,
  IncomeTrendChart,
  RecentIncomeList,
} from "../components/ExternalIncomeCharts";
import {
  ExpenseSourceChart,
  ExpenseCategoryChart,
  ExpenseTrendChart,
  RecentExpenseList,
} from "../components/ExpenseCharts";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  monthKeyToInputValue,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  CASHFLOW_GROUP_OPTIONS,
  PERIOD_OPTIONS,
  REPORT_TABS,
} from "../data/financeReports.data";
import { reportQueries } from "../queries/financeReports.queries";

/** YYYYMM dan N oy orqaga — mavjud `prevMonthKey` ustida (maks 24 qadam). */
const shiftMonths = (monthKey, back) => {
  let month = monthKey;
  for (let i = 0; i < back; i += 1) month = prevMonthKey(month);
  return month;
};

/** YYYYMM → "YYYY-MM-01" (kunlik so'rov uchun oraliq boshi). */
const monthStartIso = (monthKey) => `${monthKeyToInputValue(monthKey)}-01`;

/**
 * MOLIYA HISOBOTLARI — kirim bo'yicha to'rt savolga javob:
 * qancha hisobladik, qancha pul kirdi, qancha qoldi, qayerdan keladi.
 *
 * Har bir tab O'Z ma'lumotini oladi va faqat aktiv tab mount bo'ladi
 * (`TabsButtons` naqshi, `LeadAnalyticsPage` bilan bir xil) — ko'rinmayotgan
 * diagrammalar og'ir yig'ma so'rovlarni yubormaydi.
 */
const FinanceReportsPage = () => {
  const { can } = usePermissions();
  const allowed = can("reports.view");

  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("12");
  const [groupBy, setGroupBy] = useState("day");

  const range = useMemo(() => {
    const toMonth = currentMonthKey();
    const fromMonth = shiftMonths(toMonth, Number(period) - 1);
    return {
      fromMonth: monthKeyToInputValue(fromMonth),
      toMonth: monthKeyToInputValue(toMonth),
      // Tushum kunlik, shuning uchun oy kaliti sanaga aylantiriladi
      from: monthStartIso(fromMonth),
    };
  }, [period]);

  const monthParams = { fromMonth: range.fromMonth, toMonth: range.toMonth };

  // ⚠️ `enabled` — ruxsat yo'q bo'lsa so'rov umuman yuborilmaydi va faqat
  // AKTIV tab so'raydi: to'rtala hisobot ham og'ir yig'ma so'rov.
  const overview = useQuery({
    ...reportQueries.overview(monthParams),
    enabled: allowed && (tab === "overview" || tab === "debt"),
  });

  const cashflow = useQuery({
    ...reportQueries.cashflow({ from: range.from, groupBy }),
    enabled: allowed && tab === "cashflow",
  });

  const debt = useQuery({
    ...reportQueries.debt({}),
    enabled: allowed && tab === "debt",
  });

  const tariffs = useQuery({
    ...reportQueries.tariffs(monthParams),
    enabled: allowed && tab === "tariffs",
  });

  const external = useQuery({
    ...reportQueries.external({ from: range.from }),
    enabled: allowed && tab === "external",
  });

  const expenses = useQuery({
    ...reportQueries.expenses({ from: range.from }),
    enabled: allowed && tab === "expenses",
  });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Moliya hisobotlarini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const contentByTab = {
    overview: (
      <div className="space-y-4">
        <ReportKpiCards data={overview.data} isLoading={overview.isLoading} />

        {/* SOF NATIJA — kassaga tushgan va kassadan chiqqan pul.
            Majburiyat emas: bu haqiqiy pul harakati. */}
        {overview.data?.cash && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Kassaga tushdi"
              value={formatMoney(overview.data.cash.income)}
              valueClassName="text-green-700"
              sub="To'lov va tashqi kirim"
            />
            <SummaryTile
              label="Kassadan chiqdi"
              value={formatMoney(overview.data.cash.expense)}
              valueClassName="text-red-600"
              sub={`Oylik ${formatMoney(overview.data.cash.salary)}`}
            />
            <SummaryTile
              label={overview.data.cash.isProfit ? "Sof foyda" : "Sof zarar"}
              value={formatMoney(overview.data.cash.net)}
              valueClassName={
                overview.data.cash.isProfit ? "text-green-700" : "text-red-600"
              }
              sub="Kirim − chiqim"
            />
          </div>
        )}
        <InvoicedVsCollectedChart
          data={overview.data}
          isLoading={overview.isLoading}
          isError={overview.isError}
        />
        <DebtBuildupChart
          data={overview.data}
          isLoading={overview.isLoading}
          isError={overview.isError}
        />
      </div>
    ),

    cashflow: (
      <div className="space-y-4">
        <CashflowChart
          data={cashflow.data}
          isLoading={cashflow.isLoading}
          isError={cashflow.isError}
          action={
            <Select
              triggerClassName="min-w-32"
              value={groupBy}
              options={CASHFLOW_GROUP_OPTIONS}
              onChange={setGroupBy}
            />
          }
        />

        {cashflow.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Jami tushum"
              value={formatMoney(cashflow.data.totals.amount)}
              sub={`${cashflow.data.totals.count} ta chek`}
            />
            <SummaryTile
              label="O'rtacha chek"
              value={formatMoney(cashflow.data.totals.averageReceipt)}
              sub="Bitta to'lovga o'rtacha"
            />
            <SummaryTile
              label="Depozitga tushgan"
              value={formatMoney(cashflow.data.totals.toDeposit)}
              sub="Qarzdan ortib qolgan pul"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Manba kesimi — tashqi kirim qo'shilgach "Jami tushum" ikki
              qismdan iborat bo'ldi, buni ko'rsatmasak raqam tushunarsiz qolardi */}
          <IncomeSourceChart
            data={cashflow.data}
            isLoading={cashflow.isLoading}
            isError={cashflow.isError}
          />
          <AccountShareChart
            data={cashflow.data}
            isLoading={cashflow.isLoading}
            isError={cashflow.isError}
          />
        </div>
      </div>
    ),

    debt: (
      <div className="space-y-4">
        {debt.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Jami qarz"
              value={formatMoney(debt.data.totals.debt)}
              valueClassName="text-red-600"
              sub={`${debt.data.asOfMonthLabel} holatiga`}
            />
            <SummaryTile
              label="Qarzdorlar"
              value={`${debt.data.totals.debtorCount} ta`}
              sub="O'quvchi"
            />
            <SummaryTile
              label="Eng eski qarz"
              value={debt.data.totals.oldestMonthLabel ?? "—"}
              sub="Shu oydan beri to'lanmagan"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DebtAgingChart data={debt.data} isLoading={debt.isLoading} isError={debt.isError} />
          <DebtByMonthChart data={debt.data} isLoading={debt.isLoading} isError={debt.isError} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DebtByClassChart data={debt.data} isLoading={debt.isLoading} isError={debt.isError} />
          <TopDebtorsList data={debt.data} isLoading={debt.isLoading} isError={debt.isError} />
        </div>
      </div>
    ),

    tariffs: (
      <div className="space-y-4">
        {tariffs.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Berilgan chegirma"
              value={formatMoney(tariffs.data.totals.discountTotal)}
              sub="Ongli qaror bilan"
            />
            <SummaryTile
              label="Proratsiya"
              value={formatMoney(tariffs.data.totals.prorationTotal)}
              sub="Oy o'rtasida kelganlar uchun"
            />
            <SummaryTile
              label="Nolga tushgan"
              value={`${tariffs.data.totals.wipedByDiscount} ta`}
              sub="Chegirma summani to'liq yopgan"
              valueClassName={
                tariffs.data.totals.wipedByDiscount > 0 ? "text-amber-600" : undefined
              }
            />
          </div>
        )}

        <TariffShareChart
          data={tariffs.data}
          isLoading={tariffs.isLoading}
          isError={tariffs.isError}
        />
        <DiscountProrationChart
          data={tariffs.data}
          isLoading={tariffs.isLoading}
          isError={tariffs.isError}
        />
      </div>
    ),

    external: (
      <div className="space-y-4">
        {external.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Jami tashqi kirim"
              value={formatMoney(external.data.totals.amount)}
              valueClassName="text-green-700"
              sub={`${external.data.totals.count} ta yozuv`}
            />
            <SummaryTile
              label="Kategoriyalar"
              value={`${external.data.totals.categoryCount} ta`}
              sub="Pul kelayotgan manbalar"
            />
            <SummaryTile
              label="Eng katta manba"
              value={external.data.byCategory[0]?.categoryName ?? "—"}
              sub={
                external.data.byCategory[0]
                  ? `${external.data.byCategory[0].share}% ulush`
                  : "Hali yozuv yo'q"
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <IncomeCategoryChart
            data={external.data}
            isLoading={external.isLoading}
            isError={external.isError}
          />
          <IncomeTrendChart
            data={external.data}
            isLoading={external.isLoading}
            isError={external.isError}
          />
        </div>

        <RecentIncomeList
          data={external.data}
          isLoading={external.isLoading}
          isError={external.isError}
        />
      </div>
    ),

    expenses: (
      <div className="space-y-4">
        {expenses.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryTile
              label="Jami chiqim"
              value={formatMoney(expenses.data.totals.amount)}
              valueClassName="text-red-600"
              sub="Kassadan chiqqan pul"
            />
            <SummaryTile
              label="Xodimlar oyligi"
              value={formatMoney(expenses.data.totals.salary)}
              sub="To'langan qismi"
            />
            <SummaryTile
              label="Oylik qarzimiz"
              value={formatMoney(expenses.data.totals.salaryDebt)}
              valueClassName={
                Number(expenses.data.totals.salaryDebt) > 0
                  ? "text-amber-600"
                  : undefined
              }
              sub={`${expenses.data.totals.salaryDebtCount} ta to'lanmagan majburiyat`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ExpenseSourceChart
            data={expenses.data}
            isLoading={expenses.isLoading}
            isError={expenses.isError}
          />
          <ExpenseCategoryChart
            data={expenses.data}
            isLoading={expenses.isLoading}
            isError={expenses.isError}
          />
        </div>

        <ExpenseTrendChart
          data={expenses.data}
          isLoading={expenses.isLoading}
          isError={expenses.isError}
        />

        <RecentExpenseList
          data={expenses.data}
          isLoading={expenses.isLoading}
          isError={expenses.isError}
        />
      </div>
    ),
  };

  const items = REPORT_TABS.map((item) => ({
    ...item,
    content: contentByTab[item.value],
  }));

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Moliya hisobotlari</h1>
          {overview.data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {overview.data.fromMonthLabel} — {overview.data.toMonthLabel}
            </p>
          )}
        </div>

        <Select
          triggerClassName="min-w-40"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={setPeriod}
        />
      </div>

      <TabsButtons
        items={items}
        value={tab}
        onChange={setTab}
        listClassName="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
        triggerClassName="shrink-0"
        contentClassName="mt-4"
      />
    </div>
  );
};

/** Diagramma tepasidagi kichik raqam kartasi. */
const SummaryTile = ({ label, value, sub, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </Card>
);

export default FinanceReportsPage;
