// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronRight, Wallet } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { mySalaryQueries } from "../queries/mySalary.queries";

/**
 * MENING OYLIGIM — bosh sahifadagi qisqa karta (`GET /payroll/my-stats`).
 *
 * Rahbar "bu oy qancha olaman" degan javobni tugma bosmasdan, kirgan
 * zahoti ko'rishi kerak — to'liq ekran "Shaxsiy → Mening oyligim" da.
 *
 * ⚠️ Oyligi YO'Q xodimga umuman chizilmaydi: bo'sh karta bosh sahifani
 * ma'nosiz ishg'ol qilardi. Bo'lim sidebarda baribir turadi va u yerda
 * "oylik belgilanmagan" deb OCHIQ aytiladi.
 *
 * ⚠️ Summa muhrlangan oyda muhrdan, shakllanmagan oyda JONLI hisobdan —
 * ikkalasini ham server beradi (`finance.md` §10). Frontendda arifmetika
 * yo'q: har bir qator serverdan tayyor keladi.
 */
const MySalarySummaryCard = () => {
  const { data: stats } = useQuery(mySalaryQueries.stats());

  if (!stats?.hasSalary) return null;

  const { current } = stats;

  // Ayirmalar — faqat haqiqatan qo'llangani (nol qator "0 so'm ayrildi"
  // bo'lib chalg'itardi)
  const cuts = [
    Number(current.absenceAmount) > 0 && {
      key: "absence",
      label: current.absence?.dayCount
        ? `Kelmagan kunlar (${current.absence.dayCount} kun)`
        : "Kelmagan kunlar",
      amount: current.absenceAmount,
    },
    Number(current.suspendedAmount) > 0 && {
      key: "suspended",
      label: "To'xtatilgan qism",
      amount: current.suspendedAmount,
    },
    Number(current.deductionAmount) > 0 && {
      key: "deduction",
      label: "Ushlab qolindi",
      amount: current.deductionAmount,
    },
  ].filter(Boolean);

  return (
    <Card className="flex flex-col gap-4" title="Mening oyligim">
      <div>
        <p className="text-xs text-gray-500">
          {stats.monthLabel} ·{" "}
          {stats.isSealed ? "shakllantirilgan" : "hisoblanmoqda"}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">
          {formatMoney(current.amount)}
        </p>
        {(current.positionName || current.categoryName) && (
          <p className="mt-0.5 text-xs text-gray-400">
            {[current.positionName, current.categoryName]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AmountBox
          label="To'langan"
          value={current.paid}
          className="text-green-700"
        />
        <AmountBox
          label="Qoldiq"
          value={current.debt}
          className={Number(current.debt) > 0 ? "text-red-600" : "text-gray-400"}
        />
      </div>

      {cuts.length > 0 && (
        <ul className="space-y-1 text-xs">
          {cuts.map((cut) => (
            <li key={cut.key} className="flex justify-between gap-3">
              <span className="min-w-0 text-gray-500">{cut.label}</span>
              <span className="shrink-0 font-medium text-red-600">
                − {formatMoney(cut.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/my-salary"
        className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
      >
        <span className="flex items-center gap-2">
          <Wallet className="size-4 text-gray-400" strokeWidth={1.8} />
          Oylik qoidasi, barcha oylar va ayirmalar
        </span>
        <ChevronRight className="size-4 shrink-0 text-gray-400" strokeWidth={2.2} />
      </Link>
    </Card>
  );
};

/** Pul katakchasi — bosh sahifadagi "Keldim/Ketdim" bilan bir shaklda. */
const AmountBox = ({ label, value, className }) => (
  <div className="rounded-xl bg-gray-50 p-3 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={cn("mt-1 text-base font-semibold", className)}>
      {formatMoney(value)}
    </p>
  </div>
);

export default MySalarySummaryCard;
