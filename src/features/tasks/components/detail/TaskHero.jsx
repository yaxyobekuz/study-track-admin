// Icons
import { Ban, CalendarClock, Check, RotateCcw, ShieldAlert, UserRound } from "lucide-react";

// Components
import DeadlineChip from "../DeadlineChip";
import TaskStatusBadge from "../TaskStatusBadge";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { TASK_STEPS, fullName, getStepIndex } from "../../data/tasks.data";

/**
 * Topshiriq qadamlari: Berildi → Bajarilmoqda → Tekshiruvda → Yakunlandi.
 * To'xtatilgan topshiriqda chiziq kulrang va o'rniga izoh chiqadi.
 */
const Stepper = ({ status }) => {
  const current = getStepIndex(status);
  const stopped = status === "stopped";

  return (
    <ol className="flex items-center">
      {TASK_STEPS.map((step, i) => {
        const done = !stopped && (i < current || (i === current && status === "completed"));
        const active = !stopped && i === current && status !== "completed";
        return (
          <li key={step.key} className={cn("flex items-center", i < TASK_STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-4 transition-colors",
                  done && "bg-emerald-500 text-white ring-emerald-50",
                  active && "bg-blue-600 text-white ring-blue-100",
                  !done && !active && "bg-gray-100 text-gray-400 ring-white",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-medium",
                  active ? "text-blue-700" : done ? "text-emerald-700" : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < TASK_STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-2 mb-5 h-0.5 flex-1 rounded-full",
                  !stopped && i < current ? "bg-emerald-400" : "bg-gray-100",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

/**
 * Detal sahifaning boshi: holat, sarlavha, kim bergan, qadamlar va uchta
 * asosiy raqam (muddat, jarima, uzaytirishlar). Holatga xos ogohlantirish
 * (qaytarilgan / to'xtatilgan / jarima yozilgan) shu yerda — foydalanuvchi
 * uni pastdagi tarixdan qidirmasligi kerak.
 *
 * @param {{ task: object, dueSoonHours?: number }} props
 */
const TaskHero = ({ task, dueSoonHours }) => {
  const lastReason = [...(task.statusHistory || [])]
    .reverse()
    .find((h) => (h.kind || "status") === "status" && h.status === task.status)?.reason;

  const isOverdue =
    !["completed", "stopped", "pending_review"].includes(task.status) &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-white p-4 xs:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={task.status} size="md" />
          <DeadlineChip dueDate={task.dueDate} status={task.status} dueSoonHours={dueSoonHours} />
        </div>

        <h1 className="mt-3 break-words text-xl font-bold leading-snug text-gray-900 xs:text-2xl">
          {task.title}
        </h1>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <UserRound className="size-3.5" />
            {fullName(task.createdBy)} berdi
          </span>
          <span>{formatDateTimeUz(task.createdAt)}</span>
        </p>

        <div className="mt-6 max-w-xl">
          <Stepper status={task.status} />
        </div>
      </div>

      {/* Holatga xos izoh */}
      {task.status === "pending_rejected" && lastReason && (
        <div className="flex items-start gap-2.5 border-t border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800 xs:px-6">
          <RotateCcw className="mt-0.5 size-4 shrink-0" />
          <p>
            <b>Qayta ishlashga qaytarilgan:</b> {lastReason}
          </p>
        </div>
      )}
      {task.status === "stopped" && lastReason && (
        <div className="flex items-start gap-2.5 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 xs:px-6">
          <Ban className="mt-0.5 size-4 shrink-0" />
          <p>
            <b>To'xtatilgan:</b> {lastReason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 divide-y divide-gray-100 border-t border-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5 xs:px-6">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarClock className="size-3.5" />
            Ijro muddati
          </p>
          <p className={cn("mt-1 font-semibold", isOverdue ? "text-rose-600" : "text-gray-900")}>
            {formatDateTimeUz(task.dueDate)}
          </p>
        </div>
        <div className="px-4 py-3.5 xs:px-6">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldAlert className="size-3.5" />
            Kechiksa jarima
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {task.penaltyPoints} ball
            {task.penaltyRef && (
              <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                {task.penaltyRef.points} ball yozilgan
              </span>
            )}
          </p>
        </div>
        <div className="px-4 py-3.5 xs:px-6">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <RotateCcw className="size-3.5" />
            Muddat uzaytirilgan
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {task.deadlineHistory?.length ? `${task.deadlineHistory.length} marta` : "Yo'q"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskHero;
