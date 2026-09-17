// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowUpRight, ListTodo } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { fullName, getRateBarClass, percentText } from "../../data/tasks.data";

/**
 * Ijrochi kartasi: kim, qaysi lavozim va umumiy intizomi (barcha
 * topshiriqlari bo'yicha). "Bu odam odatda ishni bajaradimi?" degan
 * savolga ko'rib chiqish paytida javob beradi.
 *
 * @param {{ task: object, roles: Array<object> }} props
 */
const AssigneeCard = ({ task, roles }) => {
  const user = task.assignee;
  const stats = task.assigneeStats;
  const name = fullName(user);

  const cells = stats
    ? [
        { key: "total", label: "Jami", value: stats.total },
        { key: "completed", label: "Bajargan", value: stats.completed, className: "text-emerald-600" },
        { key: "active", label: "Jarayonda", value: stats.active },
        {
          key: "overdue",
          label: "Kechikkan",
          value: stats.overdue,
          className: stats.overdue > 0 ? "text-rose-600" : "",
        },
      ]
    : [];

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Ijrochi</p>

      <div className="mt-3 flex items-center gap-3">
        <UserAvatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{name}</p>
          <p className="truncate text-sm text-gray-500">{getRoleLabel(user?.role, roles)}</p>
        </div>
        {user?.id && (
          <Link
            to={`/users/${user.id}`}
            aria-label="Profilni ochish"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>

      {stats && (
        <>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {cells.map((c) => (
              <div key={c.key} className="rounded-xl bg-gray-50 px-1 py-2 text-center">
                <p className={cn("text-base font-bold tabular-nums text-gray-900", c.className)}>{c.value}</p>
                <p className="text-[10px] text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Umumiy bajarilish</span>
              <b className="text-gray-900">{percentText(stats.completionRate)}</b>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-gray-100">
              {stats.completionRate != null && (
                <div
                  className={cn("h-2 rounded-full", getRateBarClass(stats.completionRate))}
                  style={{ width: `${Math.max(stats.completionRate, 2)}%` }}
                />
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-500">Jami jarima bali</span>
        <span className="font-semibold text-rose-600">{user?.penaltyPoints ?? "—"}</span>
      </div>

      {user?.id && (
        <Link
          to={`/tasks?assigneeId=${user.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <ListTodo className="size-3.5" />
          Barcha topshiriqlari
        </Link>
      )}
    </div>
  );
};

export default AssigneeCard;
