// React
import { useMemo, useState } from "react";

// Icons
import { CalendarDays, Lock, Target } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import KpiCards from "../components/KpiCards";
import { AccrualChart, CashflowChart, TrendChart } from "../components/TrendCharts";
import {
  DebtAgingCard,
  DebtCard,
  ExpenseStructureCard,
  RevenueStructureCard,
  TopExpensesCard,
} from "../components/StructureCards";
import { BudgetCard, DirectionsCard, PnlCard } from "../components/TableCards";
import {
  BudgetEditButton,
  ExpenseBudgetCard,
  IncomePlanCard,
  IncomePlanEditButton,
  PricingCard,
} from "../components/BudgetCards";
import {
  AccountsCard,
  RecentOperationsCard,
  ScorecardCard,
  TopDebtorsCard,
} from "../components/SideCards";
import { TargetsModal } from "../components/TargetsModal";
import { ExpenseBudgetModal } from "../components/ExpenseBudgetModal";
import { IncomePlanModal } from "../components/IncomePlanModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { buildMonthOptions, currentMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import { dashboardQueries } from "../queries/financeDashboard.queries";

/**
 * MOLIYA DASHBOARDI — moliya bo'limining bosh ekrani.
 *
 * Bitta ekranda: beshta KPI, P&L, daromad va xarajat tuzilmasi, 12 oylik
 * dinamika, cash flow, yo'nalishlar natijasi, bank hisoblari, debitor
 * qarzdorlik, byudjet ijrosi, maktab KPI lari va so'nggi operatsiyalar.
 *
 * ⚠️ IKKI SO'ROV, IKKI SABAB:
 *   `overview`  — butun moliyaviy manzara (og'ir yig'ma, oyga bog'liq)
 *   `scorecard` — maktab KPI lari (baho va davomat jadvallariga boradi)
 * Ular alohida, chunki moliyaviy bloklar tayyor bo'lishi bilan ko'rinishi
 * kerak: davomat yig'masini kutib butun ekranni bo'sh ushlab turish
 * "sahifa sekin" degan taassurot qoldirardi.
 *
 * ⚠️ RUXSAT: `reports.view` — ko'rish, `reports.plan` — reja belgilash.
 * Ikkalasi ham oddiy ruxsat kaliti, ya'ni tizim egasi ularni istalgan
 * xodimga "Ruxsatlar" sahifasidan bera oladi. Sahifada rolga qarab
 * tekshiruv YO'Q: rol emas, ruxsat hal qiladi.
 */
const FinanceDashboardPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const allowed = can("reports.view");
  const canPlan = can("reports.plan");

  const [month, setMonth] = useState(() => String(currentMonthKey()));
  const [compareMonth, setCompareMonth] = useState(() =>
    String(prevMonthKey(currentMonthKey())),
  );

  // Kelajakdagi oyning ma'lumoti bo'lmaydi — ro'yxat joriy oyda tugaydi
  const monthOptions = useMemo(() => buildMonthOptions({ back: 23, forward: 0 }).reverse(), []);

  // Taqqoslash oyi tanlangan oydan OLDIN bo'lishi shart (server ham
  // tekshiradi) — ro'yxatdan keyingi oylar olib tashlanadi
  const compareOptions = useMemo(
    () => monthOptions.filter((option) => Number(option.value) < Number(month)),
    [monthOptions, month],
  );

  // Oy o'zgarganda taqqoslash oyi undan keyinda qolib ketishi mumkin —
  // avtomatik oldingi oyga tushiriladi
  const safeCompareMonth = useMemo(() => {
    if (Number(compareMonth) < Number(month)) return compareMonth;
    return String(prevMonthKey(Number(month)));
  }, [compareMonth, month]);

  const params = { month, compareMonth: safeCompareMonth };

  const overview = useQuery({ ...dashboardQueries.overview(params), enabled: allowed });
  const scorecard = useQuery({
    ...dashboardQueries.scorecard({ month }),
    enabled: allowed,
  });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Moliya dashboardini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const state = {
    data: overview.data,
    isLoading: overview.isLoading,
    isError: overview.isError,
  };

  return (
    <div className="space-y-4 pb-10">
      {/* ── Boshqaruv paneli: oy, taqqoslash oyi va reja ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 xs:p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">Moliyaviy ko'rsatkichlar</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {overview.data
              ? `${overview.data.monthLabel} — ${overview.data.compareMonthLabel} bilan taqqoslanmoqda`
              : "Yuklanmoqda…"}
          </p>
        </div>

        {/* ⚠️ Ikki tanlagich YONMA-YON turadi va ikkalasi ham oy
            ko'rsatadi — yorliqsiz ular bir xil boshqaruvdek ko'rinardi.
            Chapdagisi "qaysi oyni ko'ryapmiz", o'ngdagisi "nima bilan
            solishtiramiz". */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-gray-400" />
            <Select
              triggerClassName="min-w-36"
              value={month}
              options={monthOptions}
              onChange={setMonth}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-gray-500">
              Taqqoslash:
            </span>
            <Select
              triggerClassName="min-w-36"
              value={safeCompareMonth}
              options={compareOptions}
              onChange={setCompareMonth}
            />
          </div>

          {canPlan && (
            <Button
              variant="outline"
              onClick={() => openModal("financeTargets", { month: Number(month) })}
            >
              <Target className="size-4" />
              Reja
            </Button>
          )}
        </div>
      </div>

      {/* ── 1-qator: beshta KPI kartasi ──────────────────────────────── */}
      <KpiCards data={overview.data} isLoading={overview.isLoading} />

      {/* ── 2-qator: P&L, dinamika, xarajat tuzilmasi ────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PnlCard {...state} />
        <TrendChart {...state} />
        <ExpenseStructureCard {...state} />
      </div>

      {/* ── 3-qator: daromad tuzilmasi, cash flow, qarzdorlik ────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RevenueStructureCard {...state} />
        <CashflowChart {...state} />
        <DebtCard {...state} />
      </div>

      {/* ── 4-qator: hisoblangan/yig'ilgan (keng) + qarz yoshi ───────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AccrualChart {...state} className="xl:col-span-2" />
        <DebtAgingCard {...state} />
      </div>

      {/* ── 5-qator: narx intizomi (keng) + top 5 xarajat ───────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PricingCard {...state} className="xl:col-span-2" />
        <TopExpensesCard {...state} />
      </div>

      {/* ── 6-qator: yo'nalishlar natijasi (keng) + bank hisoblari ───── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DirectionsCard {...state} className="xl:col-span-2" />
        <AccountsCard {...state} />
      </div>

      {/* ── 7-qator: byudjet ijrosi (keng) + xarajat limitlari ───────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BudgetCard
          {...state}
          className="xl:col-span-2"
          action={
            canPlan ? (
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => openModal("financeTargets", { month: Number(month) })}
              >
                Rejani tahrirlash
              </button>
            ) : null
          }
        />
        <ExpenseBudgetCard
          {...state}
          action={
            canPlan ? (
              <BudgetEditButton
                onClick={() => openModal("expenseBudgets", { month: Number(month) })}
              />
            ) : null
          }
        />
      </div>

      {/* ── 8-qator: bo'limlar bo'yicha yig'im (to'liq kenglik) ─────── */}
      <IncomePlanCard
        {...state}
        action={
          canPlan ? (
            <IncomePlanEditButton
              onClick={() => openModal("incomePlans", { month: Number(month) })}
            />
          ) : null
        }
      />

      {/* ── 9-qator: maktab KPI ko'rsatkichlari ──────────────────────── */}
      <ScorecardCard
        data={scorecard.data}
        isLoading={scorecard.isLoading}
        isError={scorecard.isError}
      />

      {/* ── 10-qator: so'nggi operatsiyalar (keng) + eng katta qarzdorlar ─ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentOperationsCard {...state} className="xl:col-span-2" />
        <TopDebtorsCard {...state} />
      </div>

      <TargetsModal />
      <ExpenseBudgetModal />
      <IncomePlanModal />
    </div>
  );
};

export default FinanceDashboardPage;
