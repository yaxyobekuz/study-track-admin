// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Components
import ChartCard from "./ChartCard";
import MoneyTooltip from "./MoneyTooltip";

// Data
import {
  CHART_COLORS,
  CHART_PALETTE,
  compactMoney,
} from "../data/financeReports.data";

const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
};

/** Chiqim ranglari — oylik va boshqa xarajat doim bir xil rangda. */
const SOURCE_COLORS = {
  salary: "#f97316", // to'q sariq — xodimlar oyligi
  other: "#a855f7", // binafsha — boshqa xarajatlar
};

/**
 * Chiqim qayerga ketgani: xodimlar oyligi va boshqa xarajatlar.
 *
 * ⚠️ Oylik bu yerda TO'LANGAN pul bo'yicha. Hisoblangan-u to'lanmagani —
 * bu "qarzimiz" va u alohida ko'rsatiladi (kassadan chiqmagan).
 */
export const ExpenseSourceChart = ({ data, isLoading, isError }) => {
  const items = (data?.bySource ?? [])
    .map((row) => ({ ...row, amountNum: Number(row.amount) }))
    .filter((row) => row.amountNum > 0);

  return (
    <ChartCard
      title="Pul qayerga ketdi"
      hint="Xodimlar oyligi va boshqa xarajatlar"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu davrda chiqim bo'lmagan"
      height={260}
    >
      <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
        <div className="h-full w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="amountNum"
                nameKey="label"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {items.map((item, index) => (
                  <Cell
                    key={item.key}
                    fill={
                      SOURCE_COLORS[item.key] ??
                      CHART_PALETTE[index % CHART_PALETTE.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-2 sm:w-1/2">
          {items.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    SOURCE_COLORS[item.key] ??
                    CHART_PALETTE[index % CHART_PALETTE.length],
                }}
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                {item.label}
              </p>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatMoney(item.amount)}
                </p>
                <p className="text-xs text-gray-400">{item.share}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

/** Chiqimning oydan oyga o'zgarishi — oylik va boshqa xarajat ustma-ust. */
export const ExpenseTrendChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    salaryNum: Number(row.salary),
    otherNum: Number(row.other),
  }));

  return (
    <ChartCard
      title="Oylik dinamika"
      hint="Har oy qancha pul chiqqan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={series.length === 0}
      emptyText="Bu davrda chiqim bo'lmagan"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

          <Bar
            dataKey="salaryNum"
            name="Oylik"
            stackId="expense"
            fill={SOURCE_COLORS.salary}
            maxBarSize={38}
          />
          <Bar
            dataKey="otherNum"
            name="Xarajat"
            stackId="expense"
            fill={SOURCE_COLORS.other}
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/** Xarajat kategoriyalari (oylik bu yerga kirmaydi). */
export const ExpenseCategoryChart = ({ data, isLoading, isError }) => {
  const items = (data?.byCategory ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
  }));

  return (
    <ChartCard
      title="Kategoriya bo'yicha"
      hint="Oylikdan tashqari xarajatlar"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu davrda xarajat bo'lmagan"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={items.slice(0, 8)}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" {...AXIS} tickFormatter={compactMoney} />
          <YAxis
            type="category"
            dataKey="categoryName"
            width={110}
            {...AXIS}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />

          <Bar dataKey="amountNum" name="Xarajat" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {items.slice(0, 8).map((item, index) => (
              <Cell
                key={item.categoryName}
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/** Oxirgi xarajatlar ro'yxati. */
export const RecentExpenseList = ({ data, isLoading, isError }) => {
  const items = data?.recent ?? [];

  return (
    <ChartCard
      title="Oxirgi xarajatlar"
      hint="Eng yangi 10 ta yozuv"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu davrda xarajat bo'lmagan"
      height="auto"
    >
      <div className="space-y-1">
        {items.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {expense.categoryName}
                {expense.payee ? ` · ${expense.payee}` : ""}
              </p>
              <p className="text-xs text-gray-400">
                {formatDateUz(expense.occurredAt)}
                {expense.accountName ? ` · ${expense.accountName}` : ""}
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-red-600">
              −{formatMoney(expense.amount)}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};
