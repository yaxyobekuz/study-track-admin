// Icons
import { History } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";
import TaskStatusBadge from "../TaskStatusBadge";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  TONES,
  fullName,
  taskStatusIcons,
  TIMELINE_KIND_META,
} from "../../data/tasks.data";

// Holat yozuvining nuqta rangi
const STATUS_TONE = {
  pending: "blue",
  extended: "blue",
  pending_rejected: "amber",
  pending_review: "amber",
  completed: "green",
  stopped: "slate",
};

/**
 * Topshiriq tarixi — yangisi tepada. Yozuv turi (`kind`) belgini tanlaydi:
 * holat o'zgarishi holat nishoni bilan, tahrir — o'zgargan maydonlar
 * ro'yxati bilan, jarima va muddat — o'z belgisi bilan. Ilgari hammasi
 * "status" bo'lib, tahrir ham holat o'zgargandek ko'rinardi.
 *
 * @param {{ entries: Array<object> }} props
 */
const TaskTimeline = ({ entries = [] }) => {
  const list = [...entries].reverse();

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
        <History className="size-4 text-gray-400" />
        Tarix
        <span className="text-xs font-normal text-gray-400">{entries.length} ta yozuv</span>
      </h3>

      <ol className="relative mt-4 space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-gray-100">
        {list.map((entry) => {
          const kind = entry.kind || "status";
          const isFirst = entry.position === 0;
          const meta =
            kind === "status"
              ? isFirst
                ? TIMELINE_KIND_META.created
                : { icon: taskStatusIcons[entry.status], tone: STATUS_TONE[entry.status] || "slate" }
              : TIMELINE_KIND_META[kind] || TIMELINE_KIND_META.edit;
          const Icon = meta.icon;
          const author = entry.changedBy ? fullName(entry.changedBy) : "Tizim";

          return (
            <li key={entry.id} className="relative flex gap-3">
              <span
                className={cn(
                  "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                  TONES[meta.tone].chip,
                )}
              >
                {Icon && <Icon className="size-4" strokeWidth={2} />}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {entry.changedBy ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-800">
                      <UserAvatar name={author} size="xs" />
                      {author}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-gray-800">Tizim</span>
                  )}
                  {kind === "status" && !isFirst && <TaskStatusBadge status={entry.status} />}
                  {kind !== "status" && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", TONES[meta.tone].soft)}>
                      {meta.label}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDateTimeUz(entry.changedAt)}</span>
                </div>

                {kind === "edit" && Array.isArray(entry.meta) && entry.meta.length > 0 ? (
                  <ul className="mt-1.5 space-y-1 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {entry.meta.map((change) => (
                      <li key={change.field}>
                        <span className="text-gray-500">{change.label}:</span>{" "}
                        {change.from != null && change.to != null ? (
                          <>
                            <span className="text-gray-400 line-through">{change.from}</span>
                            {" → "}
                            <span className="font-medium text-gray-800">{change.to}</span>
                          </>
                        ) : (
                          <span className="text-gray-700">o'zgartirildi</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  entry.reason && (
                    <p className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {entry.reason}
                    </p>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default TaskTimeline;
