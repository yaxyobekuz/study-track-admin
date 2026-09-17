// React
import { useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowRight, Radio } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";
import DeadlineChip from "../DeadlineChip";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

const LISTS = [
  {
    key: "overdue",
    label: "Kechikkanlar",
    empty: "Muddati o'tgan topshiriq yo'q 🎉",
    link: "/tasks?due=overdue&sort=due_asc",
    activeClass: "bg-rose-600 text-white",
  },
  {
    key: "dueSoon",
    label: "Muddati yaqin",
    empty: "Yaqin orada tugaydigan topshiriq yo'q",
    link: "/tasks?due=due_soon&sort=due_asc",
    activeClass: "bg-amber-500 text-white",
  },
  {
    key: "review",
    label: "Tekshiruv navbati",
    empty: "Tekshiruvni kutayotgan ish yo'q",
    link: "/tasks?status=pending_review&sort=oldest",
    activeClass: "bg-blue-600 text-white",
  },
];

/**
 * "Hozir nima qilish kerak" — davrdan QAT'I NAZAR jonli ro'yxatlar.
 * Hisobot faqat o'tmishni ko'rsatsa, admin undan harakatga o'ta olmasdi;
 * bu karta har qatorni to'g'ridan-to'g'ri topshiriqqa ulaydi.
 *
 * @param {{ report: object, className?: string }} props
 */
const LiveListsCard = ({ report, className = "" }) => {
  const { live } = report;
  const [active, setActive] = useState(
    live.counts.overdue > 0 ? "overdue" : live.counts.review > 0 ? "review" : "dueSoon",
  );
  const current = LISTS.find((l) => l.key === active);
  const rows = live[active];
  const count = live.counts[active];

  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-gray-900">
            <Radio className="size-4 text-rose-500" />
            Hozirgi holat
          </h3>
          <p className="text-xs text-gray-500">Davrga bog'liq emas — aynan hozir</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto hidden-scrollbar">
        {LISTS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setActive(l.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active === l.key ? l.activeClass : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {l.label}
            <span className="ml-1.5 tabular-nums opacity-80">{live.counts[l.key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{current.empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-50">
          {rows.map((task) => (
            <li key={task.id}>
              <Link
                to={`/tasks/${task.id}`}
                className="flex items-center gap-3 rounded-lg px-1 py-2.5 hover:bg-gray-50"
              >
                <UserAvatar name={task.assignee?.name || "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {task.assignee?.name || "—"} ·{" "}
                    {active === "review"
                      ? `topshirdi: ${formatDateTimeUz(task.submittedAt)}`
                      : formatDateTimeUz(task.dueDate)}
                  </p>
                </div>
                {active !== "review" && (
                  <DeadlineChip
                    dueDate={task.dueDate}
                    status={task.status}
                    dueSoonHours={live.dueSoonHours}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {count > rows.length && (
        <Link
          to={current.link}
          className="mt-2 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          Hammasini ko'rish ({count})
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
};

export default LiveListsCard;
