// Icons
import { MinusCircle } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { formatDeductionValue } from "@/features/payroll/data/payroll.data";
import { mySalaryQueries } from "../queries/mySalary.queries";

/**
 * OYLIKDAN USHLAB QOLISHLAR — nima uchun (sabab + IZOH), qancha va qaysi oyda
 * (`GET /payroll/deductions/my`).
 *
 * ⚠️ NIMA UCHUN ALOHIDA BO'LIM: muhrlangan majburiyat tarkibida (`
 * PayrollEntryBreakdown`) faqat SABAB bor, izoh yo'q. Oylik kutganidan kam
 * chiqqan xodim buxgalteriyaga emas, ekranga qaraydi (`finance.md` §10) —
 * shuning uchun u sababni ham, izohni ham shu yerda to'liq ko'radi.
 *
 * ⚠️ Summa muhrlangan oyda AYNAN ushlangani, joriy shakllanmagan oyda
 * "hisoblanmoqda" (oy yopilguncha dars soatiga qarab o'zgarishi mumkin).
 * Bekor qilingani faqat muhrlangan oyda ushlangan bo'lsa ko'rinadi.
 */
const MyDeductionsSection = () => {
  // Ixtiyoriy bo'lim — yiqilsa oylik ekranining qolgani baribir ishlaydi
  const { data } = useQuery(mySalaryQueries.deductions());

  if (!data?.items?.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Oylikdan ushlab qolishlar</h2>
        {Number(data.totals?.withheld) > 0 && (
          <p className="text-sm text-gray-500">
            Jami ushlangan:{" "}
            <span className="font-medium text-red-600">
              {formatMoney(data.totals.withheld)}
            </span>
          </p>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {data.items.map((item) => (
          <li key={item.id}>
            <Card className="h-full space-y-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-red-50 p-2 text-red-600">
                  <MinusCircle className="size-5" strokeWidth={1.8} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.reason}</p>
                  {item.note && (
                    <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">
                      {item.note}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDeductionValue(item.type, item.value)} ·{" "}
                    {item.periodLabel} · {item.createdAtLabel}
                  </p>
                </div>

                {item.status === "cancelled" && (
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Bekor qilingan
                  </span>
                )}
              </div>

              {item.months.length > 0 ? (
                <ul className="space-y-1">
                  {item.months.map((month) => (
                    <li
                      key={month.month}
                      className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">
                        {month.monthLabel}
                        {!month.sealed && (
                          <span className="ml-1.5 text-xs text-gray-400">
                            hisoblanmoqda
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-red-600">
                        {month.noRate
                          ? "soat narxi yo'q — ushlanmadi"
                          : `− ${formatMoney(month.amount)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">
                  Hali birorta oy oyligidan ushlanmagan
                </p>
              )}

              {item.cancelReason && (
                <p className="text-xs text-gray-500">
                  Bekor qilish sababi: {item.cancelReason}
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MyDeductionsSection;
