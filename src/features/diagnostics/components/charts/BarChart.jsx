// Utils
import { cn } from "@/shared/utils/cn";

/**
 * USTUNLI DIAGRAMMA — bitta ustunni ajratib ko'rsatish imkoni bilan.
 *
 * ⚠️ NOL QIYMAT HAM KO'RINADI (`Math.max(4, pct)`): butunlay yo'qolgan
 * ustun "ma'lumot yo'q" bilan "nol natija" ni bir xil ko'rsatardi.
 *
 * @param {{label:string, value:number, color?:string}[]} props.data
 */
const BarChart = ({
  data = [],
  height = 200,
  max,
  suffix = "",
  activeIndex,
  className = "",
  onSelect,
}) => {
  if (!data.length) return null;
  const peak = max ?? Math.max(...data.map((d) => d.value ?? 0), 1);

  return (
    <div
      className={cn("flex items-end justify-between gap-2 sm:gap-3", className)}
      style={{ height }}
    >
      {data.map((d, i) => {
        const pct = ((d.value ?? 0) / peak) * 100;
        const dim = activeIndex != null && activeIndex !== i;
        const color = d.color ?? "#2563eb";

        return (
          <div
            key={`${d.label}-${i}`}
            className={cn(
              "group flex h-full flex-1 flex-col items-center justify-end gap-2",
              onSelect && "cursor-pointer",
            )}
            onClick={onSelect ? () => onSelect(i) : undefined}
            title={`${d.label}: ${d.value ?? 0}${suffix}`}
          >
            <span className="text-[11px] font-semibold tabular-nums text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
              {d.value ?? 0}
              {suffix}
            </span>

            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[26px] rounded-full transition-[height] duration-700 ease-out motion-reduce:transition-none"
                style={{
                  height: `${Math.max(4, pct)}%`,
                  backgroundColor: color,
                  opacity: dim ? 0.28 : 1,
                }}
              />
            </div>

            <span
              className={cn(
                "w-full truncate text-center text-[11px] font-medium",
                activeIndex === i ? "text-gray-900" : "text-gray-500",
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
