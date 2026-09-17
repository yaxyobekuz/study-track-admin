// Recharts
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Components
import ChartTooltip from "@/features/users/components/reports/ChartTooltip";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Data
import { BREAKDOWN_META, percentText } from "../../data/tasks.data";

const SliceTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <ChartTooltip
      rows={[{ key: s.key, color: s.color, name: s.label, value: `${s.value} ta · ${percentText(s.percent)}` }]}
    />
  );
};

/**
 * Topshiriqlar taqdiri — beshta bo'lak, yig'indisi DOIM jami (server
 * `breakdown` ni aynan bo'linish qilib beradi). Markazda jami, afsonada
 * har bo'lakning soni, foizi va bir so'zli izohi.
 *
 * @param {{ report: object }} props
 */
const StatusDonutCard = ({ report }) => {
  const total = report.kpis.total;
  const slices = report.breakdown.map((b) => ({
    ...b,
    ...BREAKDOWN_META[b.key],
    percent: total ? Math.round((b.value / total) * 1000) / 10 : null,
  }));
  const visible = slices.filter((s) => s.value > 0);

  return (
    <ReportPanelCard
      title="Topshiriqlar qayerda?"
      hint="Berilgan har bir topshiriq hozir qaysi holatda"
      isEmpty={total === 0}
      emptyText="Bu davrda topshiriq berilmagan"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
        <div className="relative size-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visible}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={84}
                paddingAngle={visible.length > 1 ? 2 : 0}
                stroke="#fff"
                strokeWidth={2}
              >
                {visible.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<SliceTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">topshiriq</p>
          </div>
        </div>

        <div className="w-full space-y-2">
          {slices.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight text-gray-700">{s.label}</p>
                <p className="text-[11px] leading-tight text-gray-400">{s.hint}</p>
              </div>
              <span className="font-semibold tabular-nums text-gray-900">{s.value}</span>
              <span className="w-11 text-right text-xs tabular-nums text-gray-400">
                {percentText(s.percent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ReportPanelCard>
  );
};

export default StatusDonutCard;
