// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  KPI_CARDS,
  formatByUnit,
  formatChange,
  planTone,
  trendTone,
} from "../data/financeDashboard.data";

const ICONS = {
  income: Receipt,
  expense: Wallet,
  profit: TrendingUp,
  margin: Percent,
  cashBalance: PiggyBank,
};

/** O'tgan oyga nisbatan o'zgarish — foizni ham, punktni ham server beradi. */
const Delta = ({ change, changeUnit, inverse }) => {
  if (change == null) return null;

  const tone = trendTone(change, { inverse });
  const Icon =
    tone.direction === "up" ? ArrowUpRight : tone.direction === "down" ? ArrowDownRight : Minus;

  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium", tone.className)}>
      <Icon className="size-3.5 shrink-0" />
      {formatChange(change, changeUnit)}
    </span>
  );
};

/**
 * Sahifaning yuqori qatori — beshta savolga bir qarashda javob:
 * qancha kirdi, qancha chiqdi, qancha qoldi, qanchalik foydali, kassada
 * nima bor.
 *
 * ⚠️ Har kartada IKKI taqqoslash bor: REJA (rahbar nima kutgan) va
 * O'TGAN OY (haqiqat qayoqqa ketyapti). Dizaynning ikki variantida ular
 * alohida edi — bittasini tashlab qoldirish "reja bajarildimi?" yoki
 * "o'sdikmi?" savollaridan birini javobsiz qoldirardi.
 */
const KpiCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {KPI_CARDS.map((card) => (
          <div key={card.key} className="h-32 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (!data?.kpi) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {KPI_CARDS.map((card) => {
        const row = data.kpi[card.key];
        if (!row) return null;

        const Icon = ICONS[card.key];

        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5"
          >
            {/* Yumshoq rangli dog' — kartalarni ajratadi, raqamni bosmaydi */}
            <div
              className={cn(
                "absolute -right-7 -top-7 size-24 rounded-full opacity-10",
                card.accent,
              )}
            />

            <div className="relative flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                  card.accent,
                )}
              >
                <Icon className="size-[18px]" />
              </span>
            </div>

            <p
              className={cn(
                "relative mt-3 text-[22px] font-bold leading-tight tracking-tight xl:text-2xl",
                card.tone,
              )}
            >
              {formatByUnit(row.value, row.unit)}
            </p>

            <div className="relative mt-3 space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
              {/* REJA — belgilanmagan bo'lsa qator umuman chizilmaydi:
                  "Reja: —" bo'sh joy egallab, hech narsa aytmasdi */}
              {row.plan != null && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">
                    Reja: {formatByUnit(row.plan, row.unit)}
                  </span>
                  {row.planRate != null && (
                    <span
                      className={cn(
                        "font-semibold",
                        planTone(row.planRate, { inverse: card.inverse }),
                      )}
                    >
                      {row.planRate}%
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400">
                  O'tgan oy: {formatByUnit(row.previous, row.unit)}
                </span>
                <Delta
                  change={row.change}
                  changeUnit={row.changeUnit}
                  inverse={card.inverse}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
