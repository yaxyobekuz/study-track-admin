// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";

// Data
import { AXIS, COLORS, GRADE_COLORS, formatByUnit } from "../data/academicDashboard.data";

/**
 * Diagramma tultipi — moliya dashboardidagi `MoneyTooltip` ning akademik
 * juftligi. ⚠️ Alohida, chunki u yerda qiymat pul, bu yerda esa baho yoki
 * foiz: bitta tultip ikkalasini ham to'g'ri formatlay olmasdi.
 */
const AcademicTooltip = ({ active, payload, label, unit = "grade" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-900">{label}</p>

      <ul className="mt-1 space-y-0.5">
        {payload.map((row) => (
          <li key={row.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="text-gray-500">{row.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-gray-900">
              {formatByUnit(row.value, unit)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * BAHOLAR TAHLILI — fanlar bo'yicha o'rtacha baho.
 *
 * ⚠️ IKKI USTUN: joriy oy va o'tgan oy. Bittasi bilan "matematika 4.45"
 * degan raqam yaxshimi-yomonmi, aytib bo'lmaydi — javob faqat o'tgan oy
 * yonida turganda ko'rinadi.
 *
 * ⚠️ O'Q 0 DAN EMAS, ROSA SHKALADAN (1..5) boshlanadi: 4.45 va 4.05
 * orasidagi farq 0 dan boshlangan o'qda ko'zga umuman tashlanmasdi.
 */
export const SubjectChart = ({ data, isLoading, isError, className }) => {
  const rows = (data?.subjects ?? []).map((row) => ({
    ...row,
    current: row.average == null ? null : Number(row.average),
    previous: row.previousAverage == null ? null : Number(row.previousAverage),
  }));

  return (
    <DashboardCard
      title="Baholar tahlili (fanlar bo'yicha o'rtacha baho)"
      hint={
        data
          ? `${data.monthLabel} · ochiq ustun — ${data.compareMonthLabel}`
          : "Fanlar kesimida o'rtacha baho"
      }
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      height={300}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            {...AXIS}
            interval={0}
            tick={{ ...AXIS.tick, fontSize: 10 }}
            tickMargin={6}
          />
          <YAxis {...AXIS} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} width={28} />
          <Tooltip content={<AcademicTooltip unit="grade" />} cursor={{ fill: "#f9fafb" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

          <Bar
            dataKey="previous"
            name="O'tgan oy"
            fill={COLORS.previous}
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="current"
            name="O'rtacha baho"
            fill={COLORS.grade}
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

/**
 * DAVOMAT DINAMIKASI — 12 oylik chiziq.
 *
 * ⚠️ O'q 0 dan emas, 50% dan boshlanadi: davomat amalda 85–100% oralig'ida
 * yuradi va 0 dan boshlangan o'qda butun yil tekis chiziq bo'lib qolardi.
 * Chegara pastga tushib ketsa (masalan 40%), `domain` uni ham ko'rsatadi.
 */
export const AttendanceTrendChart = ({ data, isLoading, isError, className }) => {
  const rows = (data?.attendanceTrend ?? []).filter((row) => row.total > 0);
  const lowest = rows.reduce((min, row) => Math.min(min, row.rate ?? 100), 100);
  const floor = Math.max(0, Math.min(50, Math.floor((lowest - 5) / 10) * 10));

  return (
    <DashboardCard
      title="Davomat dinamikasi"
      hint={`Oxirgi ${data?.attendanceTrend?.length ?? 12} oy · keldi va kechikdi`}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Davomat belgilanmagan"
      height={300}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} interval="preserveStartEnd" />
          <YAxis
            {...AXIS}
            domain={[floor, 100]}
            tickFormatter={(value) => `${value}%`}
            width={40}
          />
          <Tooltip content={<AcademicTooltip unit="percent" />} />

          <Line
            type="monotone"
            dataKey="rate"
            name="Davomat"
            stroke={COLORS.attendance}
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

/**
 * BAHOLAR TAQSIMOTI — halqa diagramma va yonida ro'yxat.
 *
 * Ro'yxat MAJBURIY qism, bezak emas: halqaning o'zi "qaysi bo'lak nechchi
 * foiz" ni aytadi, lekin "nechta baho" ni aytmaydi — ikkalasi ham kerak.
 *
 * Markazda JAMI turadi: bo'laklar yig'indisini ko'z bilan qo'shib
 * chiqishga majbur qilmaslik uchun.
 */
export const DistributionCard = ({ data, isLoading, isError, className }) => {
  const rows = (data?.distribution ?? []).filter((row) => row.count > 0);
  const total = rows.reduce((acc, row) => acc + row.count, 0);

  return (
    <DashboardCard
      title="Baholar taqsimoti"
      hint={data ? `${data.monthLabel} · jami ${total} ta baho` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda baho qo'yilmagan"
      className={className}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative h-44 w-full shrink-0 lg:h-48 lg:w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="count"
                nameKey="label"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={1.5}
                stroke="none"
              >
                {rows.map((row) => (
                  <Cell key={row.grade} fill={GRADE_COLORS[row.grade] ?? "#a3a3a3"} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs font-semibold text-gray-900">
                        {payload[0].payload.grade} ({payload[0].payload.label})
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {payload[0].payload.count} ta · {payload[0].payload.share}%
                      </p>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Halqa markazi — SVG ichida emas, ustiga qo'yilgan matn */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Jami
            </p>
            <p className="text-lg font-bold text-gray-900">{formatByUnit(total, "count")}</p>
            <p className="text-[10px] text-gray-400">baho</p>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1.5">
          {rows.map((row) => (
            <li key={row.grade} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: GRADE_COLORS[row.grade] ?? "#a3a3a3" }}
              />
              <span className="truncate text-gray-600">
                {row.grade} ({row.label})
              </span>
              <span className="ml-auto shrink-0 font-semibold text-gray-900">{row.share}%</span>
              <span className="w-14 shrink-0 text-right tabular-nums text-gray-500">
                {row.count} ta
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
};
