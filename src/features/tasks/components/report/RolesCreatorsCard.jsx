// Components
import UserAvatar from "../UserAvatar";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { getRateBarClass, percentText } from "../../data/tasks.data";

/**
 * Ikki kichik kesim bitta kartada: lavozimlar bo'yicha bajarilish va
 * topshiriqni kim ko'p beradi. Ikkalasi ham 3–6 qatorlik ro'yxat — alohida
 * karta bo'lsa sahifa bo'sh joyga to'lib ketardi.
 *
 * @param {{ report: object, roles: Array<object>, className?: string }} props
 */
const RolesCreatorsCard = ({ report, roles, className = "" }) => {
  const maxAssigned = Math.max(1, ...report.byRole.map((r) => r.assigned));

  return (
    <ReportPanelCard
      title="Lavozimlar kesimida"
      hint="Qaysi lavozimda ishlar yaxshiroq bajariladi"
      className={className}
      isEmpty={report.byRole.length === 0}
    >
      <div className="space-y-3">
        {report.byRole.map((r) => (
          <div key={r.role}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-800">
                {getRoleLabel(r.role, roles)}
                <span className="ml-1 text-xs font-normal text-gray-400">· {r.people} kishi</span>
              </span>
              <span className="text-xs text-gray-500">
                {r.completed}/{r.assigned} ·{" "}
                <b className="text-gray-900">{percentText(r.rate)}</b>
              </span>
            </div>
            {/* Chiziq uzunligi — hajm, rangi — bajarilish sifati */}
            <div className="mt-1.5 h-2 rounded-full bg-gray-100">
              <div
                className={cn("h-2 rounded-full", getRateBarClass(r.rate))}
                style={{ width: `${Math.max((r.assigned / maxAssigned) * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {report.creators.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500">Kim ko'p topshiriq beradi</p>
          <ul className="mt-2.5 space-y-2">
            {report.creators.map((c) => (
              <li key={c.userId} className="flex items-center gap-2.5">
                <UserAvatar name={c.name} size="xs" />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{c.name}</span>
                <span className="text-xs tabular-nums text-gray-500">
                  {c.created} ta · {percentText(c.rate)} bajarildi
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ReportPanelCard>
  );
};

export default RolesCreatorsCard;
