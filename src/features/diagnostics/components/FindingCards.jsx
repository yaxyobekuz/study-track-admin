// Icons
import { ShieldCheck, Target, TrendingUp, TrendingDown } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "3 TA ASOSIY TOPILMA" — kuchli tomon, asosiy to'siq va o'zgarish.
 *
 * ⚠️ MATN SERVERDAN (`result.findings`) — o'quvchi paneli bilan AYNI
 * manbadan. Xodim "o'quvchi nimani ko'ryapti" degan savolga javob
 * olishi kerak; mijozda ikkinchi hisob yozilsa, ota-onaga tushuntirishda
 * ikki xil xulosa paydo bo'lardi.
 */

const STYLES = {
  strength: { icon: ShieldCheck, box: "bg-emerald-50 text-emerald-600" },
  blocker: { icon: Target, box: "bg-rose-50 text-rose-600" },
  change: { icon: TrendingUp, box: "bg-blue-50 text-blue-600" },
};

const FindingCards = ({ findings = [] }) => {
  if (!findings.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {findings.map((finding) => {
        const style = STYLES[finding.kind] || STYLES.change;
        const negative = finding.kind === "change" && finding.positive === false;
        const Icon = negative ? TrendingDown : style.icon;

        return (
          <div key={finding.kind} className="flex flex-col rounded-2xl bg-white p-4 xs:p-5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  negative ? "bg-amber-50 text-amber-600" : style.box,
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {finding.label}
              </span>
            </div>

            <p className="mt-3 font-semibold text-gray-900">{finding.title}</p>
            <p className="mt-1 text-sm text-gray-500">{finding.detail}</p>

            {finding.metric && (
              <p className="mt-auto pt-3 text-lg font-bold tabular-nums text-gray-900">
                {finding.metric}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FindingCards;
