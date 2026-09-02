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
import ChartTooltip from "./ChartTooltip";
import ReportPanelCard from "./ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  AXIS_PROPS,
  CHART_COLORS,
  FLOW_CHIPS,
  PILL,
} from "../../data/staffReport.data";

/**
 * Diagramma tooltip'i — o'q ostidagi qisqartma ("Iyn 26") o'rniga oyning
 * to'liq nomini beradi va shtat soni bilan birga o'sha oydagi qabul/arxivni
 * ko'rsatadi: "nega chiziq ko'tarildi?" degan savolga javob shu ikki raqamda.
 */
const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <ChartTooltip
      title={row.label}
      rows={[
        { key: "headcount", name: "Xodimlar soni", value: `${row.headcount}` },
        { key: "joined", name: "Qabul qilindi", value: `+${row.joined}` },
        { key: "left", name: "Arxivlandi", value: `−${row.left}` },
      ]}
    />
  );
};

/**
 * Shtat dinamikasi — oxirgi 6 oy oxiridagi xodimlar soni.
 *
 * Maydon diagrammasi ataylab: shtat "to'planadigan" kattalik, ustunlar esa
 * har oyni alohida hodisadek ko'rsatib, o'sish yo'nalishini yashirardi.
 * Chiziq ostidagi ikki chip esa TANLANGAN oyning oqimini beradi — grafik
 * qayerga borayotganini, chiplar esa shu oyda nima bo'lganini aytadi.
 *
 * @param {object} props
 * @param {{joined: number, left: number, net: number, trend: Array}} props.flow
 */
const StaffTrendChart = ({ flow }) => {
  const { joined, left, net, trend = [] } = flow;

  // Hamma oyda shtat noldan iborat bo'lsa — chizadigan tendensiya yo'q.
  // Bo'sh holat FAQAT diagrammani almashtiradi: shtat har oy OXIRIDA
  // o'lchanadi, shuning uchun davr ichida kelib, o'sha davrda arxivlangan
  // xodimlar hamma `headcount` ni nol qilib qo'yishi mumkin — ammo
  // qabul/arxiv raqamlari o'sha payt ham mavjud va yashirilmasligi kerak.
  const hasData = trend.some((row) => row.headcount > 0);

  const netLabel = net > 0 ? `+${net}` : net < 0 ? `−${Math.abs(net)}` : "0";

  return (
    <ReportPanelCard
      title="Shtat dinamikasi"
      hint="Oxirgi 6 oy oxiridagi xodimlar soni"
    >
      <div className="h-[200px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="staffHeadcountFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.headcount}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.headcount}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="short" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} allowDecimals={false} width={34} />
              <Tooltip content={<TrendTooltip />} />

              <Area
                type="monotone"
                dataKey="headcount"
                stroke={CHART_COLORS.headcount}
                strokeWidth={2}
                fill="url(#staffHeadcountFill)"
                dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Bu davr uchun ma&apos;lumot yo&apos;q
          </div>
        )}
      </div>

      {/* Tanlangan oyning oqimi */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn(PILL, FLOW_CHIPS.joined)}>+{joined} qabul</span>
        <span className={cn(PILL, FLOW_CHIPS.left)}>−{left} arxiv</span>
        <span
          className={cn(
            PILL,
            net > 0 && "bg-emerald-50 text-emerald-600",
            net < 0 && "bg-rose-50 text-rose-600",
            net === 0 && "bg-gray-100 text-gray-500",
          )}
        >
          Sof o&apos;zgarish: {netLabel}
        </span>
      </div>
    </ReportPanelCard>
  );
};

export default StaffTrendChart;
