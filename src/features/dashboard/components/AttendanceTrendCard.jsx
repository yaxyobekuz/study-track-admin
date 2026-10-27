// React
import { useMemo } from "react";

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

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { attendanceReportsQueries } from "@/features/attendance/queries/attendance.queries";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

/**
 * SO'NGGI 30 KUNDAGI O'QUVCHILAR DAVOMATI — bosh sahifadagi grafik.
 *
 * ⚠️ UMUMIY KO'RINISHDA (barcha filiallar) tanga grafigining O'RNIDA
 * turadi: tizim egasi butun tarmoqqa qaraganda birinchi savol "bolalar
 * maktabdami" bo'ladi, tanga esa filialning ichki rag'bati.
 *
 * ⚠️ FOIZ SHU YERDA HISOBLANADI, serverdan tayyor kelmaydi:
 * `kelgan ÷ kutilgan`. Umumiy ko'rinishda server javoblari filiallar
 * bo'ylab birlashtiriladi va foiz OG'IRLIKSIZ o'rtachalanardi
 * (40 o'quvchili filial 600 o'quvchili filial bilan teng tortardi),
 * sanoqlar esa qo'shiladi — shuning uchun yagona aniq yo'l shu.
 *
 * Foiz KUTILGAN o'quvchi-kunlarga nisbatan: belgilanmagan o'quvchi
 * kelmagan hisoblanadi ("Hisobotlar" bo'limi bilan AYNI qoida).
 *
 * ⚠️ BALANDLIK QAT'IY EMAS (`min-h` + `flex-1`): karta ustunda qolgan
 * joyni egallaydi, shuning uchun o'ng ustundagi baland karta yonida
 * bo'sh oq joy qolmaydi (`OverviewStats`).
 */

/** Grafik davri (kun) — tanga grafigi bilan AYNI. */
const TREND_DAYS = 30;

const percentOf = (came, expected) =>
  expected ? Math.round((came / expected) * 1000) / 10 : null;

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="space-y-0.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-gray-500">{formatDateUZ(d.date)}</p>
      <p className="text-sm font-bold text-blue-600">
        {d.percent == null ? "—" : `${d.percent}%`}
      </p>
      <p className="text-gray-600">
        Kelgan: {d.came} / {d.expected}
      </p>
      {d.absent > 0 && <p className="text-red-600">Kelmadi: {d.absent}</p>}
      {d.excused > 0 && <p className="text-blue-500">Sababli: {d.excused}</p>}
      {/* ⚠️ Bugungi kun ko'pincha shu qator bilan tushuntiriladi: davomat
          kun davomida belgilanadi, belgilanmagani esa kelmagan hisoblanadi. */}
      {d.unmarked > 0 && (
        <p className="text-gray-400">Belgilanmagan: {d.unmarked}</p>
      )}
    </div>
  );
};

const AttendanceTrendCard = () => {
  const { data: trend, isLoading } = useQuery(
    attendanceReportsQueries.studentTrend(TREND_DAYS),
  );

  const data = useMemo(() => {
    const rows = trend?.byDay ?? [];

    // ⚠️ SARALASH MAJBURIY. Umumiy ko'rinishda javoblar filiallar bo'ylab
    // birlashtiriladi va faqat ikkinchi filialda bor kun ro'yxat OXIRIGA
    // tushadi (`aggregateMerge.helpers.js` — guruhlar birinchi ko'rilgan
    // tartibda qoladi). Saralanmasa chiziq orqaga sakrab chizilardi.
    return [...rows]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((d) => ({ ...d, percent: percentOf(d.came, d.expected) }));
  }, [trend]);

  // O'q pastdan 100% gacha: davomat odatda 85–100% oralig'ida yuradi va
  // 0 dan boshlansa, chiziq tekis bo'lib trend ko'rinmay qolardi.
  const yMin = useMemo(() => {
    const values = data.map((d) => d.percent).filter((v) => v != null);
    if (!values.length) return 0;
    return Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  }, [data]);

  const overall = percentOf(trend?.summary?.came, trend?.summary?.expected);

  return (
    <Card className="flex min-h-60 flex-1 flex-col gap-2.5 sm:min-h-80">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">
          So&apos;nggi {TREND_DAYS} kundagi davomat
        </h2>

        {isLoading ? (
          <Skeleton className="h-5 w-12" />
        ) : (
          overall != null && (
            <span className="text-sm font-bold text-blue-600">{overall}%</span>
          )
        )}
      </div>

      {/* ⚠️ `min-h-0` MAJBURIY: flex bolasining eng kichik balandligi sukut
          bo'yicha mazmuniga teng va grafik ustunni cho'zib yuborardi. */}
      <div className="min-h-0 flex-1">
        {!isLoading && !data.length ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-gray-400">
            Davomat ma&apos;lumoti topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 10, left: -20, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                domain={[yMin, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                name="Davomat"
                strokeWidth={2}
                fillOpacity={1}
                stroke="#3b82f6"
                type="monotone"
                dataKey="percent"
                fill="url(#colorAttendance)"
                // Yozuvsiz kun (yakshanba, bayram) ro'yxatga umuman
                // kirmaydi, lekin ma'lumoti yo'q nuqta chiziqni uzsin.
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default AttendanceTrendCard;
