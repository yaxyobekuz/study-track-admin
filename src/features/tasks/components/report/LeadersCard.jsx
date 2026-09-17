// Icons
import { Trophy } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { percentText } from "../../data/tasks.data";

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * Eng yaxshi ijrochilar — bajarilish foizi, keyin o'z vaqtida topshirish
 * bo'yicha (tartib serverda). Birinchi uchtasi medal bilan.
 *
 * @param {{ report: object, roles: Array<object> }} props
 */
const LeadersCard = ({ report, roles }) => (
  <ReportPanelCard
    title="Eng yaxshi ijrochilar"
    hint="Ko'p va o'z vaqtida bajarganlar"
    isEmpty={report.leaders.length === 0}
    emptyText="Hali bajarilgan ish yo'q"
    action={<Trophy className="size-5 text-amber-500" strokeWidth={1.75} />}
  >
    <ol className="space-y-2.5">
      {report.leaders.map((p, i) => (
        <li
          key={p.userId}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2",
            i === 0 ? "bg-amber-50/70 ring-1 ring-amber-100" : "hover:bg-gray-50",
          )}
        >
          <span className="w-6 text-center text-lg" aria-hidden>
            {MEDALS[i] || <span className="text-sm font-semibold text-gray-400">{i + 1}</span>}
          </span>
          <UserAvatar name={p.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
            <p className="truncate text-xs text-gray-500">
              {getRoleLabel(p.role, roles)} · {p.completed}/{p.assigned} bajarildi
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums text-emerald-600">{percentText(p.rate)}</p>
            <p className="text-[11px] text-gray-400">vaqtida: {percentText(p.onTimeRate)}</p>
          </div>
        </li>
      ))}
    </ol>
  </ReportPanelCard>
);

export default LeadersCard;
