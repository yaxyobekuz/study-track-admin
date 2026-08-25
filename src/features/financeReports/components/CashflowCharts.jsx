// Recharts
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
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
import { CHART_COLORS, CHART_PALETTE, compactMoney } from "../data/financeReports.data";

const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
};

/**
 * Kassaga tushgan haqiqiy pul.
 *
 * ⚠️ Bu hisob-fakturadan EMAS, to'lov cheklaridan quriladi. Farqi muhim:
 * hisob-faktura "qancha to'lashi kerak", bu esa "qancha pul kirdi".
 * Depozitga tushgan ortiqcha pul ham shu yerda ko'rinadi.
 */
export const CashflowChart = ({ data, isLoading, isError, action }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
    // O'q yorlig'i ham yagona sana formatidan o'tadi
    label: formatDateUz(row.date),
  }));

  return (
    <ChartCard
      title="Kassaga tushgan pul"
      hint="To'lov cheklari bo'yicha — hisob-fakturadan emas"
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={series.length === 0}
      emptyText="Bu davrda to'lov qabul qilinmagan"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.collected} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_COLORS.collected} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="label" {...AXIS} minTickGap={24} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} />

          <Area
            type="monotone"
            dataKey="amountNum"
            name="Tushum"
            stroke={CHART_COLORS.collected}
            strokeWidth={2}
            fill="url(#cashFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/**
 * Pul qaysi to'lov turi orqali kelgani. Donut + yon ro'yxat: doiraning
 * o'zi nisbatni, ro'yxat esa aniq summani beradi.
 */
export const AccountShareChart = ({ data, isLoading, isError }) => {
  const items = (data?.byAccount ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
  }));

  return (
    <ChartCard
      title="To'lov turlari kesimi"
      hint="Pul qayerga tushgan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      height={300}
    >
      <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
        <div className="h-full w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="amountNum"
                nameKey="name"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {items.map((item, index) => (
                  <Cell
                    key={item.accountId}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-2 sm:w-1/2">
          {items.map((item, index) => (
            <div key={item.accountId} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">{item.count} ta chek</p>
              </div>
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
