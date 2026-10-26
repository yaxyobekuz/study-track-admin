// Recharts
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { coinsAPI } from "@/features/coin-settings/api/coins.api";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import Button from "@/shared/components/ui/button/Button";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import AttendanceTrendCard from "./AttendanceTrendCard";

/**
 * ⚠️ UMUMIY KO'RINISHDA (barcha filiallar, faqat tizim egasi) KUNLIK
 * GRAFIK O'RNINI DAVOMAT EGALLAYDI (biznes qarori, 2026-10-26).
 * Tanga — filialning ichki rag'bati va uni filial o'zi boshqaradi; butun
 * tarmoqqa qaraydigan odamning birinchi savoli esa "bolalar maktabdami".
 * Sanoqchi kartalar (umumiy / mavjud tanga, top 10) o'z joyida qoladi:
 * ular filiallar bo'ylab to'g'ri qo'shiladi va savolni o'zgartirmaydi.
 *
 * Ruxsati bo'lmaganda (`attendance.reports` yo'q) tanga grafigi qoladi —
 * bo'sh joy qoldirish grafikni "yo'qolgan" qilib ko'rsatardi.
 */
const CoinStats = () => {
  const { isAggregate } = useBranch();
  const { can } = usePermissions();
  const showAttendance = isAggregate && can("attendance.reports");

  const { data: stats } = useQuery({
    queryKey: ["coins", "stats"],
    queryFn: () => coinsAPI.getStats().then((res) => res.data.data),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div className="space-y-4 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Total coin */}
          <Card
            title="Umumiy tarqatilgan tangalar"
            className="flex items-center justify-between gap-2"
          >
            {/* Kartaning sarlavhasi va raqami BIR QATORDA turadi, shuning
                uchun filiallar kesimi ichma-ich ro'yxat emas, chip bilan:
                qator qo'shilsa sarlavha raqamdan ajralib ketardi. */}
            <div className="flex items-center gap-2">
              <BranchSplit
                variant="chip"
                data={stats}
                path="totalCoinsDistributed"
                to="/coin-distribution"
              />
              <Counter
                value={stats?.totalCoinsDistributed ?? 0}
                className="text-2xl font-bold text-blue-500"
              />
            </div>
          </Card>

          {/* Available coin */}
          <Card
            title="Mavjud tangalar"
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <BranchSplit
                variant="chip"
                data={stats}
                path="availableCoins"
                to="/coin-distribution"
              />
              <Counter
                value={stats?.availableCoins ?? 0}
                className="text-2xl font-bold text-blue-500"
              />
            </div>
          </Card>
        </div>

        {/* Kunlik grafik — umumiy ko'rinishda davomat, aks holda tanga */}
        {showAttendance ? (
          <AttendanceTrendCard />
        ) : (
          <CoinsDailyChart stats={stats} />
        )}
      </div>

      {/* Top 10 coin owner */}
      <TopTenCoinOwner stats={stats} />
    </div>
  );
};

/** So'nggi 30 kunda tarqatilgan tangalar (filial ko'rinishi). */
const CoinsDailyChart = ({ stats }) => (
  <Card
    title="So'nggi 30 kunda tarqatilgan tangalar"
    className="col-span-2 h-60 space-y-2.5 sm:h-80"
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={stats?.dailyDistribution || []}
        margin={{ top: 20, right: 10, left: -20, bottom: 40 }}
      >
        <defs>
          <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          tickFormatter={(val) => formatDateUZ(val, { hideYear: true })}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          labelStyle={{
            color: "#6B7280",
            fontSize: "14px",
            marginBottom: "2px",
          }}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelFormatter={formatDateUZ}
          formatter={(value) => value.toLocaleString()}
          itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
        />
        <Area
          name="Tangalar"
          strokeWidth={2}
          fillOpacity={1}
          stroke="#f59e0b"
          type="monotone"
          fill="url(#colorCoins)"
          dataKey="totalDistributed"
        />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
);

const TopTenCoinOwner = ({ stats }) => {
  const getRankColor = (index) => {
    if (index === 0)
      return "size-10 bg-gradient-to-tr from-yellow-400 to-yellow-600";
    if (index === 1)
      return "size-9 mx-0.5 bg-gradient-to-tr from-slate-400 to-slate-700";
    if (index === 2)
      return "size-8 mx-1 bg-gradient-to-tr from-orange-400 to-orange-700";
    return "size-7 mx-1.5 bg-gray-100 text-gray-500";
  };

  return (
    <Card
      title="Top 10 tanga egalari"
      className="flex flex-col gap-1.5 xs:gap-3.5"
    >
      {/* Main  */}
      <div className="max-h-72 overflow-y-auto hidden-scrollbar">
        {stats?.topEarners.map((student, index) => (
          <div
            key={student.id}
            className={cn(
              "flex items-center justify-between py-2",
              index === 0 ? "sticky top-0 bg-white" : "",
            )}
          >
            {/* Info */}
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-sm font-bold text-white",
                  getRankColor(index),
                )}
              >
                {index + 1}
              </div>

              <p className="text-sm font-medium text-gray-800">
                {student.fullName}
              </p>
            </div>

            {/* Coin */}
            <Counter
              value={student?.coinBalance || 0}
              className="text-sm font-semibold text-blue-600"
            />
          </div>
        ))}
      </div>

      {/* Coin controller link */}
      <Button
        asChild
        variant="link"
        className="inline-block py-0 size-auto mx-auto text-sm"
      >
        <Link to="/coin-settings">Tanga sozlamalari</Link>
      </Button>
    </Card>
  );
};

export default CoinStats;
