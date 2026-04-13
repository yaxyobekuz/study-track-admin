// Recharts
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Components
import Card from "@/shared/components/ui/Card";

const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#f59e0b",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

const LeadSourceChart = ({ period }) => {
  const { data } = useQuery({
    queryKey: ["leads", "sources-analytics", period],
    queryFn: () => {
      const params = {};
      if (period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
        params.startDate = startDate.toISOString().split("T")[0];
      }
      return leadsAPI.getSourceAnalytics(params).then((res) => res.data.data);
    },
  });

  const chartData = (data || []).map((item) => ({
    name: item.sourceName,
    total: item.total,
    enrolled: item.enrolled,
    conversionRate: item.conversionRate,
  }));

  return (
    <Card title="Manbalar bo'yicha lidlar" className="space-y-4">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dy={10}
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value, name) => {
                    if (name === "total") return [value, "Jami lidlar"];
                    if (name === "enrolled") return [value, "Ro'yxatdan o'tgan"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={32}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Source table */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2">Manba</th>
                  <th className="text-center py-2 px-2">Jami</th>
                  <th className="text-center py-2 px-2">Ro'yxatdan o'tgan</th>
                  <th className="text-center py-2 px-2">Faol</th>
                  <th className="text-center py-2 px-2">Konversiya</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((item, idx) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-800">
                          {item.sourceName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-gray-600">
                      {item.total}
                    </td>
                    <td className="py-2 px-2 text-center text-green-600 font-medium">
                      {item.enrolled}
                    </td>
                    <td className="py-2 px-2 text-center text-blue-600">
                      {item.active}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`font-medium ${item.conversionRate >= 20 ? "text-green-600" : item.conversionRate >= 10 ? "text-yellow-600" : "text-gray-500"}`}
                      >
                        {item.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
};

export default LeadSourceChart;
