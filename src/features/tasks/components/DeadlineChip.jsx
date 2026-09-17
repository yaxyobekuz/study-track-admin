// Icons
import { Clock } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, getDeadlineInfo } from "../data/tasks.data";

/**
 * Muddatga nisbatan jonli yorliq ("2 kun qoldi" / "3 soat kechikdi").
 * Yakunlangan/to'xtatilgan topshiriqda hech narsa chizilmaydi.
 *
 * @param {{ dueDate: string, status: string, dueSoonHours?: number, className?: string }} props
 */
const DeadlineChip = ({ dueDate, status, dueSoonHours, className = "" }) => {
  const info = getDeadlineInfo(dueDate, status, dueSoonHours);
  if (!info) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONES[info.tone].soft,
        className,
      )}
    >
      <Clock className="size-3" strokeWidth={2} />
      {info.text}
    </span>
  );
};

export default DeadlineChip;
