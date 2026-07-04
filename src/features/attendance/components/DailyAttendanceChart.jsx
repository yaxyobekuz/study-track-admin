// Recharts
import {
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Data
import { getPercentHex } from "../data/attendanceReports.data";

// Grafik tooltipи: kun + foiz + statuslar kesimi
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

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
 * Oy ichida kun bo'yicha davomat foizi grafigi.
 * Har bir ustun rangi kun sifatiga qarab (yashil/sariq/qizil).
 * @param {Array} byDay - [{ date, day, percent, present, late, absent, excused, total }]
 */
const DailyAttendanceChart = ({ byDay = [] }) => {
  if (!byDay.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Bu oy uchun ma&apos;lumot topilmadi
      </p>
    );
  }

  return (
    <div className="h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis
            dy={6}
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F3F4F6" }} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={22}>
            {byDay.map((d) => (
              <Cell key={d.date} fill={getPercentHex(d.percent)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyAttendanceChart;
