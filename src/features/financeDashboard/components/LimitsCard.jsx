// Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { SlidersHorizontal } from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import Can from "@/shared/components/guards/Can";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { dashboardQueries } from "../queries/financeDashboard.queries";

/**
 * XARAJAT LIMITLARI — jadval-karta ("Xarajatlar tuzilmasi" chart o'rniga).
 *
 * Har kategoriya: Limit · Ishlatilgan · Qolgan · foiz progress bar. Rahbar
 * bir qarashda "qaysi limit yonyapti" ni ko'radi. Pastda JAMI qatori.
 *
 * Ma'lumot dashboard payload'idan EMAS, alohida so'rovdan (`getBudgets`) —
 * chunki bu yerda BARCHA kategoriyalar kerak (dashboard summary'da faqat
 * eng "yonayotgan" 8 tasi).
 */

// Foiz bo'yicha rang: yashil (bemalol) → sariq (yaqin) → qizil (oshdi)
const barTone = (rate, status) => {
  if (status === "over" || (rate != null && rate > 100)) return "bg-red-500";
  if (rate != null && rate >= 85) return "bg-amber-500";
  return "bg-green-500";
};

const LimitsCard = ({ month }) => {
  const { openModal } = useModal();

  const { data, isLoading, isError } = useQuery(
    dashboardQueries.expenseBudgets({ month }),
  );

  const items = data?.items ?? [];
  const totals = data?.totals;

  return (
    <DashboardCard
      title="Xarajat limitlari"
      hint="Har kategoriya bo'yicha limit / ishlatilgan / qolgan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Kategoriya yo'q — avval xarajat kategoriyalarini yarating"
      action={
        <Can do="reports.plan">
          <button
            onClick={() => openModal("expenseBudgets", { month: Number(month) })}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5"
          >
            <SlidersHorizontal className="size-3.5" />
            Limit qo'yish
          </button>
        </Can>
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-gray-400">
              <th className="px-2 py-1.5 text-left font-semibold">Kategoriya</th>
              <th className="px-2 py-1.5 text-right font-semibold">Limit</th>
              <th className="px-2 py-1.5 text-right font-semibold">Ishlatilgan</th>
              <th className="px-2 py-1.5 text-right font-semibold">Qolgan</th>
              <th className="px-2 py-1.5 text-right font-semibold">Foiz</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const hasLimit = row.limit != null;
              const rate = row.rate;
              const over = row.status === "over" || (rate != null && rate > 100);

              return (
                <tr key={row.categoryId} className="border-t border-gray-50">
                  <td className="px-2 py-2">
                    <p className="font-medium text-gray-900">{row.name}</p>
                    {/* Foiz progress bar — limit qo'yilgan bo'lsa */}
                    {hasLimit && (
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn("h-full rounded-full", barTone(rate, row.status))}
                          style={{ width: `${Math.min(rate ?? 0, 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-600">
                    {hasLimit ? formatMoney(row.limit) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-700">
                    {formatMoney(row.spent)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-medium tabular-nums",
                      !hasLimit ? "text-gray-300" : over ? "text-red-600" : "text-gray-900",
                    )}
                  >
                    {hasLimit ? formatMoney(row.remaining) : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-semibold tabular-nums",
                      !hasLimit ? "text-gray-300" : over ? "text-red-600" : "text-gray-500",
                    )}
                  >
                    {rate != null ? `${rate}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {totals && (
            <tfoot>
              <tr className="border-t-2 border-gray-100 font-semibold">
                <td className="px-2 py-2 text-gray-900">JAMI</td>
                <td className="px-2 py-2 text-right tabular-nums text-gray-900">
                  {formatMoney(totals.limit)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-gray-900">
                  {formatMoney(totals.spent)}
                </td>
                <td
                  className={cn(
                    "px-2 py-2 text-right tabular-nums",
                    Number(totals.remaining) < 0 ? "text-red-600" : "text-gray-900",
                  )}
                >
                  {formatMoney(totals.remaining)}
                </td>
                <td
                  className={cn(
                    "px-2 py-2 text-right tabular-nums",
                    totals.status === "over" ? "text-red-600" : "text-gray-500",
                  )}
                >
                  {totals.rate != null ? `${totals.rate}%` : "—"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </DashboardCard>
  );
};

export default LimitsCard;
