// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { NOTICE_TONES } from "../data/scheduleSync.data";

/**
 * Rangli ogohlantirish kartasi (panelda alohida Alert komponenti yo'q —
 * ScheduleForm dagi kabi chegarali `Card`).
 *
 * @param {object} props
 * @param {"info"|"success"|"warning"|"danger"} [props.tone]
 * @param {string} props.title
 * @param {React.ReactNode} [props.children] - izoh / ro'yxat
 * @param {React.ReactNode} [props.action] - o'ngdagi tugma
 * @param {string} [props.className]
 */
const Notice = ({ tone = "info", title, children, action = null, className = "" }) => {
  const { card, icon, Icon } = NOTICE_TONES[tone] || NOTICE_TONES.info;

  return (
    <Card
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-3 xs:flex-row xs:items-start xs:justify-between",
        card,
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} strokeWidth={1.75} />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {children && (
            <div className="text-xs leading-relaxed text-gray-700">{children}</div>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </Card>
  );
};

export default Notice;
