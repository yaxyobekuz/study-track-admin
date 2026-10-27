// React
import { useMemo } from "react";

// Recharts
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Icons
import { CalendarRange } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Data
import { toneOfReason } from "../data/departures.data";
import { END_REASON_OPTIONS } from "../data/enrollment.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMonthUz } from "@/shared/utils/date.utils";

/**
 * OYLAR KESIMI — "qachon ketishyapti" degan savol.
 *
 * Ustunlar SABAB bo'yicha qatlamlangan: bir oyda to'rtta bitiruvchi bilan
 * to'rtta chetlatish bir xil balandlikda turishi mumkin, lekin ular
 * butunlay boshqa xabar. Rang tili jadval va kartalar bilan AYNI
 * (`departures.data.js`).
 *
 * ⚠️ BO'SH OYLAR HAM USTUNDA (server ularni nol bilan qaytaradi): grafikda
 * oy tushib qolsa, "o'sha oyda hech kim ketmagan" bilan "ma'lumot yo'q"
 * bir xil ko'rinardi.
 */
const DepartureTrendCard = ({ byMonth = [], isLoading }) => {
  /**
   * ⚠️ SARALASH MAJBURIY — umumiy ko'rinishda oylar filiallar bo'ylab
   * birlashtiriladi va faqat ikkinchi filialda bor oy ro'yxat OXIRIGA
   * tushadi: saralanmasa grafik vaqt bo'yicha orqaga sakrab chizilardi.
   */
  const rows = useMemo(
    () => [...byMonth].sort((a, b) => a.month - b.month),
    [byMonth],
  );

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="font-semibold text-gray-900">Oylar kesimi</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Qaysi oyda qancha o&apos;quvchi ketgan — sababi bilan
          </p>
        </div>

        {/* Qo'lda yozilgan legenda: Recharts legendasi tipografiyani
            bo'limning qolgan qismidan ajratib yuborardi */}
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {END_REASON_OPTIONS.map((option) => (
            <li
              key={option.value}
              className="flex items-center gap-1.5 text-[11px] text-gray-500"
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  toneOfReason(option.value).bar,
                )}
              />
              {option.label}
            </li>
          ))}
        </ul>
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          className="py-10"
          title="Bu davrda ketish qayd etilmagan"
          description="Davrni kengaytirib ko'ring — masalan «Hammasi»."
        />
      ) : (
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#f3f4f6" vertical={false} />

              <XAxis
                dataKey="month"
                tickFormatter={(month) => formatMonthUz(month, { hideYear: true })}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
              />

              <YAxis
                width={28}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<TrendTooltip />} cursor={{ fill: "#f9fafb" }} />

              {END_REASON_OPTIONS.map((option) => (
                <Bar
                  key={option.value}
                  stackId="reason"
                  dataKey={option.value}
                  name={option.label}
                  fill={toneOfReason(option.value).fill}
                  maxBarSize={44}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

/** Oy ustunining tarkibi — faqat nol bo'lmagan toifalar. */
const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;
  const parts = payload.filter((item) => item.value > 0);

  return (
    <div className="space-y-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{formatMonthUz(row.month)}</p>
      <p className="text-gray-500">
        Jami{" "}
        <span className="font-semibold tabular-nums text-gray-900">
          {row.total}
        </span>{" "}
        ta
      </p>

      {parts.length > 0 && (
        <ul className="space-y-0.5 border-t border-gray-100 pt-1">
          {parts.map((item) => (
            <li key={item.dataKey} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-gray-900">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DepartureTrendCard;
