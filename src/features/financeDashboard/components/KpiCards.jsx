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

// Router
import { useNavigate } from "react-router-dom";

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
const KpiCards = ({ data, isLoading, debtorTopClass }) => {
  const navigate = useNavigate();

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
      {/* OYLIK (payroll) kartasi endi alohida qatorda (dashboardda
          o'quvchilar kartasi bilan yonma-yon), shuning uchun bu yerda YO'Q. */}
      {KPI_CARDS.filter((card) => card.key !== "payroll").map((card) => {
        const row = data.kpi[card.key];
        if (!row) return null;

        const Icon = ICONS[card.key];

        return (
          <div
            key={card.key}
            onClick={() => card.to && navigate(card.to)}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
              // Bosilsa tegishli sahifaga o'tadi — kursor va hover urg'usi
              card.to &&
                "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30",
            )}
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
                {card.subLabel}:{" "}
                <b className="font-bold text-gray-800">
                  {formatByUnit(row[card.subMoneyKey], "money")}
                </b>
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

      {/* Debitor qarzdorlik — "Foyda foizi" o'rniga, oddiy karta uslubida */}
      <DebtorKpiCard debt={data.debt} topClass={debtorTopClass} />
    </div>
  );
};

/**
 * DEBITOR QARZDORLIK — KPI qatoridagi oddiy karta (donut EMAS, PUL summasisiz).
 * Faqat sanoqlar: nechta qarzdor o'quvchi, nechtasi qisman to'lagan, nechtasi
 * umuman to'lanmagan va eng ko'p qarzli sinf. Manba `overviewDashboard.debt`
 * (sanoqlar) + `topClass` (sinflar kesimidan). Bosilsa qarzdorlar sahifasiga.
 */
export const DebtorKpiCard = ({ debt, topClass, className }) => {
  const navigate = useNavigate();
  if (!debt) return null;

  return (
    <div
      onClick={() => navigate("/finance/main/debtors")}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30 xs:p-5",
        className,
      )}
    >
      <div className="absolute -right-7 -top-7 size-24 rounded-full bg-rose-500 opacity-10" />

      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Debitor qarzdorlik
        </p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
          <Users className="size-[18px]" />
        </span>
      </div>

      {/* Asosiy raqam — qarzdor o'quvchilar soni (pul emas) */}
      <p className="relative mt-3 text-[22px] font-bold leading-tight tracking-tight text-orange-600 xl:text-2xl">
        {debt.debtorCount} ta
      </p>
      <p className="relative mt-1 text-[11px] text-gray-500">
        qarzdor o'quvchi{debt.debtorShare != null ? ` · ${debt.debtorShare}%` : ""}
      </p>

      <div className="relative mt-3 space-y-1 border-t border-gray-100 pt-2.5 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400">Qisman to'lagan</span>
          <span className="font-semibold text-amber-600">{debt.partialCount ?? 0} ta</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400">Umuman to'lanmagan</span>
          <span className="font-semibold text-red-600">{debt.unpaidCount ?? 0} ta</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400">Eng ko'p qarzli sinf</span>
          <span className="font-medium text-gray-700">{topClass ?? "—"}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * OYLIK KARTASI — pastgi qatorni to'liq egallaydigan KENG karta. Oylik
 * haqida to'liq manzara: qancha tarqatish kerak, tarqatildi, qoldi, o'tgan
 * oy bilan taqqoslash va tarqatilgan ulushi. Ma'lumot avvalgidek uch
 * kalitda keladi (`payrollDue`/`payrollPaid`/`payrollLeft`).
 */
export const PayrollKpiCard = ({ kpi, className }) => {
  const navigate = useNavigate();
  const card = KPI_CARDS.find((c) => c.key === "payroll");
  const due = kpi?.payrollDue;
  const paid = kpi?.payrollPaid;
  const left = kpi?.payrollLeft;
  if (!due) return null;

  const dueN = Number(due.value) || 0;
  const paidN = Number(paid?.value) || 0;
  // Tarqatilgan ulushi — progress bar va sarlavha nishoni uchun
  const rate = dueN > 0 ? Math.min(100, Math.round((paidN / dueN) * 100)) : 0;

  const blocks = [
    { label: "Tarqatish kerak", value: due.value, sub: due.sub, tone: "text-gray-900" },
    { label: "Tarqatildi", value: paid?.value, sub: paid?.sub, tone: "text-teal-700" },
    { label: "Qoldi", value: left?.value, sub: left?.sub, tone: "text-red-600" },
    // "O'tgan oy" o'rniga — o'rtacha oylik (avgustda oylik tarqatilmagani
    // uchun o'tgan oy taqqoslashi ma'nosiz edi)
    {
      label: "O'rtacha oylik",
      value: due.average,
      sub: due.staffCount ? `${due.staffCount} ta xodim` : null,
      tone: "text-indigo-700",
    },
  ];

  return (
    <div
      onClick={() => card.to && navigate(card.to)}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
        card.to &&
          "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -right-7 -top-7 size-24 rounded-full opacity-10",
          card.accent,
        )}
      />

      {/* Sarlavha + tarqatilgan foizi */}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
              card.accent,
            )}
          >
            <Users className="size-[18px]" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {card.label}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
          {rate}% tarqatildi
        </span>
      </div>

      {/* To'rt qiymat yonma-yon */}
      <div className="relative mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {blocks.map((b) => (
          <div key={b.label} className="min-w-0">
            <p className="text-[11px] text-gray-400">{b.label}</p>
            <p className={cn("mt-0.5 truncate text-lg font-bold leading-tight", b.tone)}>
              {formatByUnit(b.value, "money")}
            </p>
            {b.sub && <p className="mt-0.5 truncate text-[11px] text-gray-400">{b.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tarqatilgan ulushi — progress bar */}
      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-teal-500" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
};

export default KpiCards;
