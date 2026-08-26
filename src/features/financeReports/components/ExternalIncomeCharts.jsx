// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

/**
 * Pul qayerdan keldi: o'quvchi to'lovi yoki tashqi kirim.
 *
 * ⚠️ Ikkalasining yig'indisi kassa qoldig'i o'sishiga TENG bo'lishi shart —
 * aks holda "Jami tushum" bilan "To'lov turlari" ekrani ikki xil haqiqat
 * ko'rsatardi.
 */
export const IncomeSourceChart = ({ data, isLoading, isError }) => {
  const items = (data?.bySource ?? [])
    .map((row) => ({ ...row, amountNum: Number(row.amount) }))
    .filter((row) => row.amountNum > 0);

  const COLORS = {
    student: CHART_COLORS.collected,
    external: CHART_COLORS.discount,
  };

  return (
    <ChartCard
      title="Pul qayerdan keldi"
      hint="O'quvchi to'lovi va tashqi kirim (ijara, sotuv, homiylik)"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
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
                    fill={COLORS[item.key] ?? CHART_PALETTE[index % CHART_PALETTE.length]}
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
                    COLORS[item.key] ?? CHART_PALETTE[index % CHART_PALETTE.length],
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.count} ta</p>
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

/** Tashqi kirim kategoriyalari — qaysi manba qancha beryapti. */
export const IncomeCategoryChart = ({ data, isLoading, isError }) => {
  const items = (data?.byCategory ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
  }));

  return (
    <ChartCard
      title="Kategoriya bo'yicha"
      hint="Tashqi kirimning manbalari"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu davrda tashqi kirim bo'lmagan"
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

          <Bar dataKey="amountNum" name="Kirim" radius={[0, 6, 6, 0]} maxBarSize={22}>
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

/** Tashqi kirimning oydan oyga o'zgarishi. */
export const IncomeTrendChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
  }));

  return (
    <ChartCard
      title="Oylik dinamika"
      hint="Tashqi kirim qaysi oyda qancha bo'lgan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={series.length === 0}
      emptyText="Bu davrda tashqi kirim bo'lmagan"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />

          <Bar
            dataKey="amountNum"
            name="Tashqi kirim"
            fill={CHART_COLORS.discount}
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/** Oxirgi yozuvlar — diagramma emas, ro'yxat: "kim, qachon, qancha". */
export const RecentIncomeList = ({ data, isLoading, isError }) => {
  const items = data?.recent ?? [];

  return (
    <ChartCard
      title="Oxirgi kirimlar"
      hint="Eng yangi 10 ta yozuv"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu davrda tashqi kirim bo'lmagan"
      height="auto"
    >
      <div className="space-y-1">
        {items.map((income) => (
          <div
            key={income.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {income.categoryName}
                {income.payer ? ` · ${income.payer}` : ""}
              </p>
              <p className="text-xs text-gray-400">
                {formatDateUz(income.occurredAt)}
                {income.accountName ? ` · ${income.accountName}` : ""}
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-green-700">
              {formatMoney(income.amount)}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};
