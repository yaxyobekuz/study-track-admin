// Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import {
  leadStatusLabels,
  leadStatusChartColors,
} from "@/features/leads/data/leads.data";

// Components
import Card from "@/shared/components/ui/Card";

const LeadStatusDistribution = ({ period }) => {
  const { data } = useQuery({
    queryKey: ["leads", "overview", period],
    queryFn: () =>
      leadsAPI.getOverview({ period }).then((res) => res.data.data),
  });

  const chartData = data
    ? Object.entries(data.byStatus || {})
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: leadStatusLabels[status] || status,
          value: count,
          fill: leadStatusChartColors[status] || "#9ca3af",
        }))
    : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="Status bo'yicha taqsimot" className="space-y-4">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  "",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default LeadStatusDistribution;
