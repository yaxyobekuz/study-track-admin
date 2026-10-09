// Recharts
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components
import ChartTooltip from "@/features/users/components/reports/ChartTooltip";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Utils
import { formatDateUz, formatMonthUz } from "@/shared/utils/date.utils";

// Data
import { AXIS_PROPS, ISSUE_CHART_COLORS } from "../../data/issues.data";

const SERIES = [
  { key: "total", label: "Keldi", color: ISSUE_CHART_COLORS.total },
  { key: "closed", label: "Yopildi", color: ISSUE_CHART_COLORS.closed },
];

const GRANULARITY_HINT = {
  day: "kunlar kesimida",
  week: "haftalar kesimida",
  month: "oylar kesimida",
};

const axisLabel = (key, granularity) =>
  granularity === "month"
    ? formatMonthUz(key)
    : formatDateUz(key, { hideYear: true });

const tooltipTitle = (key, granularity) =>
  granularity === "month"
    ? formatMonthUz(key)
    : granularity === "week"
      ? `${formatDateUz(key)} dan boshlangan hafta`
      : formatDateUz(key);

const TrendTooltip = ({ active, payload, granularity }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <ChartTooltip
      title={tooltipTitle(row.key, granularity)}
      rows={SERIES.map((s) => ({
        key: s.key,
        color: s.color,
        name: s.label,
        value: `${row[s.key]} ta`,
      }))}
    />
  );
};

/**
 * Dinamika: har kuni (hafta/oy) nechta murojaat KELDI va nechtasi YOPILDI.
 *
 * ⚠️ IKKI CHIZIQ BITTA O'QDA — ikkalasi ham "dona", shuning uchun ikkinchi
 * o'q kerak emas. Yashil chiziq ko'kdan past yursa — murojaatlar
 * to'planib boryapti.
 *
 * ⚠️ "Yopildi" — SHU DAVRDA KELGANLARNING yopilgani (server kesimi muammo
 * KELGAN sana bo'yicha): "bu hafta nechta murojaat yopildi" degan boshqa
 * savol va uni shu diagrammaga qo'shish ikki xil maxrajni aralashtirardi.
 *
 * @param {{ report: object, className?: string }} props
 */
const IssueTrendCard = ({ report, className = "" }) => {
  const { trend = [], period } = report || {};
  const hasData = trend.some((r) => r.total > 0);
  const totals = SERIES.map((s) => ({
    ...s,
    sum: trend.reduce((a, r) => a + (r[s.key] || 0), 0),
  }));

  return (
    <ReportPanelCard
      title="Kelgan va yopilgan murojaatlar"
      hint={`Davr ichida, ${GRANULARITY_HINT[period?.granularity] || ""}`}
      className={className}
      action={
        <div className="flex flex-wrap items-center gap-3">
          {totals.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600"
            >
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}: <b className="text-gray-900">{s.sum}</b>
            </span>
          ))}
        </div>
      }
      bodyHeight={240}
      isEmpty={!hasData}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient
                key={s.key}
                id={`issueTrend-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid vertical={false} stroke={ISSUE_CHART_COLORS.grid} />

          <XAxis
            dataKey="key"
            {...AXIS_PROPS}
            minTickGap={16}
            tickFormatter={(k) => axisLabel(k, period?.granularity)}
          />

          <YAxis {...AXIS_PROPS} allowDecimals={false} width={36} />

          <Tooltip
            content={<TrendTooltip granularity={period?.granularity} />}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          />

          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#issueTrend-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ReportPanelCard>
  );
};

export default IssueTrendCard;
