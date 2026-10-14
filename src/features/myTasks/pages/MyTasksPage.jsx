// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ClipboardList } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useNow from "../hooks/useNow";

// Queries
import { myTasksQueries } from "../queries/myTasks.queries";

// Components
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import MyTaskCard from "../components/MyTaskCard";
import MyTaskSubmitModal from "../components/MyTaskSubmitModal";

// Data
import { resolveTimeState } from "@/features/tasks/data/tasks.data";

// Utils
import { cn } from "@/shared/utils/cn";

/** Server `state` parametri bilan AYNI kalitlar. */
const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "active", label: "Hozir vaqti" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "missed", label: "Bajarilmadi" },
  { value: "review", label: "Tekshiruvda" },
  { value: "done", label: "Bajarildi" },
];

/**
 * TOPSHIRIQLARIM — admin panelga kiradigan XODIMNING o'z ro'yxati.
 *
 * ⚠️ RUXSAT TALAB QILMAYDI va route guard'i YO'Q (`/my-attendance` bilan
 * AYNI qaror): topshiriq istalgan roldagi odamga berilishi mumkin —
 * direktor, moliyachi, ma'mur. Ilgari bu ekran faqat o'qituvchi/xodim
 * panellarida bo'lgani uchun admin panelda ishlaydigan odam o'ziga
 * berilgan topshiriqni UMUMAN KO'RMASDI.
 *
 * Boshqaruv bo'limi (`/tasks`) avvalgidek `tasks.view` ortida qoladi —
 * ikkalasi boshqa savolga javob beradi: "men nima qilishim kerak" va
 * "kim nima qilyapti".
 */
const MyTasksPage = () => {
  const now = useNow();
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery(myTasksQueries.list({ page, state: filter }));

  const tasks = data?.data || [];
  const pagination = data?.pagination;
  const rules = data?.submissionRules;

  const activeCount = tasks.filter((t) => resolveTimeState(t, now) === "active").length;

  const openSubmit = (task) => openModal("submitMyTask", { task, rules });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Topshiriqlarim</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {activeCount > 0 ? (
            <span className="font-medium text-rose-600">
              {activeCount} ta topshiriqning bajarilish vaqti — hozir
            </span>
          ) : (
            "Sizga berilgan ishlar va ularning muddatlari"
          )}
        </p>
      </div>

      {/* Kesimlar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
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

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            icon={ClipboardList}
            title={filter === "all" ? "Sizda topshiriq yo'q" : "Bu kesim bo'yicha topshiriq yo'q"}
            description={
              filter === "all"
                ? "Sizga topshiriq berilganda u shu yerda paydo bo'ladi va muddati yaqinlashganda ogohlantiriladi."
                : "Boshqa kesimni tanlab ko'ring."
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <MyTaskCard key={task.id} task={task} now={now} onSubmit={openSubmit} />
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

      <MyTaskSubmitModal />
    </div>
  );
};

export default MyTasksPage;
