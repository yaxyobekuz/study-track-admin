// React
import { useState } from "react";

// Recharts
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import { groupByOptions } from "@/features/leads/data/leads.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import SelectField from "@/shared/components/ui/select/SelectField";

function buildParams(dateParams, groupBy) {
  const p = { groupBy };
  if (!dateParams) return p;
  if (dateParams.startDate || dateParams.endDate) {
    if (dateParams.startDate) p.startDate = dateParams.startDate;
    if (dateParams.endDate) p.endDate = dateParams.endDate;
  } else if (dateParams.period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(dateParams.period));
    p.days = dateParams.period;
  }
  return p;
}

function formatTick(val, groupBy) {
  if (!val) return "";
  if (groupBy === "month") {
    // val = "2025-03"
    const [y, m] = val.split("-");
    const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  }
  if (groupBy === "week") {
    // val = "2025-W12" — just show as is
    return val.replace("-W", " H");
  }
  // day — format as date
  try {
    return formatDateUZ(val, { hideYear: true });
  } catch {
    return val;
  }
}

const LeadTrendChart = ({ dateParams, expanded = false }) => {
  const [groupBy, setGroupBy] = useState("");
  const [chartType, setChartType] = useState("area");

  const params = buildParams(dateParams, groupBy || undefined);
  const queryKey = JSON.stringify(params);

  const { data: result } = useQuery({
    queryKey: ["leads", "trends", queryKey],
    queryFn: () => leadsAPI.getTrends(params).then((res) => res.data.data),
  });

  const chartData = result?.trends || [];
  const resolvedGroupBy = result?.groupBy || groupBy || "day";

  const tickInterval = Math.max(Math.floor(chartData.length / 8) - 1, 0);

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: -20, bottom: 40 },
  };

  const xAxis = (
    <XAxis
      dy={10}
      dataKey="date"
      axisLine={false}
      tickLine={false}
      tick={{ fontSize: 11, fill: "#9CA3AF" }}
      tickFormatter={(val) => formatTick(val, resolvedGroupBy)}
      interval={tickInterval}
    />
  );

  const yAxis = (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fontSize: 11, fill: "#9CA3AF" }}
    />
  );

  const grid = (
    <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
  );

  const tooltip = (
    <Tooltip
      labelFormatter={(val) => formatTick(val, resolvedGroupBy)}
      labelStyle={{ color: "#6B7280", fontSize: "13px", marginBottom: "2px" }}
      contentStyle={{
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
      }}
      formatter={(value, name) => {
        const labels = {
          total: "Jami",
          enrolled: "Ro'yxatdan o'tdi",
          lost: "Yo'qoldi / Rad",
          active: "Faol",
        };
        return [value, labels[name] || name];
      }}
    />
  );

  const legend = (
    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
  );

  return (
    <Card
      title="Lid trendlari"
      className="space-y-3"
    >
      {/* Controls */}
      {expanded && (
        <div className="flex gap-2 flex-wrap">
          <div className="w-32">
            <SelectField
              name="groupBy"
              value={groupBy || resolvedGroupBy}
              options={groupByOptions}
              onChange={setGroupBy}
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
            <button
              className={`px-3 py-1.5 ${chartType === "area" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setChartType("area")}
            >
              Area
            </button>
            <button
              className={`px-3 py-1.5 ${chartType === "bar" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
          </div>
        </div>
      )}

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <div className={expanded ? "h-96" : "h-64 sm:h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart {...commonProps}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                {grid}
                {xAxis}
                {yAxis}
                {tooltip}
                {legend}
                <Bar name="Jami" dataKey="total" fill="url(#gTotal)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Ro'yxatdan o'tdi" dataKey="enrolled" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Yo'qoldi / Rad" dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            ) : (
              <AreaChart {...commonProps}>
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
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {grid}
                {xAxis}
                {yAxis}
                {tooltip}
                {legend}
                <Area name="Jami" type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area name="Faol" type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                <Area name="Ro'yxatdan o'tdi" type="monotone" dataKey="enrolled" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrolled)" />
                <Area name="Yo'qoldi / Rad" type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLost)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary stats below chart */}
      {chartData.length > 0 && expanded && (
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-center">
          {[
            { label: "Jami", key: "total", color: "text-blue-600" },
            { label: "Faol", key: "active", color: "text-indigo-600" },
            { label: "Ro'yxatdan o'tdi", key: "enrolled", color: "text-green-600" },
            { label: "Yo'qoldi / Rad", key: "lost", color: "text-red-600" },
          ].map(({ label, key, color }) => (
            <div key={key}>
              <p className={`text-lg font-bold ${color}`}>
                {chartData.reduce((sum, d) => sum + (d[key] || 0), 0)}
              </p>
              <p className="text-[11px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LeadTrendChart;
