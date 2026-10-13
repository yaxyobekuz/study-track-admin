// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BellRing, CalendarClock, Pause, Play, Plus, Repeat, Trash2, Users } from "lucide-react";

// Queries
import {
  taskSchedulesQueries,
  useDeleteTaskSchedule,
  useResumeTaskSchedule,
} from "../queries/taskSchedules.queries";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import UserAvatar from "../components/UserAvatar";
import CreateTaskModal from "../components/CreateTaskModal";
import StopScheduleModal from "../components/schedules/StopScheduleModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import { SCHEDULE_STATUS_OPTIONS, fullName } from "../data/tasks.data";

/**
 * DOIMIY TOPSHIRIQLAR — qoidalar ro'yxati.
 *
 * ⚠️ Bu yerdagi qatorlar TOPSHIRIQ EMAS, QOIDA. Haqiqiy topshiriqlarni
 * ulardan server vaqtidan oldin yozadi (`leadDays`), ro'yxatda esa
 * "keyingi topshiriq qachon yoziladi" ko'rinib turadi.
 *
 * ⚠️ Qoida O'CHIRILMAYDI — TO'XTATILADI (sabab bilan). O'chirish faqat
 * hali birorta topshiriq yozilmagan, xato kiritilgan qoida uchun ochiq.
 */
const TaskSchedulesPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim());

  const { data, isLoading } = useQuery(
    taskSchedulesQueries.list({
      page,
      ...(status !== "all" && { status }),
      ...(search && { search }),
    }),
  );

  const { mutate: resumeSchedule } = useResumeTaskSchedule();
  const { mutate: deleteSchedule } = useDeleteTaskSchedule();

  const schedules = data?.data || [];
  const pagination = data?.pagination;
  const canCreate = can("tasks.create") || can("tasks.team");

  const handleResume = (schedule) =>
    resumeSchedule(schedule.id, {
      onSuccess: () => toast.success("Doimiy topshiriq qayta yoqildi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  const handleDelete = (schedule) => {
    if (!window.confirm(`"${schedule.title}" qoidasi o'chirilsinmi?`)) return;
    deleteSchedule(schedule.id, {
      onSuccess: () => toast.success("Doimiy topshiriq o'chirildi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Filtrlar */}
      <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <InputSearch
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Sarlavha bo'yicha qidirish..."
            className="min-w-56 flex-1"
          />
          <Select
            value={status}
            options={SCHEDULE_STATUS_OPTIONS}
            triggerClassName="w-44"
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          {canCreate && (
            <Button className="ml-auto" onClick={() => openModal("createTask")}>
              <Plus />
              Doimiy topshiriq
            </Button>
          )}
        </div>
        {pagination && (
          <p className="mt-2.5 px-1 text-xs text-gray-400">Jami: {pagination.total} ta qoida</p>
        )}
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            icon={Repeat}
            title="Doimiy topshiriq yo'q"
            description="Takrorlanadigan ish — masalan har dushanba jurnalni to'ldirish — shu yerda qoida bo'lib turadi va topshiriqlar undan avtomatik yoziladi."
            action={
              canCreate && (
                <Button onClick={() => openModal("createTask")}>
                  <Plus />
                  Doimiy topshiriq
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={cn(
                "rounded-2xl bg-white p-4 ring-1",
                schedule.isActive ? "ring-gray-100" : "bg-gray-50/60 ring-gray-200",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{schedule.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                        schedule.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-gray-100 text-gray-600 ring-gray-200",
                      )}
                    >
                      {schedule.isActive ? "Faol" : "To'xtatilgan"}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-indigo-700">
                    <Repeat className="size-3.5" />
                    {schedule.ruleLabel}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {schedule.assigneeUsers?.length || schedule.assignees?.length || 0} ijrochi
                      {schedule.assigneeUsers?.length > 0 &&
                        `: ${schedule.assigneeUsers.slice(0, 3).map(fullName).join(", ")}`}
                      {schedule.assigneeUsers?.length > 3 &&
                        ` +${schedule.assigneeUsers.length - 3}`}
                    </span>

                    {schedule.isActive && schedule.nextOccurrence && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        Keyingisi: {formatDateUz(schedule.nextOccurrence, { utc: true })}
                      </span>
                    )}

                    {schedule.isActive && schedule.nextGenerationDate && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <BellRing className="size-3.5" />
                        Yoziladi: {formatDateUz(schedule.nextGenerationDate, { utc: true })}
                      </span>
                    )}

                    <span>{schedule.generatedCount || 0} ta topshiriq yozilgan</span>
                  </div>

                  {!schedule.isActive && schedule.stopReason && (
                    <p className="mt-2 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-600">
                      To&apos;xtatildi: {schedule.stopReason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {schedule.createdByUser && (
                    <UserAvatar name={fullName(schedule.createdByUser)} size="sm" />
                  )}
                  {canCreate &&
                    (schedule.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal("stopTaskSchedule", { schedule })}
                      >
                        <Pause />
                        To&apos;xtatish
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleResume(schedule)}>
                        <Play />
                        Qayta yoqish
                      </Button>
                    ))}
                  {canCreate && (schedule.generatedCount || 0) === 0 && (
                    <button
                      type="button"
                      aria-label="O'chirish"
                      onClick={() => handleDelete(schedule)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <CreateTaskModal />
      <StopScheduleModal />
    </div>
  );
};

export default TaskSchedulesPage;
