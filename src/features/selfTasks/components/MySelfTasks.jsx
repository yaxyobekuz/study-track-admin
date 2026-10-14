// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CircleCheckBig, CircleX, Hourglass, ListChecks, Plus } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useNow from "@/features/myTasks/hooks/useNow";

// Queries
import { selfTasksQueries } from "@/features/tasks/queries/selfTasks.queries";
import { useDeleteSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import SelfTaskCard from "./SelfTaskCard";
import SelfRulesList from "./SelfRulesList";
import CreateSelfTaskModal from "./CreateSelfTaskModal";
import EditSelfTaskModal from "./EditSelfTaskModal";
import SelfTaskStopModal from "./SelfTaskStopModal";
import SelfTaskCompleteModal from "./SelfTaskCompleteModal";
import SelfTaskDeadlineModal from "./SelfTaskDeadlineModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Toast
import { toast } from "sonner";

/** Server `state` parametri bilan AYNI kalitlar. ⚠️ "Tekshiruvda" YO'Q:
 *  shaxsiy oqimda bu holat umuman bo'lmaydi (xodim topshirgani darhol
 *  yakunlanadi), ya'ni kesim har doim bo'sh ro'yxat qaytarardi. */
const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "active", label: "Hozir vaqti" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "missed", label: "Bajarilmadi" },
  { value: "done", label: "Bajarildi" },
  { value: "stopped", label: "To'xtatilgan" },
];

const STAT_CARDS = [
  { key: "inProgress", label: "Jarayonda", icon: Hourglass, tone: "text-blue-600" },
  { key: "missed", label: "Bajarilmadi", icon: CircleX, tone: "text-rose-600" },
  { key: "completed", label: "Bajarildi", icon: CircleCheckBig, tone: "text-emerald-600" },
  { key: "total", label: "Jami", icon: ListChecks, tone: "text-gray-700" },
];

/**
 * O'ZIM BELGILAGAN ISHLAR — xodimning o'z ekrani.
 *
 * ⚠️ "MENGA BERILGAN" DAN ALOHIDA TAB va bu ataylab: ikkalasi boshqa
 * savolga javob beradi — "menga kim nima berdi" va "men o'zimga nima
 * belgiladim". Bir ro'yxatda aralashsa, jarimasiz shaxsiy reja rahbar
 * bergan ish bilan bir xil ko'rinib, "buni kim so'radi" degan savol
 * javobsiz qolardi.
 *
 * ⚠️ IKKI BO'LIM: yuqorida ISHLAR (topshiriqlar), pastda DOIMIY ISHLAR
 * (qoidalar). Qoida — topshiriq emas: undan topshiriqlar avtomat
 * yoziladi, shuning uchun u yakunlanmaydi va alohida turadi.
 */
const MySelfTasks = () => {
  const now = useNow();
  const { openModal } = useModal();
  const { mutate: deleteTask } = useDeleteSelfTask();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery(selfTasksQueries.my({ page, state: filter }));
  const { data: stats } = useQuery(selfTasksQueries.myStats());

  const tasks = data?.data || [];
  const pagination = data?.pagination;
  const rules = data?.submissionRules;

  const handleDelete = (task) =>
    deleteTask(task.id, {
      onSuccess: () => toast.success("Ish o'chirildi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div className="space-y-4">
      {/* Hisoblagichlar — jonli, davrga bog'liq emas */}
      {stats && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="rounded-2xl bg-white p-3.5 ring-1 ring-gray-100">
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className={cn("size-3.5", tone)} />
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                {stats[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Kesimlar */}
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFilter(item.value);
                setPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Button onClick={() => openModal("createSelfTask")}>
          <Plus />
          O'zimga belgilash
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            icon={ListChecks}
            title={
              filter === "all" ? "O'zingizga ish belgilamagansiz" : "Bu kesim bo'yicha ish yo'q"
            }
            description={
              filter === "all"
                ? "\"O'zimga belgilash\" tugmasi bilan o'zingizga reja qo'ying — jarima yo'q, tasdiqlash kutilmaydi."
                : "Boshqa kesimni tanlab ko'ring."
            }
            action={
              filter === "all" ? (
                <Button onClick={() => openModal("createSelfTask")}>
                  <Plus />
                  O'zimga belgilash
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <SelfTaskCard
              key={task.id}
              task={task}
              now={now}
              onComplete={(t) => openModal("completeSelfTask", { task: t, rules })}
              onEdit={(t) => openModal("editSelfTask", { task: t })}
              onDeadline={(t, mode) => openModal("selfTaskDeadline", { task: t, mode })}
              onStop={(t) => openModal("stopSelfTask", { task: t })}
              onDelete={handleDelete}
            />
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

      {/* ─── Doimiy ishlar (qoidalar) ─── */}
      <div className="border-t border-gray-100 pt-4">
        <SelfRulesList />
      </div>

      <CreateSelfTaskModal />
      <SelfTaskCompleteModal />
      <EditSelfTaskModal />
      <SelfTaskDeadlineModal />
      <SelfTaskStopModal />
    </div>
  );
};

export default MySelfTasks;
