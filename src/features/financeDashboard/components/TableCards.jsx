// Icons
import { ArrowDownRight, ArrowUpRight, Info, Minus } from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "@/shared/components/dashboard/MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import {
  formatByUnit,
  formatChange,
  planBarTone,
  planTone,
  trendTone,
} from "../data/financeDashboard.data";

/**
 * ⚠️ Jadval kataklarida "so'm" TAKRORLANMAYDI.
 *
 * Har qatorda "70 129 000 so'm" turganda summa ikki satrga bo'linib
 * ketardi va ustundagi raqamlarni ustma-ust solishtirib bo'lmasdi. Valyuta
 * bir marta, karta izohida aytiladi — moliyaviy hisobotning odatiy shakli.
 * Foizli qatorlar o'z belgisini (`%`) saqlaydi, ya'ni chalkashlik yo'q.
 */
const CURRENCY_HINT = "summalar so'mda";

/** Turiga qarab formatlaydi, pulda "so'm" qo'shmaydi. */
const cellValue = (value, unit) =>
  unit === "percent" || unit === "count"
    ? formatByUnit(value, unit)
    : formatMoney(value, { withLabel: false });

/**
 * O'zgarish ustuni — rangli yorliq.
 *
 * Oddiy matn o'rniga fon berilgani ataylab: "Farq" ustuni jadvalning
 * XULOSASI, ko'z birinchi navbatda shu ustunni topishi kerak.
 */
const Change = ({ change, changeUnit, inverse }) => {
  if (change == null) return <span className="text-gray-300">—</span>;

  const tone = trendTone(change, { inverse });
  const Icon =
    tone.direction === "up" ? ArrowUpRight : tone.direction === "down" ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        tone.className === "text-green-600" && "bg-green-50 text-green-700",
        tone.className === "text-red-600" && "bg-red-50 text-red-600",
        tone.className === "text-gray-400" && "bg-gray-50 text-gray-400",
      )}
    >
      <Icon className="size-3 shrink-0" />
      {formatChange(change, changeUnit)}
    </span>
  );
};

/**
 * P&L (FOYDA VA ZARAR) HISOBOTI.
 *
 * Joriy oy va taqqoslanadigan oy yonma-yon: "tushum o'sdi" degan gap
 * nimaga nisbatan o'sgani ko'rsatilmasa hech narsa anglatmaydi.
 *
 * Qatorlar IYERARXIYALI: asosiy ko'rsatkichlar qalin, "shundan:" qatorlari
 * esa chekinma va och rangda — ular yuqoridagi qatorning ichki taqsimoti,
 * mustaqil raqam emas.
 */
