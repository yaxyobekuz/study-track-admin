// Icons
import { Lightbulb } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, buildInsights } from "../../data/tasks.data";

/**
 * "Qisqacha xulosa" — raqamlarni oddiy gaplarga aylantiradi. Grafik o'qishni
 * bilmaydigan odam ham shu kartaning o'zidan holatni tushunishi kerak.
 *
 * @param {{ report: object, className?: string }} props
 */
const InsightsCard = ({ report, className = "" }) => {
  const items = buildInsights(report);

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-white p-4 ring-1 ring-indigo-100 xs:p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Lightbulb className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-semibold text-gray-900">Qisqacha xulosa</h3>
          <p className="text-xs text-gray-500">Raqamlar oddiy tilda</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {items.map(({ key, icon: Icon, tone, text }) => (
          <li key={key} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                TONES[tone].chip,
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <p className="text-sm leading-relaxed text-gray-700">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsCard;
