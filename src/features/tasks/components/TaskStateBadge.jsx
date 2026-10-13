// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TASK_STATE_META, resolveTimeState } from "../data/tasks.data";

/**
 * VAQT HOLATI BELGISI — ✓ bajarildi, ✗ bajarilmadi, "hozir bajarilish
 * vaqti" va h.k.
 *
 * ⚠️ Holat SAQLANMAYDI, hisoblanadi (`taskWindow.helpers.js`). Server
 * `timeState` ni yuboradi, lekin ekran ochiq turganda vaqt o'tib ketishi
 * mumkin — shuning uchun belgi har renderda QAYTA hisoblanadi va server
 * qiymati faqat zaxira bo'lib qoladi.
 *
 * @param {{ task: object, size?: "sm"|"md", className?: string }} props
 */
const TaskStateBadge = ({ task, size = "md", className = "" }) => {
  const state = resolveTimeState(task) || task?.timeState || "open";
  const meta = TASK_STATE_META[state] || TASK_STATE_META.open;
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        meta.chip,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={2} />
      {size === "sm" ? meta.short : meta.label}
    </span>
  );
};

export default TaskStateBadge;
