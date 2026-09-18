// React
import { useState } from "react";

// Icons
import { ChevronDown } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Queries
import { dashboardQueries } from "../queries/financeDashboard.queries";

// Standart holatda ko'rinadigan kunlar soni — qolgani tugma bilan ochiladi
const COLLAPSED_DAYS = 7;

const money = (value) => formatMoney(value, { withLabel: false });
const isZero = (value) => Number(value) === 0;

/** Ishorali summa: "+1 200 000" / "−300 000" / "—". */
const signed = (value) => {
  const n = Number(value);
  if (n === 0) return "—";
  return `${n > 0 ? "+" : "−"}${money(Math.abs(n))}`;
};

/** Kichik izoh qatori: faqat nolga teng bo'lmagan qismlar. */
const parts = (list) =>
  list
    .filter(([, value]) => !isZero(value))
    .map(([label, value]) => `${label} ${money(value)}`)
    .join(" · ");

/**
 * KUNLIK PUL HARAKATI — har kun uchun kirim, chiqim va kun oxiridagi kassa
 * qoldig'i (barcha to'lov turlari bo'yicha).
 *
 * ⚠️ RAQAMLAR SERVERDAN: frontend qoldiqni o'zi yig'maydi. Server daftardan
 * hisoblaydi va "kun boshi + kirim − chiqim = kun oxiri" har kuni aniq
 * bajariladi — oxirgi qoldiq "Kassadagi pul" kartasi bilan bir xil.
 *
 * ⚠️ KARTA ICHIDA SURILISH YO'Q (`DashboardCard` qoidasi): standart holatda
 * oxirgi 7 kun, qolgani "Butun oy" tugmasi bilan shu yerning o'zida ochiladi.
 *
 * @param {{ month: string|number, className?: string }} props
 */
const DailyCashCard = ({ month, className }) => {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useQuery(dashboardQueries.dailyCash({ month }));

  const days = [...(data?.days ?? [])].reverse(); // yangi kun tepada
  const visible = expanded ? days : days.slice(0, COLLAPSED_DAYS);
  const hasOther = days.some((day) => !isZero(day.other));
  const totals = data?.totals;
  const isCurrent = days.some((day) => day.isToday);

  return (
    <DashboardCard
      title="Kunlik pul harakati"
      hint={
        data
          ? `${data.monthLabel} · barcha to'lov turlari bo'yicha, kun oxiridagi holat`
          : "Kirim, chiqim va kassa qoldig'i — har kun uchun"
      }
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && days.length === 0}
      emptyText="Bu oy hali boshlanmagan"
      className={className}
    >
      {totals && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryBlock label="Oy boshida kassada" value={formatMoney(data.openingBalance)} />
          <SummaryBlock
            label="Kirim"
            value={`+${formatMoney(totals.income)}`}
            tone="text-emerald-600"
            sub={parts([
              ["o'quvchilar", totals.studentPayments],
              ["boshqa", totals.externalIncome],
            ])}
          />
          <SummaryBlock
            label="Chiqim"
            value={isZero(totals.expense) ? formatMoney(0) : `−${formatMoney(totals.expense)}`}
            tone="text-red-600"
            sub={parts([
              ["oylik", totals.salary],
              ["xarajat", totals.expenses],
            ])}
          />
          <SummaryBlock
            label={isCurrent ? "Hozir kassada" : "Oy oxirida kassada"}
            value={formatMoney(data.closingBalance)}
            sub={`oy davomida ${signed(totals.net)}`}
          />
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <th className="py-2 pr-3 font-medium">Sana</th>
                <th className="py-2 pr-3 text-right font-medium">Kirim</th>
                <th className="py-2 pr-3 text-right font-medium">Chiqim</th>
                {hasOther && (
                  <th className="py-2 pr-3 text-right font-medium">Qaytarish / to'g'rilash</th>
                )}
                <th className="py-2 pr-3 text-right font-medium">Kun natijasi</th>
                <th className="py-2 text-right font-medium">Kassa qoldig'i, so'm</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((day) => {
                const quiet = isZero(day.income) && isZero(day.expense) && isZero(day.other);
                const net = Number(day.net);
                return (
                  <tr
                    key={day.date}
                    className={cn(
                      "border-b border-gray-50 align-top last:border-0",
                      day.isToday && "bg-indigo-50/50",
                    )}
                  >
                    <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-gray-900">
                      {formatDateUz(`${day.date}T12:00:00`, { hideYear: true })}
                      {day.isToday && (
                        <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          Bugun
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">
                      {isZero(day.income) ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <>
                          <span className="font-medium text-emerald-600">{signed(day.income)}</span>
                          <span className="block text-[11px] text-gray-400">
                            {parts([
                              ["o'quvchilar", day.studentPayments],
                              ["boshqa", day.externalIncome],
                            ])}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">
                      {isZero(day.expense) ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <>
                          <span className="font-medium text-red-600">{signed(-Number(day.expense))}</span>
                          <span className="block text-[11px] text-gray-400">
                            {parts([
                              ["oylik", day.salary],
                              ["xarajat", day.expenses],
                            ])}
                          </span>
                        </>
                      )}
                    </td>
                    {hasOther && (
                      <td className="py-2.5 pr-3 text-right tabular-nums text-gray-600">
                        {isZero(day.other) ? <span className="text-gray-300">—</span> : signed(day.other)}
                      </td>
                    )}
                    <td
                      className={cn(
                        "py-2.5 pr-3 text-right font-medium tabular-nums",
                        quiet ? "text-gray-300" : net >= 0 ? "text-emerald-700" : "text-red-600",
                      )}
                    >
                      {signed(day.net)}
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-gray-900">
                      {money(day.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {days.length > COLLAPSED_DAYS && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-100 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          {expanded ? "Oxirgi 7 kun" : `Butun oy (${days.length} kun)`}
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </DashboardCard>
  );
};

const SummaryBlock = ({ label, value, sub, tone = "text-gray-900" }) => (
  <div className="min-w-0 rounded-xl bg-gray-50 px-3 py-2.5">
    <p className="text-[11px] text-gray-400">{label}</p>
    <p className={cn("mt-0.5 truncate text-base font-bold tabular-nums", tone)}>{value}</p>
    {sub && <p className="mt-0.5 truncate text-[11px] text-gray-400" title={sub}>{sub}</p>}
  </div>
);

export default DailyCashCard;
