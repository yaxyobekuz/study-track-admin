// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * KPI KARTASI — qiymat + o'tgan davrga nisbatan o'zgarish.
 *
 * ⚠️ O'ZGARISH BO'LMASA "—" CHIZILADI, "0%" EMAS. `null` — "taqqoslash
 * uchun ma'lumot yo'q" (o'tgan davrda urinish bo'lmagan), 0 esa
 * "o'zgarmadi". Ikkalasini bir xil ko'rsatish rahbarni chalg'itardi.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {number|null} [props.delta] - o'zgarish (punkt yoki %)
 * @param {string} [props.deltaSuffix="%"]
 * @param {string} [props.hint] - qiymat ostidagi izoh
 * @param {React.ReactNode} [props.chart] - qiymat yonidagi kichik grafik
 */
const StatCard = ({
  label,
  value,
  delta,
  deltaSuffix = "%",
  hint,
  icon: Icon,
  chart = null,
  className = "",
}) => {
  const hasDelta = delta != null && Number.isFinite(delta);
  const up = hasDelta && delta > 0;
  const down = hasDelta && delta < 0;
  const DeltaIcon = up ? TrendingUp : down ? TrendingDown : Minus;

  return (
    <div className={cn("rounded-2xl bg-white p-4 xs:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        {Icon && <Icon className="size-5 shrink-0 text-gray-300" strokeWidth={1.5} />}
      </div>

      {/* ⚠️ Grafik QIYMAT BILAN BIR QATORDA: pastga tushirilsa karta
          balandligi qatordagi qolgan kartalardan farq qilib qolardi. */}
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
        {chart && <span className="shrink-0 pb-1">{chart}</span>}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              up && "text-emerald-600",
              down && "text-rose-600",
              !up && !down && "text-gray-400",
            )}
          >
            <DeltaIcon className="size-3.5" strokeWidth={2} />
            {delta > 0 ? "+" : ""}
            {delta}
            {deltaSuffix}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}

        {hint && <span className="truncate text-gray-400">{hint}</span>}
      </div>
    </div>
  );
};

export default StatCard;
