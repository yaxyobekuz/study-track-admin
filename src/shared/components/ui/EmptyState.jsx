// Icons
import { Inbox } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Bo'sh holat — "nima yo'q" va "endi nima qilish kerak" bir joyda.
 *
 * Sahifalarda "Ma'lumot topilmadi" matni turlicha yozilib ketmasligi va
 * foydalanuvchi keyingi qadamni topa olishi uchun.
 *
 * @param {object} props
 * @param {React.ComponentType} [props.icon] - lucide komponenti
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action] - tugma yoki havola
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description = "",
  action = null,
  className = "",
}) => (
  <div className={cn("px-6 py-12 text-center", className)}>
    <Icon className="mx-auto size-9 text-gray-300" strokeWidth={1.5} />

    <p className="mt-3 font-medium text-gray-900">{title}</p>

    {description && (
      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    )}

    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
