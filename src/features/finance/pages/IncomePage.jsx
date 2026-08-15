// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Recharts
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Icons
import { ArrowDownToLine, HandCoins, Banknote, Percent, Plus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Counter from "@/shared/components/ui/Counter";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import AddIncomeModal from "../components/AddIncomeModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  currentMonthKey,
  buildMonthOptions,
  formatMonthKey,
} from "@/shared/helpers/month.helpers";

// Data & queries
import { financeQueries } from "../queries/finance.queries";
import {
  RECENT_INCOME_COLUMNS,
  PAYMENT_METHOD_LABELS,
  TREND_MONTHS_BACK,
} from "../data/income.data";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/** To'lovdagi o'quvchi nomi (snapshot yoki bog'langan yozuvdan). */
const paymentStudentName = (payment) => {
  const s = payment.student;
  if (!s) return "—";
  return [s.firstName, s.lastName].filter(Boolean).join(" ") || s.username || "—";
};

const IncomePage = () => {
  const { openModal } = useModal();
  const [month, setMonth] = useState(currentMonthKey);

  const { data: summary } = useQuery(financeQueries.invoiceSummary(month));
  const { data: trend = [] } = useQuery(
    financeQueries.incomeTrend(month, TREND_MONTHS_BACK),
  );
  const { data: recent } = useQuery(
    financeQueries.paymentList({ page: 1, limit: 8 }),
  );

  const payments = recent?.data ?? [];

  // Oylik yig'ilgan foizi
  const collectPct =
    summary && Number(summary.totals.amount) > 0
      ? Math.round(
          (Number(summary.totals.paid) / Number(summary.totals.amount)) * 100,
        )
      : 0;

  // Asosiy ko'rsatkichlar — mavjud stat-karta naqshi (Card + Counter + ikonka).
  // Pul qiymatlari `formatMoney` bilan formatlanadi, foiz `%` bilan.
  const statItems = [
    {
      label: "Bu oy yig'ilgan (kirim)",
      value: Number(summary?.totals.paid ?? 0),
      icon: ArrowDownToLine,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      formatter: (v) => formatMoney(v),
      sub: summary ? `${summary.counts.paid} ta to'liq to'langan` : "",
    },
    {
      label: "Yig'ilishi kerak (qoldiq)",
      value: Number(summary?.totals.debt ?? 0),
      icon: HandCoins,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      formatter: (v) => formatMoney(v),
      sub: summary
        ? `${summary.counts.unpaid + summary.counts.partial} ta to'lanmagan`
        : "",
    },
    {
      label: "Jami hisoblangan",
      value: Number(summary?.totals.amount ?? 0),
      icon: Banknote,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      formatter: (v) => formatMoney(v),
      sub: summary ? `${summary.counts.invoiced} ta majburiyat` : "",
    },
    {
      label: "Yig'ilgan foiz",
      value: collectPct,
      icon: Percent,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      suffix: "%",
      sub: formatMonthKey(month),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kirim — umumiy holat</h1>
          <p className="text-sm text-gray-400">
            {formatMonthKey(month)} oyi bo'yicha yig'ilgan to'lovlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(month)}
            triggerClassName="min-w-40"
            options={MONTH_OPTIONS}
            onChange={(v) => setMonth(Number(v))}
          />

          <Can do="finance.pay">
            <Button onClick={() => openModal("addIncome")}>
              <Plus />
              Kirim qo'shish
            </Button>
          </Can>
        </div>
      </div>

      {/* Asosiy ko'rsatkichlar — Card + Counter (mavjud stat-karta naqshi) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, idx) => (
          <Card key={idx} title={item.label} className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center justify-center size-9 ${item.bgColor} rounded-full`}
              >
                <item.icon
                  className={`size-5 ${item.color}`}
                  strokeWidth={1.5}
                />
              </div>

              {summary ? (
                <Counter
                  value={item.value}
                  suffix={item.suffix}
                  formatter={item.formatter}
                  className={`text-lg font-bold ${item.color}`}
                />
              ) : (
                <Skeleton className="h-7 w-20" />
              )}
            </div>

            {item.sub && (
              <p className="text-xs text-gray-500">{item.sub}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Kirim trendi */}
      <Card title="Oxirgi oylar kirim trendi">
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={48}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(v) => (v >= 1e6 ? `${v / 1e6}M` : v)}
              />
              <Tooltip
                formatter={(v) => formatMoney(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Area
                name="Kirim"
                type="monotone"
                dataKey="collected"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* So'nggi kirimlar (kassa registri) */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          So'nggi kirimlar
        </h2>

        {payments.length === 0 ? (
          <Card className="text-center">
            <p className="text-sm text-gray-500">Hozircha kirim yo'q</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {RECENT_INCOME_COLUMNS.map((column, index) => (
                    <th
                      key={column || index}
                      className="px-4 py-3 text-left text-white font-medium whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {paymentStudentName(payment)}
                      </p>
                      {payment.student?.username && (
                        <p className="text-xs text-gray-500">
                          @{payment.student.username}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600">
                      {formatMoney(payment.amount)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {payment.methodLabel ||
                        PAYMENT_METHOD_LABELS[payment.method] ||
                        payment.method}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {formatUzDate(payment.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recent?.totals && payments.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Jami qayd etilgan kirim: {formatMoney(recent.totals.totalAmount)} ·{" "}
            {recent.totals.count} ta to'lov
          </p>
        )}
      </div>

      {/* Modals */}
      <AddIncomeModal />
    </div>
  );
};

export default IncomePage;
