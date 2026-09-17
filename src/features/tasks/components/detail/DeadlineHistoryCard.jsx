// Icons
import { ArrowDown, CalendarClock } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { fullName } from "../../data/tasks.data";

/**
 * Muddat o'zgarishlari — eski muddat ustidan chizilgan, yangisi ostida.
 * @param {{ entries: Array<object> }} props
 */
const DeadlineHistoryCard = ({ entries = [] }) => {
  if (!entries.length) return null;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
        <CalendarClock className="size-4 text-gray-400" />
        Muddat tarixi
      </h3>

      <ul className="mt-3 space-y-3">
        {[...entries].reverse().map((entry) => (
          <li key={entry.id} className="rounded-xl bg-gray-50 p-3 text-xs">
            <p className="text-gray-400 line-through">{formatDateTimeUz(entry.oldDueDate)}</p>
            <ArrowDown className="my-0.5 size-3 text-gray-300" />
            <p className="font-semibold text-gray-900">{formatDateTimeUz(entry.newDueDate)}</p>
            {entry.reason && <p className="mt-1.5 text-gray-600">{entry.reason}</p>}
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-gray-400">
              <span>
                {fullName(entry.changedBy)} · {formatDateTimeUz(entry.changedAt)}
              </span>
              {entry.withPenalty && (
                <span className="font-medium text-rose-600">+{entry.penaltyPoints} ball jarima</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeadlineHistoryCard;
