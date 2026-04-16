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

function buildParams(dateParams) {
  if (!dateParams) return {};
  if (dateParams.startDate || dateParams.endDate) {
    const p = {};
    if (dateParams.startDate) p.startDate = dateParams.startDate;
    if (dateParams.endDate) p.endDate = dateParams.endDate;
    return p;
  }
  if (dateParams.period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(dateParams.period));
    return { startDate: startDate.toISOString().split("T")[0] };
  }
  return {};
}

const LeadStatusDistribution = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const queryKey = JSON.stringify(params);

  const { data } = useQuery({
    queryKey: ["leads", "overview", queryKey],
    queryFn: () => leadsAPI.getOverview(params).then((res) => res.data.data),
  });

  const byStatus = data?.byStatus || {};

  const chartData = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: leadStatusLabels[status] || status,
      value: count,
      fill: leadStatusChartColors[status] || "#9ca3af",
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="Status bo'yicha taqsimot" className="space-y-2">
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
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
                    `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                    "",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status table */}
          <div className="space-y-1">
            {chartData
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="size-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="flex-1 text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                  <span className="text-gray-400 w-10 text-right">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default LeadStatusDistribution;
