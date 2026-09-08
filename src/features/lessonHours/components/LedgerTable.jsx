// Icons
import { ArrowUpRight, ScrollText } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import Panel from "./Panel";

// Data & tokens
import { CHIP, MODE, MOTION, STAGE, SURFACE, T, rowDelay } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * VEDOMOST — barcha o'qituvchilar bitta ro'yxatda.
 *
 * ⚠️ `<table>` ISHLATILMAYDI. Global CSS har `<table>` ga o'z uslubini
 * majburlaydi (`thead { @apply bg-primary }` — ko'k sarlavha, oq katta
 * harflar, `tbody { divide-y }`). Bu bo'lim esa CHEGARASIZ: qatorlar
 * chiziq bilan emas, `hover` foni va tipografik tekislash bilan
 * ajraladi. Shuning uchun tuzilma `grid` da chiziladi.
 *
 * ⚠️ USTUNLAR `grid-template-columns` da BIR MARTA ta'riflanadi —
 * sarlavha va qatorlar bitta doimiydan o'qiydi, aks holda ular
 * bir-biridan siljib ketardi.
 *
 * ⚠️ SAHIFALASH YO'Q. Bu ekran "oy yakunida hammasini bir ko'z bilan
 * ko'rish" uchun; sahifalash jami raqamni sahifadan sahifaga
 * o'zgartirib yuborardi.
 */
const GRID =
  "grid items-center gap-x-3 " +
  "grid-cols-[minmax(140px,1.6fr)_92px_repeat(3,68px)_96px_repeat(2,minmax(96px,1fr))_28px]";

const LedgerTable = ({ data, isLoading, isError, onSelect, delay = 0 }) => {
  const rows = data?.items ?? [];

  return (
    <Panel
      title="Vedomost"
      hint="Oy bo'yicha soat va hisoblangan maosh"
      icon={ScrollText}
      tone="sealed"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && rows.length === 0}
      emptyText="Tanlangan filtr bo'yicha xodim topilmadi"
      padding="flush"
      action={
        data && (
          <div className="text-right">
            <p className={T.label}>Jami</p>
            <p className={cn(T.value, T.sizeMd, "mt-1")}>
              {formatMoney(data.totals?.projectedAmount)}
            </p>
          </div>
        )
      }
    >
      <div className="overflow-x-auto px-2 pb-2">
        <div className="min-w-[860px]">
          {/* ── Sarlavha ─────────────────────────────────────── */}
          <div className={cn(GRID, "px-3 pb-2.5")}>
            <span className={T.th}>O'qituvchi</span>
            <span className={T.th}>Rejim</span>
            <span className={cn(T.th, "text-right")}>Hafta</span>
            <span className={cn(T.th, "text-right")}>Oy</span>
            <span className={cn(T.th, "text-right")}>O'tildi</span>
            <span className={cn(T.th, "text-center")}>O'rinbosarlik</span>
            <span className={cn(T.th, "text-right")}>Hisoblandi</span>
            <span className={cn(T.th, "text-right")}>Oy oxirida</span>
            <span />
          </div>

          {/* ── Qatorlar ─────────────────────────────────────── */}
          <ul>
            {rows.map((row, index) => (
              <li key={row.staffId}>
                <button
                  type="button"
                  onClick={() => onSelect?.(row)}
                  className={cn(
                    GRID,
                    T.row,
                    MOTION.enter,
                    "group w-full rounded-xl px-3 py-2.5 text-left",
                  )}
                  style={{ animationDelay: `${delay + rowDelay(index)}ms` }}
                >
                  {/* Ism + shartnoma formulasi */}
                  <div className="min-w-0">
                    <p className={cn(T.tdName, "truncate")}>{row.staffName}</p>
                    <p className={cn(T.formula, "mt-0.5 truncate")}>
                      {row.formulaLabel ?? "Oylik qoidasi yo'q"}
                    </p>
                  </div>

                  <span className={cn(CHIP, MODE[row.salaryType]?.chip ?? "bg-slate-100 text-slate-500")}>
                    {MODE[row.salaryType]?.short ?? "—"}
                  </span>

                  <span className={cn(T.tdNum, "text-right")}>
                    {row.usesHours ? formatHourNumber(row.weeklyHours) : "—"}
                  </span>

                  <span className={cn(T.tdNum, "text-right")}>
                    {row.usesHours ? formatHourNumber(row.hours) : "—"}
                  </span>

                  <span
                    className={cn(
                      "text-right text-[12.5px] font-semibold tabular-nums",
                      row.usesHours ? "text-indigo-600" : "text-slate-300",
                    )}
                  >
                    {row.usesHours ? formatHourNumber(row.taughtHours) : "—"}
                  </span>

                  {/* Ikki yo'nalish bitta katakda, lekin QO'SHILMAYDI */}
                  <span className="flex items-center justify-center gap-1.5">
                    {row.substitutedOutHours > 0 && (
                      <span className={cn(CHIP, "bg-rose-50 text-rose-700")}>
                        −{row.substitutedOutHours}
                      </span>
                    )}
                    {row.substitutedInHours > 0 && (
                      <span className={cn(CHIP, "bg-emerald-50 text-emerald-700")}>
                        +{row.substitutedInHours}
                      </span>
                    )}
                    {!row.substitutedOutHours && !row.substitutedInHours && (
                      <span className="text-[12.5px] text-slate-300">—</span>
                    )}
                  </span>

                  <span className={cn(T.td, "truncate text-right tabular-nums")}>
                    {formatMoney(row.accruedAmount)}
                  </span>

                  <span className="flex items-center justify-end gap-1.5">
                    <span className={cn(T.tdNum, "truncate")}>
                      {formatMoney(row.projectedAmount)}
                    </span>
                    {row.entryStatus && (
                      <span
                        aria-hidden="true"
                        title="Majburiyat shakllantirilgan"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          row.entryStatus === "paid"
                            ? STAGE.settled.dot
                            : STAGE.sealed.dot,
                        )}
                      />
                    )}
                  </span>

                  <ArrowUpRight
                    className="size-3.5 text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    strokeWidth={2}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Jamlanma qatori ────────────────────────────────── */}
      {rows.length > 0 && (
        <div className={cn(SURFACE.tile, "mx-4 mb-4 mt-1 flex flex-wrap items-center gap-x-6 gap-y-2")}>
          <Summary label="Xodim" value={String(data.totals.staffCount)} />
          <Summary label="Jami soat" value={formatHourNumber(data.totals.totalHours)} />
          <Summary label="Hozirgacha" value={formatMoney(data.totals.accruedAmount)} />
          <Summary
            label="Oy oxirida"
            value={formatMoney(data.totals.projectedAmount)}
            emphasis
          />
        </div>
      )}
    </Panel>
  );
};

const Summary = ({ label, value, emphasis }) => (
  <div>
    <p className={T.label}>{label}</p>
    <p className={cn(T.value, emphasis ? T.sizeMd : "text-[13px]", "mt-1")}>
      {value}
    </p>
  </div>
);

export default LedgerTable;