export const PnlCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.pnl ?? [];

  return (
    <DashboardCard
      title="P&L (foyda va zarar) hisoboti"
      hint={
        data
          ? `${data.monthLabel} — ${data.compareMonthLabel} bilan · ${CURRENCY_HINT}`
          : ""
      }
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Ko'rsatkich" },
          { label: "Joriy oy", align: "right" },
          { label: "O'tgan oy", align: "right" },
          { label: "Farq", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr
            key={row.key}
            className={cn(
              row.muted && "border-transparent",
              // EBITDA — P&L pastidagi alohida ko'rsatkich, yuqoridagi
              // qatorlar yig'indisi emas: qalinroq chiziq bilan ajratiladi
              row.key === "ebitda" && "border-t-2 border-gray-200",
            )}
          >
            <MiniTd
              className={cn(
                row.emphasis ? "font-semibold text-gray-900" : "text-gray-600",
                row.muted && "pl-3 text-[11px] text-gray-400",
              )}
            >
              <span className="inline-flex items-center gap-1">
                {row.label}
                {row.hint && (
                  <span title={row.hint} className="cursor-help">
                    <Info className="size-3 text-gray-300" />
                  </span>
                )}
              </span>
            </MiniTd>

            <MiniTd
              align="right"
              className={cn(
                row.emphasis ? "font-semibold text-gray-900" : "text-gray-700",
                row.muted && "text-[11px] text-gray-400",
              )}
            >
              {cellValue(row.current, row.unit)}
            </MiniTd>

            <MiniTd
              align="right"
              className={cn("text-gray-400", row.muted && "text-[11px]")}
            >
              {cellValue(row.previous, row.unit)}
            </MiniTd>

            <MiniTd align="right">
              <Change
                change={row.change}
                changeUnit={row.changeUnit}
                inverse={row.inverse}
              />
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * BUDJET IJROSI — reja va amaldagi natija.
 *
 * Reja belgilanmagan qatorda "—" turadi va bu TO'G'RI: "0% bajarildi"
 * deyish rejasi yo'q ko'rsatkichni muvaffaqiyatsiz qilib ko'rsatardi.
 */
export const BudgetCard = ({ data, isLoading, isError, action, className }) => {
  const rows = data?.budget ?? [];
  // Rahbar qo'lda qo'shgan qatorlar — katalog qatorlaridan KEYIN va
  // chiziq bilan ajratilgan holda: ular tizimdan hisoblanmaydi, ya'ni
  // ularga boshqacha ishonch darajasi bilan qaraladi
  const customRows = data?.customBudget ?? [];
  const hasAnyPlan =
    rows.some((row) => row.plan != null) || customRows.length > 0;

  return (
    <DashboardCard
      title="Budjet ijrosi (oylik)"
      hint={
        hasAnyPlan
          ? `Reja rahbar tomonidan belgilanadi · ${CURRENCY_HINT}`
          : "Bu oyga reja belgilanmagan"
      }
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      bodyClassName="overflow-x-auto"
      className={className}
      footer={
        hasAnyPlan && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
            <span className="text-gray-400">
              {rows.filter((row) => row.rate != null).length} ta ko'rsatkichdan{" "}
              <span className="font-semibold text-green-600">
                {
                  rows.filter(
                    (row) =>
                      row.rate != null &&
                      (row.inverse ? row.rate <= 100 : row.rate >= 95),
                  ).length
                }
              </span>{" "}
              tasi rejada
            </span>
            <span className="text-gray-400">
              Reja belgilanmagan:{" "}
              <span className="font-semibold text-gray-700">
                {rows.filter((row) => row.plan == null).length}
              </span>
            </span>
          </div>
        )
      }
    >
      <MiniTable
        columns={[
          { label: "Ko'rsatkich" },
          { label: "Reja", align: "right" },
          { label: "Amalda", align: "right" },
          { label: "Farq", align: "right" },
          { label: "Bajarilishi", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.key}>
            <MiniTd className="text-gray-600">{row.label}</MiniTd>

            <MiniTd align="right" className="text-gray-400">
              {row.plan == null ? "—" : cellValue(row.plan, row.unit)}
            </MiniTd>

            <MiniTd align="right" className="text-sm font-bold text-gray-900">
              {cellValue(row.actual, row.unit)}
            </MiniTd>

            <MiniTd align="right">
              {row.diff == null ? (
                <span className="text-gray-300">—</span>
              ) : (
                <span
                  className={cn(
                    Number(row.diff) === 0
                      ? "text-gray-400"
                      : (Number(row.diff) > 0) !== Boolean(row.inverse)
                        ? "text-green-600"
                        : "text-red-600",
                  )}
                >
                  {Number(row.diff) > 0 ? "+" : ""}
                  {cellValue(row.diff, row.unit)}
                </span>
              )}
            </MiniTd>

            <MiniTd align="right">
              {row.rate == null ? (
                <span className="text-gray-300">—</span>
              ) : (
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-gray-100 sm:block">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        planBarTone(row.rate, { inverse: row.inverse }),
                      )}
                      style={{ width: `${Math.min(Math.max(row.rate, 0), 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      planTone(row.rate, { inverse: row.inverse }),
                    )}
                  >
                    {row.rate}%
                  </span>
                </div>
              )}
            </MiniTd>
          </MiniTr>
        ))}

        {customRows.map((row, index) => (
          <MiniTr
            key={row.key}
            className={index === 0 ? "border-t-2 border-gray-200" : undefined}
          >
            <MiniTd className="text-gray-600">
              {row.label}
              <span
                className="ml-1.5 text-[10px] text-gray-300"
                title="Tizimda hisoblanmaydi — qiymat qo'lda kiritilgan"
              >
                qo'lda
              </span>
            </MiniTd>

            <MiniTd align="right" className="text-gray-400">
              {cellValue(row.plan, row.unit)}
            </MiniTd>

            <MiniTd align="right" className="text-sm font-bold text-gray-900">
              {row.actual == null ? (
                <span className="text-gray-300">—</span>
              ) : (
                cellValue(row.actual, row.unit)
              )}
            </MiniTd>

            <MiniTd align="right">
              {row.diff == null ? (
                <span className="text-gray-300">—</span>
              ) : (
                <span
                  className={cn(
                    Number(row.diff) === 0
                      ? "text-gray-400"
                      : Number(row.diff) > 0
                        ? "text-green-600"
                        : "text-red-600",
                  )}
                >
                  {Number(row.diff) > 0 ? "+" : ""}
                  {cellValue(row.diff, row.unit)}
                </span>
              )}
            </MiniTd>

            <MiniTd align="right">
              {row.rate == null ? (
                <span className="text-gray-300">—</span>
              ) : (
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-gray-100 sm:block">
                    <div
                      className={cn("h-full rounded-full", planBarTone(row.rate))}
                      style={{ width: `${Math.min(Math.max(row.rate, 0), 100)}%` }}
                    />
                  </div>
                  <span className={cn("font-semibold", planTone(row.rate))}>
                    {row.rate}%
                  </span>
                </div>
              )}
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * YO'NALISHLAR BO'YICHA NATIJA.
 *
 * ⚠️ Izoh MAJBURIY va u serverdan keladi: xarajat yo'nalishlar bo'yicha
 * yuritilmaydi va tushum ulushiga mutanosib taqsimlangan. Izohsiz bu ustun
 * "haqiqiy xarajat" deb o'qilardi va rentabellik ustuniga qarab yo'nalish
 * yopish haqida qaror qabul qilinishi mumkin edi.
 */
export const DirectionsCard = ({ data, isLoading, isError, className }) => {
  const directions = data?.directions;
  const rows = directions?.items ?? [];
  const totals = directions?.totals;

  return (
    <DashboardCard
      title="Yo'nalishlar bo'yicha natija"
      hint={directions?.note ? `${directions.note} · ${CURRENCY_HINT}` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu oyda tushum yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Yo'nalish" },
          { label: "Tushum", align: "right" },
          { label: "Ulush", align: "right" },
          { label: "Xarajat", align: "right" },
          { label: "Sof foyda", align: "right" },
          { label: "Rentabellik", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.key}>
            <MiniTd className="font-medium text-gray-700">
              {row.label}
              {row.studentCount != null && (
                <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                  {row.studentCount} ta
                </span>
              )}
            </MiniTd>

            <MiniTd align="right" className="text-gray-700">
              {formatMoney(row.income, { withLabel: false })}
            </MiniTd>
            <MiniTd align="right" className="text-gray-400">
              {row.share}%
            </MiniTd>
            <MiniTd align="right" className="text-gray-500">
              {formatMoney(row.expense, { withLabel: false })}
            </MiniTd>
            <MiniTd
              align="right"
              className={cn(
                "font-medium",
                Number(row.profit) >= 0 ? "text-green-700" : "text-red-600",
              )}
            >
              {formatMoney(row.profit, { withLabel: false })}
            </MiniTd>
            <MiniTd align="right" className="text-gray-700">
              {row.margin == null ? "—" : `${row.margin}%`}
            </MiniTd>
          </MiniTr>
        ))}

        {totals && (
          <MiniTr className="border-t-2 border-gray-200 font-semibold text-gray-900">
            <MiniTd>JAMI</MiniTd>
            <MiniTd align="right">
              {formatMoney(totals.income, { withLabel: false })}
            </MiniTd>
            <MiniTd align="right" className="text-gray-400">
              100%
            </MiniTd>
            <MiniTd align="right">
              {formatMoney(totals.expense, { withLabel: false })}
            </MiniTd>
            <MiniTd
              align="right"
              className={Number(totals.profit) >= 0 ? "text-green-700" : "text-red-600"}
            >
              {formatMoney(totals.profit, { withLabel: false })}
            </MiniTd>
            <MiniTd align="right">
              {totals.margin == null ? "—" : `${totals.margin}%`}
            </MiniTd>
          </MiniTr>
        )}
      </MiniTable>
    </DashboardCard>
  );
};
