// Icons
import { ArrowUpRight, Gauge } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import Panel from "./Panel";

// Data & tokens
import { CHIP, MOTION, SURFACE, T, modeOf } from "../data/ledger.tokens";
import { formatHourNumber, normRatio } from "../data/lessonHours.data";

/**
 * YUKLAMA REYTINGI — kimda eng ko'p soat.
 *
 * ⚠️ O'LCHOV — REJA (`plannedHours`), pul soati (`hours`) EMAS. `hours` dan
 * o'tilmagan darslar ayirilgan: u bilan haftasiga 30 soatli, lekin bahosi
 * qo'yilmagan o'qituvchi 27 soatlidan pastda turardi. Tartib serverda
 * (`buildLedger`), vedomostning "Oy" ustuni bilan bir xil raqam.
 *
 * ⚠️ REYTING JADVAL EMAS. Bu yerda savol "kim eng ko'p ishlaydi", ya'ni
 * javob NISBAT bo'lishi kerak — shuning uchun har qatorda uzunligi eng
 * yuqori qiymatga nisbatan o'lchanadigan chiziq bor. To'liq ro'yxat va
 * barcha ustunlar vedomost sahifasida; bu yerda ataylab o'nta.
 *
 * ⚠️ RO'YXAT OYLIK REJIMI BO'YICHA FILTRLANMAYDI — o'lchov SOAT. Oyligi
 * hali biriktirilmagan o'qituvchi ham reytingda bo'lishi kerak, aks holda
 * eng ko'p dars beradigan odam ekranda umuman ko'rinmay qolardi.
 *
 * ⚠️ NORMA HALQASI — payroll-v2 da norma tushunchasi yo'q (`normProgress`
 * doim `null`), shuning uchun halqa hozir chizilmaydi. Kod qoladi: norma
 * qaytarilsa, server bitta maydonni to'ldirishi kifoya.
 */
const LoadRanking = ({ data, isLoading, isError, delay = 0, onSelect }) => {
  const rows = data?.topTeachers ?? [];
  const max = Math.max(1, ...rows.map((r) => r.plannedHours));

  return (
    <Panel
      title="Yuklama reytingi"
      hint="Eng ko'p soatli o'nta o'qituvchi"
      icon={Gauge}
      tone="taught"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && rows.length === 0}
      emptyText="Bu oyda dars jadvalida soati bor o'qituvchi yo'q"
      padding="flush"
    >
      <ul className="px-2 pb-2">
        {rows.map((row, index) => {
          const ratio = normRatio(row.normProgress);
          const overNorm = row.normProgress != null && row.normProgress > 100;

          return (
            <li key={row.staffId}>
              <button
                type="button"
                onClick={() => onSelect?.(row)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                  T.row,
                )}
                style={{ animationDelay: `${delay + 140 + index * 34}ms` }}
              >
                {/* O'rin raqami — kul rang, e'tibor tortmaydi */}
                <span className="w-4 shrink-0 text-[11px] font-semibold tabular-nums text-slate-300">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn(T.tdName, "truncate")}>{row.staffName}</p>
                    <span className={cn(CHIP, modeOf(row.salaryType).chip)}>
                      {modeOf(row.salaryType).short}
                    </span>
                    {overNorm && (
                      <span className={cn(CHIP, "bg-amber-50 text-amber-800")}>
                        +{row.extraHours} soat
                      </span>
                    )}
                  </div>

                  {/* Yuklama chizig'i — eng yuqoriga nisbatan */}
                  <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={cn("block h-full rounded-full", MOTION.bar)}
                      style={{
                        width: `${(row.plannedHours / max) * 100}%`,
                        background: modeOf(row.salaryType).hex,
                        animationDelay: `${delay + 200 + index * 34}ms`,
                      }}
                    />
                  </div>

                  <p className={cn(T.meta, "mt-1.5 truncate")}>
                    {row.substitutedOutHours > 0 &&
                      `−${row.substitutedOutHours} berildi · `}
                    {row.substitutedInHours > 0 &&
                      `+${row.substitutedInHours} olindi · `}
                    {row.missedHours > 0 &&
                      `${formatHourNumber(row.missedHours)} o'tilmadi · `}
                    haftasiga {formatHourNumber(row.weeklyHours)}
                  </p>
                </div>

                {/* Norma halqasi — faqat aralash rejimda */}
                {ratio != null && <NormRing ratio={ratio} over={overNorm} />}

                <div className="shrink-0 text-right">
                  <p className={cn(T.tdNum)}>{formatHourNumber(row.plannedHours)}</p>
                  <p className={cn(T.meta, "mt-0.5")}>
                    {formatMoney(row.projectedAmount)}
                  </p>
                </div>

                <ArrowUpRight
                  className="size-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  strokeWidth={2}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

/**
 * NORMA HALQASI — soat 12 dan boshlanadi (soat naqshi, o'rganish talab
 * qilmaydi). Halqa 100% da to'xtaydi; oshgani yonidagi yorliqda turadi,
 * chunki aylanib ketgan halqa "nechchi foiz" ni yo'qotardi.
 */
const NormRing = ({ ratio, over }) => {
  const r = 11;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - ratio);

  return (
    <span className="hidden shrink-0 sm:block" title={`Norma: ${Math.round(ratio * 100)}%`}>
      <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
        <circle cx="14" cy="14" r={r} fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke={over ? "#B45309" : "#4F46E5"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </span>
  );
};

export default LoadRanking;
