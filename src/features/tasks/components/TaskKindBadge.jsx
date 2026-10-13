// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TASK_KIND_META } from "../data/tasks.data";

/**
 * TOPSHIRIQ TURI BELGISI — "Asosiy" yoki "Qo'shimcha".
 *
 * @param {{ kind?: string, withIcon?: boolean, className?: string }} props
 */
const TaskKindBadge = ({ kind = "main", withIcon = true, className = "" }) => {
  const meta = TASK_KIND_META[kind] || TASK_KIND_META.main;
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        meta.chip,
        className,
      )}
    >
      {withIcon && <Icon className="size-3" strokeWidth={2} />}
      {meta.label}
    </span>
  );
};

export default TaskKindBadge;
