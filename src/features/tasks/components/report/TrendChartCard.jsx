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
import { cn } from "@/shared/utils/cn";
import { formatDateUz, formatMonthUz } from "@/shared/utils/date.utils";

// Data
import { AXIS_PROPS, CHART_COLORS } from "../../data/tasks.data";

const SERIES = [
  { key: "created", label: "Berildi", color: CHART_COLORS.created },
  { key: "completed", label: "Bajarildi", color: CHART_COLORS.completed },
];

const GRANULARITY_HINT = {
  day: "kunlar kesimida",
  week: "haftalar kesimida",
  month: "oylar kesimida",
};

const axisLabel = (key, granularity) =>
  granularity === "month" ? formatMonthUz(key) : formatDateUz(key, { hideYear: true });

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
      rows={SERIES.map((s) => ({ key: s.key, color: s.color, name: s.label, value: `${row[s.key]} ta` }))}
    />
  );
};

/**
 * Dinamika: har kuni (hafta/oy) nechta ish BERILDI va nechta BAJARILDI.
 * Ikki chiziq bitta o'qda — ikkalasi ham "dona", shuning uchun ikkinchi o'q
 * kerak emas. Yashil chiziq ko'kdan past yursa — ish to'planib boryapti.
 *
 * @param {{ report: object, className?: string }} props
 */
const TrendChartCard = ({ report, className = "" }) => {
  const { trend, period } = report;
  const hasData = trend.some((r) => r.created > 0 || r.completed > 0);
  const totals = SERIES.map((s) => ({ ...s, sum: trend.reduce((a, r) => a + r[s.key], 0) }));

  return (
    <ReportPanelCard
      title="Berilgan va bajarilgan ishlar"
      hint={`Davr ichida, ${GRANULARITY_HINT[period.granularity]}`}
      className={className}
      action={
        <div className="flex flex-wrap items-center gap-3">
          {totals.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <b className="text-gray-900">{s.sum}</b>
            </span>
          ))}
        </div>
      }
    >
      <div className="h-[240px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`taskTrend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="key"
                {...AXIS_PROPS}
                minTickGap={16}
                tickFormatter={(k) => axisLabel(k, period.granularity)}
              />
              <YAxis {...AXIS_PROPS} allowDecimals={false} width={36} />
              <Tooltip
                content={<TrendTooltip granularity={period.granularity} />}
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
                  fill={`url(#taskTrend-${s.key})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={cn("flex h-full items-center justify-center text-sm text-gray-400")}>
            Bu davr uchun ma&apos;lumot yo&apos;q
          </div>
        )}
      </div>
    </ReportPanelCard>
  );
};

export default TrendChartCard;
