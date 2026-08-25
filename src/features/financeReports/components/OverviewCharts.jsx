// Recharts
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components
import ChartCard from "./ChartCard";
import MoneyTooltip from "./MoneyTooltip";

// Data
import {
  CHART_COLORS,
  compactMoney,
} from "../data/financeReports.data";

const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
};

/**
 * Sahifaning bosh diagrammasi: har oy qancha hisoblangan va qanchasi
 * yig'ilgan. Ustun — majburiyat, chiziq — undirish foizi.
 *
 * Ikkalasi BITTA diagrammada, chunki savol ham bitta: "shu oyni yopdikmi?".
 * Alohida ikki grafik bo'lsa, ko'z ular orasida yurishga majbur bo'lardi.
 */
export const InvoicedVsCollectedChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    invoicedNum: Number(row.invoiced),
    collectedNum: Number(row.collected),
  }));

  const hasData = series.some((row) => row.invoicedNum > 0);

  return (
    <ChartCard
      title="Hisoblangan va yig'ilgan"
      hint="Ustun — oylik majburiyat, chiziq — o'sha oyning undirish foizi"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <YAxis
            yAxisId="rate"
            orientation="right"
            domain={[0, 100]}
            unit="%"
            {...AXIS}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />

          <Bar
            dataKey="invoicedNum"
            name="Hisoblangan"
            fill={CHART_COLORS.invoiced}
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
          <Bar
            dataKey="collectedNum"
            name="Yig'ilgan"
            fill={CHART_COLORS.collected}
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="collectionRate"
            name="Undirish %"
            stroke={CHART_COLORS.rate}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

/**
 * Qarzning oydan oyga to'planishi. Maydon diagrammasi ataylab: qarz
 * "to'planadigan" narsa, ustunlar esa uni alohida hodisalardek ko'rsatardi.
 */
export const DebtBuildupChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    debtNum: Number(row.debt),
  }));

  const hasData = series.some((row) => row.debtNum > 0);

  return (
    <ChartCard
      title="Qarzning to'planishi"
      hint="Har oy yopilmay qolgan qoldiq"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="debtFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.debt} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_COLORS.debt} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} />

          <Area
            type="monotone"
            dataKey="debtNum"
            name="Qarz"
            stroke={CHART_COLORS.debt}
            strokeWidth={2}
            fill="url(#debtFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
