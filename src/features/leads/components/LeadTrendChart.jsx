// Recharts
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";

const LeadTrendChart = ({ period }) => {
  const days = period || "30";

  const { data } = useQuery({
    queryKey: ["leads", "trends", days],
    queryFn: () =>
      leadsAPI.getTrends({ days }).then((res) => res.data.data),
  });

  const chartData = data || [];

  return (
    <Card title="Lid trendlari" className="space-y-4">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />
              <XAxis
                dy={10}
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(val) => formatDateUZ(val, { hideYear: true })}
                interval={Math.max(Math.floor(chartData.length / 8) - 1, 0)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
              />
              <Tooltip
                labelStyle={{
                  color: "#6B7280",
                  fontSize: "13px",
                  marginBottom: "2px",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={formatDateUZ}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <Area
                name="Yangi lidlar"
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                name="Ro'yxatdan o'tgan"
                type="monotone"
                dataKey="enrolled"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEnrolled)"
              />
              <Area
                name="Yo'qolgan"
                type="monotone"
                dataKey="lost"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default LeadTrendChart;
