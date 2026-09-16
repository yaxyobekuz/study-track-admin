// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Coins,
  HandCoins,
  Hourglass,
  Minus,
  Percent,
  PiggyBank,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  WalletCards,
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
  expectedProfit: Coins,
  margin: Percent,
  cashBalance: PiggyBank,
  debt: WalletCards,
  debtors: Users,
  oldestDebt: CalendarClock,
  payroll: Users,
  payrollDue: Users,
  payrollPaid: HandCoins,
  payrollLeft: Hourglass,
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
        // Oylik — uch qiymat (kerak/tarqatildi/qoldi) bitta keng kartada
        if (card.key === "payroll") {
          return <PayrollKpiCard key="payroll" card={card} kpi={data.kpi} />;
        }

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

            {/* Izoh satri — "38 ta xodim", "5 oy oldingi qarz" kabi.
                Raqamning MA'NOSINI aytadi, shuning uchun summaning ostida,
                taqqoslash bloki ustida turadi */}
            {row.sub && (
              <p className="relative mt-1 text-[11px] text-gray-500">{row.sub}</p>
            )}

            {/* Pul sub'i — server xom summa beradi, format shu yerda
                (masalan "Yig'ildi: 600 000 so'm") */}
            {card.subMoneyKey && row[card.subMoneyKey] != null && (
              <p className="relative mt-1 text-[11px] text-gray-500">
                {card.subLabel}: {formatByUnit(row[card.subMoneyKey], "money")}
              </p>
            )}

            {/* Progress bar — ulush foizi (yig'ilgan / foyda ulushi). Manfiy
                yoki 100 dan katta qiymat 0–100 ga qisiladi. */}
            {card.progress && row.progressRate != null && (
              <div className="relative mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn("h-full rounded-full", card.progressTone ?? "bg-green-500")}
                    style={{ width: `${Math.min(Math.max(row.progressRate, 0), 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {row.progressRate}%{card.progressLabel ? ` ${card.progressLabel}` : ""}
                </p>
              </div>
            )}

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

              {/* ⚠️ Taqqoslash qatori faqat taqqoslanadigan qiymatda
                  chiziladi: "Eng eski qarz" oy YORLIG'I va uni o'tgan oy
                  bilan taqqoslash ma'nosiz — "O'tgan oy: —" esa karta
                  buzuqdek ko'rinardi */}
              {row.previous != null && (
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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * OYLIK KARTASI — uch savol bitta joyda: qancha tarqatish kerak, qancha
 * tarqatildi, qancha qoldi. Ilgari uchta alohida KPI karta edi; rahbar
 * uchalasini bir qarashda ko'rishni so'radi. Ma'lumot avvalgidek uch
 * kalitda keladi (`payrollDue`/`payrollPaid`/`payrollLeft`) — bu yerda
 * faqat ko'rinish birlashtiriladi. Karta 2 ustun keng.
 */
const PayrollKpiCard = ({ card, kpi }) => {
  const due = kpi.payrollDue;
  const paid = kpi.payrollPaid;
  const left = kpi.payrollLeft;
  if (!due) return null;

  const dueN = Number(due.value) || 0;
  const paidN = Number(paid?.value) || 0;
  // Tarqatilgan ulushi — progress bar uchun
  const rate = dueN > 0 ? Math.min(100, Math.round((paidN / dueN) * 100)) : 0;

  const blocks = [
    { label: "Tarqatish kerak", value: due.value, sub: due.sub, tone: "text-gray-900" },
    { label: "Tarqatildi", value: paid?.value, sub: paid?.sub, tone: "text-teal-700" },
    { label: "Qoldi", value: left?.value, sub: left?.sub, tone: "text-red-600" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5 sm:col-span-2">
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
          <Users className="size-[18px]" />
        </span>
      </div>

      {/* Uch qiymat yonma-yon */}
      <div className="relative mt-3 grid grid-cols-3 gap-3">
        {blocks.map((b) => (
          <div key={b.label} className="min-w-0">
            <p className="text-[11px] text-gray-400">{b.label}</p>
            <p
              className={cn(
                "mt-0.5 truncate text-base font-bold leading-tight xl:text-lg",
                b.tone,
              )}
            >
              {formatByUnit(b.value, "money")}
            </p>
            {b.sub && <p className="mt-0.5 truncate text-[11px] text-gray-400">{b.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tarqatilgan ulushi */}
      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-teal-500" style={{ width: `${rate}%` }} />
      </div>

      {/* O'tgan oy bilan taqqoslash — "tarqatish kerak" bo'yicha */}
      {due.previous != null && (
        <div className="relative mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span className="text-gray-400">
            O'tgan oy: {formatByUnit(due.previous, "money")}
          </span>
          <Delta change={due.change} changeUnit={due.changeUnit} inverse={card.inverse} />
        </div>
      )}
    </div>
  );
};

export default KpiCards;
