// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { getCollectionTone, getTrend } from "../data/financeReports.data";

/** O'tgan davrga nisbatan o'zgarish — foizni server hisoblaydi. */
const Delta = ({ change }) => {
  if (change == null) return null;

  const trend = getTrend(change);
  const Icon =
    trend.direction === "up"
      ? ArrowUpRight
      : trend.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trend.className)}>
      <Icon className="size-3.5" />
      {trend.sign}
      {change}%
    </span>
  );
};

const KpiCard = ({ icon: Icon, label, value, sub, change, valueClassName, accent }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-4 xs:p-5">
    {/* Yumshoq rangli fon — kartalarni bir-biridan ajratadi, raqamni bosmaydi */}
    <div
      className={cn("absolute -right-6 -top-6 size-24 rounded-full opacity-10", accent)}
    />

    <div className="relative flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <Icon className="size-4 shrink-0 text-gray-400" />
    </div>

    <p className={cn("relative mt-2 text-2xl font-bold text-gray-900", valueClassName)}>
      {value}
    </p>

    <div className="relative mt-1 flex flex-wrap items-center gap-2">
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
      <Delta change={change} />
    </div>
  </div>
);

/**
 * Sahifaning yuqori qatori — to'rt savolga bir qarashda javob:
 * qancha hisobladik, qancha yig'dik, qancha qoldi, qanchasi undirildi.
 */
const ReportKpiCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { totals, previous } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={Receipt}
        accent="bg-blue-500"
        label="Hisoblangan"
        value={formatMoney(totals.invoiced)}
        sub={`${totals.invoiceCount} ta majburiyat`}
        change={previous?.invoicedChange}
      />

      <KpiCard
        icon={Wallet}
        accent="bg-green-500"
        label="Yig'ilgan"
        value={formatMoney(totals.collected)}
        sub={`${totals.studentCount} ta o'quvchi`}
        change={previous?.collectedChange}
        valueClassName="text-green-700"
      />

      <KpiCard
        icon={TrendingUp}
        accent="bg-red-500"
        label="Qarz"
        value={formatMoney(totals.debt)}
        sub="Yig'ilmagan qoldiq"
        valueClassName="text-red-600"
      />

      <KpiCard
        icon={PiggyBank}
        accent="bg-indigo-500"
        label="Undirish foizi"
        value={`${totals.collectionRate}%`}
        sub={`Depozitda ${formatMoney(totals.depositBalance)}`}
        valueClassName={getCollectionTone(totals.collectionRate)}
      />
    </div>
  );
};

export default ReportKpiCards;
