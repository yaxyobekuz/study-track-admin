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

// Data
import { chartBarColors } from "@/features/leads/data/leads.data";

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

const LeadSourceChart = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const queryKey = JSON.stringify(params);

  const { data } = useQuery({
    queryKey: ["leads", "sources-analytics", queryKey],
    queryFn: () => leadsAPI.getSourceAnalytics(params).then((res) => res.data.data),
  });

  const items = data || [];

  const chartData = items.map((item) => ({
    name: item.sourceName,
    total: item.total,
    enrolled: item.enrolled,
    conversionRate: item.conversionRate,
  }));

  return (
    <Card title="Manbalar bo'yicha lidlar" className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis
                  dy={10}
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
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
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={28}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartBarColors[index % chartBarColors.length]} />
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
                  <th className="text-center py-2 px-2">Yo'qoldi</th>
                  <th className="text-center py-2 px-2">Konversiya</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: chartBarColors[idx % chartBarColors.length] }}
                        />
                        <span className="font-medium text-gray-800">{item.sourceName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-gray-700">{item.total}</td>
                    <td className="py-2 px-2 text-center text-green-600 font-medium">{item.enrolled}</td>
                    <td className="py-2 px-2 text-center text-blue-600">{item.active}</td>
                    <td className="py-2 px-2 text-center text-red-500">{item.lost}</td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`font-semibold ${
                          item.conversionRate >= 20
                            ? "text-green-600"
                            : item.conversionRate >= 10
                              ? "text-yellow-600"
                              : "text-gray-500"
                        }`}
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
