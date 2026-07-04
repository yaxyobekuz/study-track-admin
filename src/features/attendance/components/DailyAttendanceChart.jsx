// Recharts
import {
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Data
import { DAILY_CHART_SERIES } from "../data/attendanceReports.data";

// Grafik tooltipи: kun + foiz + statuslar kesimi
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  if (!d.total) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-semibold text-gray-800">{d.day}-kun</p>
        <p className="text-gray-400">Ma&apos;lumot yo&apos;q</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-md space-y-0.5">
      <p className="font-semibold text-gray-800">{d.day}-kun</p>
      <p className="text-gray-600">
        Davomat: <b>{d.percent == null ? "-" : `${d.percent}%`}</b>
      </p>
      <p className="text-green-600">Keldi: {d.present}</p>
      <p className="text-yellow-600">Kech keldi: {d.late}</p>
      <p className="text-red-600">Kelmadi: {d.absent}</p>
      <p className="text-blue-600">Sababli: {d.excused}</p>
    </div>
  );
};

/**
 * Oy ichida kun bo'yicha davomat grafigi (chiziqli).
 * Har bir status (Keldi / Kech keldi / Kelmadi / Sababli) alohida chiziq.
 * Ma'lumoti yo'q kunlarda chiziq uziladi (bo'sh joy).
 * @param {Array} byDay - [{ date, day, percent, present, late, absent, excused, total }]
 */
const DailyAttendanceChart = ({ byDay = [] }) => {
  const hasData = byDay.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Bu oy uchun ma&apos;lumot topilmadi
      </p>
    );
  }

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis
            dy={6}
            dataKey="day"
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

          {/* Har bir status - alohida chiziq (ma'lumotsiz kunlar 0 da) */}
          {DAILY_CHART_SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stroke={series.color}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: series.color }}
              activeDot={{ r: 4.5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyAttendanceChart;
