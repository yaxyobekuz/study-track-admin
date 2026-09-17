// Router
import { Link } from "react-router-dom";

// Icons
import { PartyPopper, TriangleAlert } from "lucide-react";

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
 * Yordam kerak bo'lganlar — kechikkan ishi bor yoki yarmidan kamini
 * bajarganlar. Bo'sh bo'lsa bu YAXSHI xabar, shuning uchun bo'sh holat
 * quvnoq ko'rinadi. Har qator o'sha ijrochining topshiriqlariga olib boradi.
 *
 * @param {{ report: object, roles: Array<object> }} props
 */
const AttentionCard = ({ report, roles }) => {
  const rows = report.attention;

  return (
    <ReportPanelCard
      title="E'tibor kerak"
      hint="Kechikayotgan yoki orqada qolayotganlar"
      action={<TriangleAlert className="size-5 text-rose-500" strokeWidth={1.75} />}
    >
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <PartyPopper className="size-9 text-emerald-500" strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-800">Hamma ishlar joyida!</p>
          <p className="text-xs text-gray-500">Kechikayotgan ijrochi yo'q</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.userId}>
              <Link
                to={`/tasks?assigneeId=${p.userId}`}
                className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-gray-50"
              >
                <UserAvatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-700">
                      {percentText(p.rate)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {getRoleLabel(p.role, roles)}
                    {p.overdue > 0 && (
                      <span className="text-rose-600"> · {p.overdue} ta kechikkan</span>
                    )}
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                    {p.rate != null && (
                      <div
                        className={cn("h-1.5 rounded-full", getRateBarClass(p.rate))}
                        style={{ width: `${Math.max(p.rate, 2)}%` }}
                      />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ReportPanelCard>
  );
};

export default AttentionCard;
