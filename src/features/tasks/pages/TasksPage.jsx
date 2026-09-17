// React
import { useEffect, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams } from "react-router-dom";

// Icons
import { ClipboardList, FilterX, Plus, X } from "lucide-react";

// Queries
import { tasksQueries } from "../queries/tasks.queries";

// Data
import {
  SORT_OPTIONS,
  TASKS_PAGE_LIMIT,
  DUE_FILTER_OPTIONS,
  taskStatusOptions,
} from "../data/tasks.data";

// Components
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import SelectAllUsers from "@/shared/components/ui/select/SelectAllUsers";
import TasksTable from "../components/list/TasksTable";
import TaskStatsStrip from "../components/list/TaskStatsStrip";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Modals
import CreateTaskModal from "../components/CreateTaskModal";

// Filtr parametrlari — hammasi URL'da, sahifani filtr bilan link qilib yuborish mumkin
const FILTER_KEYS = ["status", "due", "assigneeId", "search", "sort"];

/**
 * "Asosiy" tab: jonli hisoblagichlar + filtrlar + ro'yxat.
 */
const TasksPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const { data: roles = [] } = useRoles();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "all";
  const due = searchParams.get("due") || "all";
  const assigneeId = searchParams.get("assigneeId") || "";
  const sort = searchParams.get("sort") || "newest";

  // Qidiruv maydoni lokal, URL'ga kechikish bilan yoziladi
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const search = useDebounce(searchInput.trim());

  const { data: stats } = useQuery(tasksQueries.stats());
  const { data, isLoading, isFetching } = useQuery(
    tasksQueries.list({
      page: currentPage,
      limit: TASKS_PAGE_LIMIT,
      sort,
      ...(status !== "all" && { status }),
      ...(due !== "all" && { due }),
      ...(assigneeId && { assigneeId }),
      ...(search && { search }),
    }),
  );

  const tasks = data?.data || [];
  const pagination = data?.pagination;

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    setSearchParams(params);
  };

  useEffect(() => {
    if ((searchParams.get("search") || "") !== search) updateParams({ search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const hasFilters = FILTER_KEYS.some(
    (key) => key !== "sort" && searchParams.get(key),
  );

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  // Karta filtri: status yoki muddat kesimi. Bir karta bosilganda
  // ikkinchi turdagi filtr tozalanadi — aks holda "Muddati o'tgan" +
  // "Yakunlangan" kabi har doim bo'sh kesim hosil bo'lardi.
  const isCardActive = (card) =>
    Object.entries(card.filter).every(([k, v]) => searchParams.get(k) === v);

  const selectCard = (card) => {
    if (isCardActive(card)) updateParams({ status: "", due: "" });
    else updateParams({ status: "", due: "", ...card.filter });
  };

  return (
    <div className="space-y-4">
      <TaskStatsStrip stats={stats} isActive={isCardActive} onSelect={selectCard} />

      {/* Filtrlar */}
      <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <InputSearch
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Sarlavha yoki tavsif bo'yicha qidirish..."
            className="min-w-56 flex-1"
          />

          <Select
            value={status}
            options={taskStatusOptions}
            triggerClassName="w-52"
            onChange={(v) => updateParams({ status: v })}
          />

          <Select
            value={due}
            options={DUE_FILTER_OPTIONS}
            triggerClassName="w-44"
            onChange={(v) => updateParams({ due: v })}
          />

          <div className="flex items-center gap-1">
            <SelectAllUsers
              hideLabel
              label={null}
              required={false}
              className="w-56"
              value={assigneeId}
              placeholder="Barcha ijrochilar"
              onChange={(v) => updateParams({ assigneeId: v })}
              formatUsers={(user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName || ""}`.trim(),
              })}
            />
            {assigneeId && (
              <button
                type="button"
                aria-label="Ijrochi filtrini olib tashlash"
                onClick={() => updateParams({ assigneeId: "" })}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select
            value={sort}
            options={SORT_OPTIONS}
            triggerClassName="w-44"
            onChange={(v) => updateParams({ sort: v === "newest" ? "" : v })}
          />

          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" onClick={resetFilters}>
                <FilterX />
                Tozalash
              </Button>
            )}
            {can("tasks.create") && (
              <Button onClick={() => openModal("createTask")}>
                <Plus />
                Topshiriq berish
              </Button>
            )}
          </div>
        </div>

        {pagination && (
          <p className="mt-2.5 px-1 text-xs text-gray-400">
            {hasFilters ? "Topildi" : "Jami"}: {pagination.total} ta topshiriq
            {isFetching && !isLoading && " · yangilanmoqda..."}
          </p>
        )}
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-gray-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100">
          <EmptyState
            icon={ClipboardList}
            title={hasFilters ? "Bu filtr bo'yicha topshiriq yo'q" : "Hali topshiriq berilmagan"}
            description={
              hasFilters
                ? "Filtrlarni o'zgartirib yoki tozalab ko'ring."
                : "Xodim yoki o'quvchiga birinchi topshiriqni bering — u shu yerda paydo bo'ladi."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  <FilterX />
                  Filtrlarni tozalash
                </Button>
              ) : (
                can("tasks.create") && (
                  <Button onClick={() => openModal("createTask")}>
                    <Plus />
                    Topshiriq berish
                  </Button>
                )
              )
            }
          />
        </div>
      ) : (
        <TasksTable tasks={tasks} roles={roles} dueSoonHours={stats?.dueSoonHours} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <CreateTaskModal />
    </div>
  );
};

export default TasksPage;
