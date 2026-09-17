// Router
import { useNavigate } from "react-router-dom";

// Icons
import { ChevronRight, Paperclip, CalendarClock, FileCheck2 } from "lucide-react";

// Components
import UserAvatar from "../UserAvatar";
import DeadlineChip from "../DeadlineChip";
import TaskStatusBadge from "../TaskStatusBadge";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateTimeUz, formatDateUz } from "@/shared/utils/date.utils";

// Data
import { fullName } from "../../data/tasks.data";

/** Sarlavha ostidagi kichik belgilar: fayllar, uzaytirishlar, topshirilgan natija. */
const TaskMeta = ({ task }) => {
  const items = [];
  if (task.attachmentsCount > 0) {
    items.push({ key: "att", icon: Paperclip, text: task.attachmentsCount });
  }
  if (task.completionAttachmentsCount > 0) {
    items.push({ key: "done", icon: FileCheck2, text: task.completionAttachmentsCount });
  }
  if (task.extensionsCount > 0) {
    items.push({ key: "ext", icon: CalendarClock, text: `${task.extensionsCount}× uzaytirilgan` });
  }
  if (!items.length) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-gray-400">
      {items.map(({ key, icon: Icon, text }) => (
        <span key={key} className="inline-flex items-center gap-0.5">
          <Icon className="size-3" />
          {text}
        </span>
      ))}
    </div>
  );
};

/**
 * Topshiriqlar ro'yxati. Katta ekranda jadval, telefonda kartalar — jadval
 * telefonda gorizontal scroll bo'lib, eng muhim ustun (holat) ko'rinmay qolardi.
 * Qator butunlay bosiladi: "Batafsil" havolasini qidirish shart emas.
 *
 * @param {{ tasks: Array<object>, roles: Array<object>, dueSoonHours?: number }} props
 */
const TasksTable = ({ tasks, roles, dueSoonHours }) => {
  const navigate = useNavigate();
  const open = (task) => navigate(`/tasks/${task.id}`);

  return (
    <>
      {/* Desktop */}
      {/* Sarlavha rangi, bo'shliqlari va qator ajratgichlari — global jadval
          stilidan (styles/index.css), bu yerda ustiga yozilmaydi */}
      <div className="hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-100 md:block">
        <table className="w-full">
          <thead>
            <tr>
              <th className="!text-left">Topshiriq</th>
              <th className="!text-left">Ijrochi</th>
              <th className="!text-left">Muddat</th>
              <th className="!text-left">Holat</th>
              <th>Jarima</th>
              <th className="w-8 !px-2" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const name = fullName(task.assignee);
              return (
                <tr
                  key={task.id}
                  onClick={() => open(task)}
                  onKeyDown={(e) => e.key === "Enter" && open(task)}
                  tabIndex={0}
                  className="group cursor-pointer text-sm transition-colors hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none"
                >
                  <td className="max-w-80 px-4 py-3">
                    <p className="truncate font-medium text-gray-900 group-hover:text-blue-700">
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {formatDateUz(task.createdAt)} · {fullName(task.createdBy)}
                    </p>
                    <TaskMeta task={task} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">{name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {getRoleLabel(task.assignee?.role, roles)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="whitespace-nowrap text-gray-700">
                      {formatDateTimeUz(task.dueDate)}
                    </p>
                    <DeadlineChip
                      className="mt-1"
                      dueDate={task.dueDate}
                      status={task.status}
                      dueSoonHours={dueSoonHours}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                      {task.penaltyPoints} ball
                    </span>
                  </td>
                  <td className="pr-3">
                    <ChevronRight className="size-4 text-gray-300 group-hover:text-blue-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-2.5 md:hidden">
        {tasks.map((task) => {
          const name = fullName(task.assignee);
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => open(task)}
              className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-gray-100 active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 font-medium text-gray-900">{task.title}</p>
                <TaskStatusBadge status={task.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <UserAvatar name={name} size="xs" />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-600">{name}</span>
                <DeadlineChip
                  dueDate={task.dueDate}
                  status={task.status}
                  dueSoonHours={dueSoonHours}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>Muddat: {formatDateTimeUz(task.dueDate)}</span>
                <span className="font-semibold text-rose-600">{task.penaltyPoints} ball</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default TasksTable;
