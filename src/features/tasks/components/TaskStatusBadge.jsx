// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  taskStatusIcons,
  taskStatusLabels,
  taskStatusColors,
} from "../data/tasks.data";

/**
 * Topshiriq holati — rang + ikonka + matn. Holat hech qachon faqat rang
 * bilan berilmaydi (rang ko'rligi va chop etish uchun).
 *
 * @param {{ status: string, size?: "sm"|"md", className?: string }} props
 */
const TaskStatusBadge = ({ status, size = "sm", className = "" }) => {
  const Icon = taskStatusIcons[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium ring-1",
        size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
        taskStatusColors[status] || "bg-gray-100 text-gray-600 ring-gray-200",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={size === "md" ? "size-3.5" : "size-3"}
          strokeWidth={2}
        />
      )}
      {taskStatusLabels[status] || status}
    </span>
  );
};

export default TaskStatusBadge;
