// Router
import { Link } from "react-router-dom";

// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import ChartCard from "./ChartCard";
import MoneyTooltip from "./MoneyTooltip";

// Data
import {
  AGING_COLORS,
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
 * Qarz yoshi — undiruv ishining eng muhim ko'rsatkichi.
 *
 * ⚠️ Bir o'quvchi bir necha guruhda ko'rinishi MUMKIN va bu to'g'ri: uning
 * yanvardagi qarzi "6 oydan ortiq", avgustdagi qarzi esa "joriy oy"
 * guruhiga tushadi. Summa va o'quvchi soni bir xil narsani o'lchaydi.
 */
export const DebtAgingChart = ({ data, isLoading, isError }) => {
  const items = (data?.aging ?? []).map((row) => ({
    ...row,
    amountNum: Number(row.amount),
  }));

  const hasData = items.some((row) => row.amountNum > 0);

  return (
    <ChartCard
      title="Qarz yoshi"
      hint="Qarz qancha vaqtdan beri turibdi — eskirgani qanchalik qizil"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />

          <Bar dataKey="amountNum" name="Qarz" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {items.map((item) => (
              <Cell key={item.key} fill={AGING_COLORS[item.key] ?? CHART_COLORS.debt} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/** Qarz qaysi oylarda to'plangani. */
export const DebtByMonthChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    debtNum: Number(row.debt),
  }));

  return (
    <ChartCard
      title="Qarz dinamikasi"
      hint="Qaysi oyning majburiyati yopilmay qolgan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={series.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} />

          <Line
            type="monotone"
            dataKey="debtNum"
            name="Qarz"
            stroke={CHART_COLORS.debt}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/** Sinf kesimi — qarz qayerda to'plangani. */
export const DebtByClassChart = ({ data, isLoading, isError }) => {
  // Uzun ro'yxatda faqat eng kattalari ko'rsatiladi — qolgani "boshqalar"
  const all = data?.byClass ?? [];
  const top = all.slice(0, 8).map((row) => ({ ...row, debtNum: Number(row.debt) }));

  return (
    <ChartCard
      title="Sinf kesimida qarz"
      hint={
        all.length > top.length
          ? `Eng katta ${top.length} ta sinf (jami ${all.length} ta)`
          : "Sinf bo'yicha taqsimot"
      }
      isLoading={isLoading}
      isError={isError}
      isEmpty={top.length === 0}
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={top}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" {...AXIS} tickFormatter={compactMoney} />
          <YAxis
            type="category"
            dataKey="className"
            width={110}
            {...AXIS}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />

          <Bar dataKey="debtNum" name="Qarz" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {top.map((item, index) => (
              <Cell key={item.className} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/**
 * Eng katta qarzdorlar. Diagramma emas, ro'yxat: bu yerda taqqoslash emas,
 * "kim bilan gaplashish kerak" degan savol muhim — shuning uchun har bir
 * qator o'quvchi kartasiga havola.
 */
export const TopDebtorsList = ({ data, isLoading, isError }) => {
  const items = data?.topDebtors ?? [];

  return (
    <ChartCard
      title="Eng katta qarzdorlar"
      hint="Kim bilan birinchi gaplashish kerak"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      height="auto"
    >
      <div className="space-y-1">
        {items.map((debtor, index) => (
          <Link
            key={debtor.id}
            to={`/users/${debtor.id}?tab=finance`}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50"
          >
            <span className="w-5 shrink-0 text-center text-xs font-semibold text-gray-400">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {debtor.fullName}
              </p>
              <p className="text-xs text-gray-400">
                {debtor.unpaidCount} oy · {debtor.oldestMonthLabel} dan
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-red-600">
              {formatMoney(debtor.debt)}
            </span>
          </Link>
        ))}
      </div>
    </ChartCard>
  );
};
