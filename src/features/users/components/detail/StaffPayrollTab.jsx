// Icons
import { Wallet } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import StatTile from "./StatTile";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import PayrollEntryBreakdown from "@/features/payroll/components/PayrollEntryBreakdown";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  PAYROLL_ENTRY_COLUMNS,
  PAYROLL_RULE_COLUMNS,
  buildPayrollTiles,
  findCurrentEntry,
} from "../../data/staffPayroll.data";
import { entryStatusMetaOf, getRuleStatus } from "@/features/payroll/data/payroll.data";
import { payrollQueries } from "@/features/payroll/queries/payroll.queries";

/**
 * Xodimning OYLIGI — "qancha oladi va qancha qarzdormiz".
 *
 * Tab FAQAT O'QISH uchun: to'lash, bekor qilish va qoidani o'zgartirish
 * "Xodimlar oyligi" bo'limida qoladi. Pulni harakatlantiradigan amallar
 * bitta joyda tursa, ular uchun ruxsat va tekshiruv ham bitta bo'ladi.
 *
 * Ikkita so'rov ATAYLAB: qoida (kimga qancha) va majburiyat (har oy nima
 * hisoblangani) — ikki xil narsa. Qoida to'g'rilansa o'tgan oy majburiyati
 * o'zgarmaydi, chunki uning summasi MUHRLANGAN.
 *
 * ⚠️ MANBA ALMASHTIRILADI, EKRAN EMAS (`UserAttendancePanel` bilan AYNI
 * naqsh). Sukut bo'yicha ma'muriy yo'l (`payroll.view` ruxsati ortidagi
 * `/payroll/staff/:id`), xodim O'Z oyligini ko'rganda esa ruxsat kalitisiz
 * `/payroll/my` — javob SHAKLI bir xil, shuning uchun ekran ikkinchi marta
 * yozilmaydi. Ikki nusxa bo'lsa, biriga qo'shilgan ustun (masalan kelmagan
 * kunlar) ikkinchisida unutilardi.
 *
 * @param {object} props
 * @param {{id: string}} props.user
 * @param {object} [props.salaryQuery] - oylik qoidasi uchun `queryOptions`
 * @param {object} [props.entriesQuery] - majburiyatlar uchun `queryOptions`
 * @param {object|null} [props.stats] - `GET /payroll/my-stats` (faqat o'ziniki)
 * @param {boolean} [props.self] - ekran xodimning O'ZINIKIMI (yorliqlar uchun)
 */
const StaffPayrollTab = ({
  user,
  salaryQuery = null,
  entriesQuery = null,
  stats = null,
  self = false,
}) => {
  const { data: salary, isLoading: isSalaryLoading } = useQuery(
    salaryQuery ?? payrollQueries.staffSalary(user.id),
  );
  const { data: entries, isLoading: isEntriesLoading } = useQuery(
    entriesQuery ?? payrollQueries.staffEntries(user.id),
  );

  if (isSalaryLoading || isEntriesLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  const rules = salary?.items ?? [];
  const items = entries?.items ?? [];
  const currentMonth = salary?.currentMonth;
  const currentEntry = findCurrentEntry({ salary, entries });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {/* ⚠️ `key` tile obyektidan AJRATILADI: `{...tile}` ichida qolsa React
            uni prop deb o'qib ogohlantiradi va kalit JSX'ga yetib bormaydi. */}
        {buildPayrollTiles({ salary, entries, stats, self }).map(({ key, ...tile }) => (
          <StatTile key={key} {...tile}>
            {/* Joriy oy summasi nimalardan yig'ilgani */}
            {key === "currentMonth" && currentEntry && (
              <PayrollEntryBreakdown
                entry={currentEntry}
                showTotal
                className="mt-3 border-t border-gray-100 pt-3"
              />
            )}
          </StatTile>
        ))}
      </div>

      {rules.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Oylik belgilanmagan"
            description={
              self
                ? "Sizga hali oylik qoidasi belgilanmagan. Oylik belgilansa, har oy majburiyat avtomatik hisoblanadi va shu yerda ko'rinadi."
                : "Xodimga fiksa oylik belgilansa, har oy majburiyat avtomatik hisoblanadi. Bu 'Xodimlar oyligi' bo'limining 'Qoidalar' tabida qilinadi."
            }
          />
        </Card>
      ) : (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Oylik qoidalari</h2>

          <Table columns={PAYROLL_RULE_COLUMNS}>
            {rules.map((rule) => {
              const badge = getRuleStatus(rule, currentMonth);

              return (
                <Tr key={rule.id}>
                  {/* Qoidada bitta summa yo'q: fiksa, soat narxi va ustamalar
                      alohida — qaysi biri bor bo'lsa o'shani ko'rsatamiz */}
                  <Td align="right" nowrap={false} className="font-medium text-gray-900">
                    {Number(rule.fixedAmount) > 0 && (
                      <span className="block">{formatMoney(rule.fixedAmount)}</span>
                    )}
                    {Number(rule.effectiveRate) > 0 && (
                      <span className="block">{formatMoney(rule.effectiveRate)} × soat</span>
                    )}
                    {!(Number(rule.fixedAmount) > 0) && !(Number(rule.effectiveRate) > 0) && "—"}
                    {(rule.allowanceBreakdown ?? []).map((item, index) => (
                      <span
                        key={`${item.label}-${index}`}
                        className="block text-xs font-normal text-amber-600"
                      >
                        + {item.label}
                        {item.type === "percent" ? ` · ${item.value}%` : `: ${formatMoney(item.amount)}`}
                      </span>
                    ))}
                  </Td>

                  <Td nowrap={false} className="text-gray-500">
                    {rule.periodLabel}
                    {rule.note && (
                      <span className="block text-xs text-gray-400">
                        {rule.note}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </section>
      )}

      {items.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Oylik majburiyatlari</h2>

          <Table columns={PAYROLL_ENTRY_COLUMNS}>
            {items.map((entry) => {
              const badge = entryStatusMetaOf(entry);

              return (
                <Tr key={entry.id}>
                  <Td nowrap={false} className="font-medium text-gray-900">
                    {entry.monthLabel}
                    {/* Summa tarkibi: asosiy maosh, dars soati, ustamalar
                        (tyutor, sertifikat...), ushlab qolish — muhrdan */}
                    <PayrollEntryBreakdown entry={entry} className="mt-1 max-w-md" />
                  </Td>

                  <Td align="right">{formatMoney(entry.amount)}</Td>

                  <Td align="right" className="text-green-600">
                    {formatMoney(entry.paidAmount)}
                  </Td>

                  <Td
                    align="right"
                    className={cn(
                      "font-medium",
                      Number(entry.debt) > 0 ? "text-red-600" : "text-gray-400",
                    )}
                  >
                    {formatMoney(entry.debt)}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        badge?.className ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {badge?.label ?? entry.statusLabel}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </section>
      )}
    </div>
  );
};

export default StaffPayrollTab;
