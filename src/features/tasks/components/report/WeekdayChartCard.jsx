// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components
import ChartTooltip from "@/features/users/components/reports/ChartTooltip";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Data
import {
  AXIS_PROPS,
  CHART_COLORS,
  WEEKDAY_FULL,
  WEEKDAY_SHORT,
} from "../../data/tasks.data";

const DayTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <ChartTooltip
      title={WEEKDAY_FULL[row.index]}
      rows={[
        { key: "completed", color: CHART_COLORS.completed, name: "Bajarildi", value: `${row.completed} ta` },
        { key: "created", name: "Berildi", value: `${row.created} ta` },
      ]}
    />
  );
};

/**
 * Hafta kunlari bo'yicha bajarilgan ishlar — "qaysi kuni eng faol".
 * Eng baland ustun to'q yashil, qolganlari ochroq: ko'z darhol eng yaxshi
 * kunni topadi, rang ma'nosi esa o'zgarmaydi (yashil = bajarildi).
 *
 * @param {{ report: object }} props
 */
const WeekdayChartCard = ({ report }) => {
  const data = report.weekday.map((d) => ({ ...d, label: WEEKDAY_SHORT[d.index] }));
  const max = Math.max(...data.map((d) => d.completed));

  return (
    <ReportPanelCard
      title="Eng faol kunlar"
      hint="Hafta kunlari bo'yicha bajarilgan ishlar"
      isEmpty={max === 0}
      emptyText="Bu davrda ish yakunlanmagan"
      bodyHeight={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="label" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} allowDecimals={false} width={36} />
          <Tooltip content={<DayTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="completed" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((d) => (
              <Cell
                key={d.index}
                fill={CHART_COLORS.completed}
                fillOpacity={d.completed === max ? 1 : 0.45}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ReportPanelCard>
  );
};

export default WeekdayChartCard;
