// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { enrollmentQueries } from "../queries/enrollment.queries";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Sana maydoni to'liq va boshlanishdan keyin bo'lsagina so'raymiz. */
const isReady = ({ startDate, endDate }) =>
  (!startDate || DAY_RE.test(startDate)) &&
  (!endDate || DAY_RE.test(endDate)) &&
  (!startDate || !endDate || endDate >= startDate);

/**
 * Davr shu sanalar bilan saqlansa hisob-fakturalar bilan NIMA bo'ladi —
 * saqlashdan OLDIN, serverning o'zidan (`POST /student-enrollments/:id/preview`).
 *
 * Sabab: ketish oyi TO'LIQ to'lanadi, ya'ni "oxirgi o'qigan kun" 1-oktabr
 * bo'lsa oktabr ham qarz bo'lib qoladi. Buni admin moliyada qarz paydo
 * bo'lgandan keyin emas, shu yerda ko'rishi kerak.
 *
 * @param {object} props
 * @param {string} props.periodId
 * @param {string} [props.startDate] - tahrirlashda (YYYY-MM-DD)
 * @param {string|null} props.endDate - YYYY-MM-DD yoki bo'sh
 * @param {(value: string) => void} [props.onPickEndDate] - maslahat sanasini qo'yish
 */
const EnrollmentInvoiceImpact = ({ periodId, startDate, endDate, onPickEndDate }) => {
  // Har maydon ALOHIDA kechiktiriladi: obyektni kechiktirish har renderda
  // yangi qiymat bo'lib, taymerni cheksiz qayta ishga tushirardi
  const debouncedStart = useDebounce(startDate || "", 300);
  const debouncedEnd = useDebounce(endDate || "", 300);

  const params = {
    ...(debouncedStart ? { startDate: debouncedStart } : {}),
    endDate: debouncedEnd || null,
  };

  const { data, isError } = useQuery({
    ...enrollmentQueries.preview(periodId, params),
    enabled: Boolean(periodId) && isReady(params),
  });

  if (!data || isError) return null;

  const { lastMonth, previousMonthEnd, cancel, blocked, releasedToDeposit } = data;
  const nothingToSay = !lastMonth && cancel.length === 0 && blocked.length === 0;
  if (nothingToSay) return null;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-3 text-sm">
      {lastMonth && (
        <div>
          <p className="text-gray-500">To'liq to'lanadigan oxirgi oy</p>
          <p className="font-medium text-gray-900">
            {lastMonth.monthLabel}
            {lastMonth.invoice && ` — ${formatMoney(lastMonth.invoice.amount)}`}
          </p>
        </div>
      )}

      {previousMonthEnd && onPickEndDate && (
        <div className="rounded-lg bg-amber-50 p-2.5 text-amber-800">
          <p>
            O'quvchi bu oyda umuman o'qimagan bo'lsa, oxirgi o'qigan kun —{" "}
            <b>{formatDateUz(previousMonthEnd)}</b>. Aks holda bu oy ham qarz
            bo'lib qoladi.
          </p>
          <button
            type="button"
            className="mt-1 font-medium underline"
            onClick={() => onPickEndDate(previousMonthEnd)}
          >
            {formatDateUz(previousMonthEnd)} ni tanlash
          </button>
        </div>
      )}

      {cancel.length > 0 && (
        <div>
          <p className="text-gray-500">Bekor qilinadigan hisob-fakturalar</p>
          <ul className="mt-1 space-y-0.5">
            {cancel.map((invoice) => (
              <li key={invoice.id} className="font-medium text-gray-900">
                {invoice.monthLabel} — {formatMoney(invoice.amount)}
              </li>
            ))}
          </ul>
          {Number(releasedToDeposit) > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Ular uchun to'langan {formatMoney(releasedToDeposit)} o'quvchining
              depozitiga qaytadi
            </p>
          )}
        </div>
      )}

      {blocked.length > 0 && (
        <p className="rounded-lg bg-red-50 p-2.5 text-red-700">
          O'tgan oy hisob-fakturasi ortiqcha bo'lib qoladi:{" "}
          {blocked.map((invoice) => invoice.monthLabel).join(", ")}. Uni bekor
          qilish uchun ruxsatingiz yo'q — moliya bo'limi bekor qiladi.
        </p>
      )}
    </div>
  );
};

export default EnrollmentInvoiceImpact;
