// Icons
import { CirclePause } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { mySalaryQueries } from "../queries/mySalary.queries";

/**
 * TO'XTATILGAN OYLIK — qaysi oy, oylikning qaysi QISMI, nima uchun (sabab +
 * izoh) va qancha (`GET /payroll/suspensions/my`).
 *
 * Ma'muriyat oylikni (yoki uning bir qismini) to'xtatsa, xodim shu yerga
 * qaraydi. ⚠️ To'liq to'xtatilgan oy registrda 0 so'mlik qator bo'lib
 * qoladi (holati `paid`) — "To'langan" deb o'qilmasin uchun sabab shu
 * yerda ochiq turadi (`finance.md` §10).
 */
const MySuspensionsSection = () => {
  // Ixtiyoriy bo'lim — yiqilsa oylik ekranining qolgani baribir ishlaydi
  const { data } = useQuery(mySalaryQueries.suspensions());

  if (!data?.items?.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-gray-900">To&apos;xtatilgan oylik</h2>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {data.items.map((item) => (
          <li key={item.id}>
            <Card className="h-full space-y-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <CirclePause className="size-5" strokeWidth={1.8} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">
                    {item.componentLabel}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700">
                    Sabab: {item.reason}
                  </p>
                  {item.note && (
                    <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">
                      {item.note}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {item.periodLabel} · {item.createdAtLabel}
                  </p>
                </div>

                {item.status === "cancelled" && (
                  <span className="shrink-0 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Bekor qilingan — oylik qaytgan
                  </span>
                )}
              </div>

              {item.months.length > 0 && (
                <ul className="space-y-1 border-t border-gray-100 pt-2 text-sm">
                  {item.months.map((month) => (
                    <li
                      key={month.month}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-gray-600">
                        {month.monthLabel}
                        {!month.sealed && (
                          <span className="ml-1 text-xs text-gray-400">
                            (hisoblanmoqda)
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-red-600">
                        − {formatMoney(month.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MySuspensionsSection;
