import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "@/shared/components/ui/Card";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { marketAPI } from "@/features/market/api/market.api";
import {
  marketOrderStatusLabels,
  marketStatStatusColors,
  marketStatPeriodOptions,
} from "@/features/market/data/market.data";

function formatTick(val, groupBy) {
  if (!val) return "";
  if (groupBy === "month") {
    const [y, m] = val.split("-");
    const months = [
      "Yan",
      "Fev",
      "Mar",
      "Apr",
      "May",
      "Iyn",
      "Iyl",
      "Avg",
      "Sen",
      "Okt",
      "Noy",
      "Dek",
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  }
  if (groupBy === "week") return val.replace("-W", " H");
  try {
    return formatDateUZ(val, { hideYear: true });
  } catch {
    return val;
  }
}

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
    {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
  </div>
);

const ProductStatsSection = ({ productId }) => {
  const [days, setDays] = useState("30");

  const { data, isLoading } = useQuery({
    queryKey: ["market", "admin", "product", productId, "stats", days],
    queryFn: () =>
      marketAPI
        .getProductStats(productId, { days })
        .then((res) => res.data.data),
  });

  const summary = data?.summary || {
    total: 0,
    totalCoins: 0,
    totalQuantity: 0,
  };
  const byStatus = data?.byStatus || [];
  const trends = data?.trends || [];
  const groupBy = data?.groupBy || "day";

  const tickInterval = Math.max(Math.floor(trends.length / 8) - 1, 0);

  const axisStyle = { fontSize: 11, fill: "#9CA3AF" };
  const gridEl = (
    <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
  );
  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
  };

  return (
    <Card className="space-y-5">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-800">
          Mahsulot statistikasi
        </h2>

        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          {marketStatPeriodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 transition-colors ${
                days === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-gray-400">Yuklanmoqda...</p>
      ) : summary.total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Bu davr uchun ma&apos;lumot mavjud emas
        </p>
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Jami buyurtmalar" value={summary.total} />
            <StatCard
              label="Jami coin"
              value={summary.totalCoins.toLocaleString()}
            />
            <StatCard
              label="Jami miqdor"
              value={summary.totalQuantity}
              sub="ta mahsulot"
            />
          </div>

          <div className="flex gap-4">
            {/* Status distribution bar chart */}
            <div className="flex-1">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Status bo&apos;yicha buyurtmalar
              </p>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byStatus}
                    margin={{ top: 4, right: 8, left: -28, bottom: 4 }}
                  >
                    {gridEl}
                    <XAxis
                      dataKey="status"
                      axisLine={false}
                      tickLine={false}
                      tick={axisStyle}
                      tickFormatter={(v) => marketOrderStatusLabels[v] || v}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={axisStyle}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, _name, props) => [
                        value,
                        marketOrderStatusLabels[props.payload.status] ||
                          props.payload.status,
                      ]}
                      labelFormatter={() => ""}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {byStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={
                            marketStatStatusColors[entry.status] || "#9ca3af"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend area chart */}
            {trends.length > 0 && (
              <div className="flex-1">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Vaqt bo&apos;yicha trend
                </p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends}
                      margin={{ top: 4, right: 8, left: -28, bottom: 40 }}
                    >
                      <defs>
                        <linearGradient
                          id="statsTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="statsApproved"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22c55e"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22c55e"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      {gridEl}
                      <XAxis
                        dy={10}
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={axisStyle}
                        tickFormatter={(v) => formatTick(v, groupBy)}
                        interval={tickInterval}
                        angle={-35}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={axisStyle}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelFormatter={(v) => formatTick(v, groupBy)}
                        formatter={(value, name) => {
                          const labels = {
                            total: "Jami",
                            approved: "Yetkazib berildi",
                            rejected: "Rad etilgan",
                            cancelled: "Bekor qilingan",
                          };
                          return [value, labels[name] || name];
                        }}
                      />
                      <Area
                        name="total"
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#statsTotal)"
                      />
                      <Area
                        name="approved"
                        type="monotone"
                        dataKey="approved"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#statsApproved)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend summary row */}
                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-gray-100 pt-3 text-center">
                  {[
                    { label: "Jami", key: "total", color: "text-blue-600" },
                    {
                      label: "Yetkazildi",
                      key: "approved",
                      color: "text-green-600",
                    },
                    { label: "Rad", key: "rejected", color: "text-red-500" },
                    {
                      label: "Bekor",
                      key: "cancelled",
                      color: "text-gray-500",
                    },
                  ].map(({ label, key, color }) => (
                    <div key={key}>
                      <p className={`text-lg font-bold ${color}`}>
                        {trends.reduce((sum, d) => sum + (d[key] || 0), 0)}
                      </p>
                      <p className="text-[11px] text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default ProductStatsSection;
