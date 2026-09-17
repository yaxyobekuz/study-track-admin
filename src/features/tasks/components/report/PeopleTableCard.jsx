// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Components
import UserAvatar from "../UserAvatar";
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { durationText, getRateBarClass, percentText } from "../../data/tasks.data";

const SORTS = [
  { key: "assigned", label: "Ko'p berilgan" },
  { key: "rate", label: "Bajarilish" },
  { key: "overdue", label: "Kechikish" },
];

const INITIAL_ROWS = 8;

/**
 * Har bir ijrochi bo'yicha to'liq jadval — diagrammalarning "jadval
 * ko'rinishi". Qatorga bosilsa o'sha odamning topshiriqlari ochiladi.
 *
 * @param {{ report: object, roles: Array<object>, className?: string }} props
 */
const PeopleTableCard = ({ report, roles, className = "" }) => {
  const navigate = useNavigate();
  const [sort, setSort] = useState("assigned");
  const [expanded, setExpanded] = useState(false);

  const sorted = [...report.people].sort((a, b) => {
    if (sort === "rate") return (b.rate ?? -1) - (a.rate ?? -1);
    if (sort === "overdue") return b.overdue - a.overdue;
    return b.assigned - a.assigned;
  });
  const rows = expanded ? sorted : sorted.slice(0, INITIAL_ROWS);

  return (
    <ReportPanelCard
      title="Har bir ijrochi"
      hint="Kim nechta ish oldi va qanchasini bajardi"
      className={className}
      isEmpty={report.people.length === 0}
      emptyText="Bu davrda topshiriq berilmagan"
      action={
        <div className="flex gap-1 rounded-full bg-gray-100 p-0.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                sort === s.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full !min-w-[720px] text-sm">
          <thead>
            <tr>
              <th className="!px-3 !text-left">Ijrochi</th>
              <th className="!px-3">Berildi</th>
              <th className="!px-3">Bajardi</th>
              <th className="!px-3">Kechikkan</th>
              <th className="w-40 !px-3 !text-left">Bajarilish</th>
              <th className="!px-3">Vaqtida</th>
              <th className="!px-3">O'rtacha vaqt</th>
              <th className="!px-3">Jarima</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.userId}
                onClick={() => navigate(`/tasks?assigneeId=${p.userId}`)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={p.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{p.name}</p>
                      <p className="truncate text-xs text-gray-400">{getRoleLabel(p.role, roles)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 text-center tabular-nums">{p.assigned}</td>
                <td className="px-2 text-center font-medium tabular-nums text-emerald-600">{p.completed}</td>
                <td className={cn("px-2 text-center tabular-nums", p.overdue > 0 ? "font-semibold text-rose-600" : "text-gray-400")}>
                  {p.overdue}
                </td>
                <td className="px-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                      {p.rate != null && (
                        <div
                          className={cn("h-1.5 rounded-full", getRateBarClass(p.rate))}
                          style={{ width: `${Math.max(p.rate, 2)}%` }}
                        />
                      )}
                    </div>
                    <span className="w-11 text-right text-xs font-semibold tabular-nums text-gray-700">
                      {percentText(p.rate)}
                    </span>
                  </div>
                </td>
                <td className="px-2 text-center text-xs tabular-nums text-gray-600">{percentText(p.onTimeRate)}</td>
                <td className="px-2 text-center text-xs text-gray-600">{durationText(p.avgCompletionMinutes)}</td>
                <td className="px-2 text-center text-xs tabular-nums">
                  {p.penaltyPoints > 0 ? (
                    <span className="font-semibold text-rose-600">{p.penaltyPoints} ball</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > INITIAL_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-lg py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          {expanded ? "Qisqartirish" : `Yana ${sorted.length - INITIAL_ROWS} kishini ko'rsatish`}
        </button>
      )}
    </ReportPanelCard>
  );
};

export default PeopleTableCard;
