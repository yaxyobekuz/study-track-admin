// React
import { useEffect, useRef, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { CalendarRange, ClipboardList, FilterX, X } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import SelectAllUsers from "@/shared/components/ui/select/SelectAllUsers";
import TasksTable from "../components/list/TasksTable";
import InsightsCard from "../components/report/InsightsCard";
import TrendChartCard from "../components/report/TrendChartCard";
import StatusDonutCard from "../components/report/StatusDonutCard";
import KindSplitCard from "../components/dashboard/KindSplitCard";
import StaffBoardCard from "../components/dashboard/StaffBoardCard";
import DashboardKpiRow from "../components/dashboard/DashboardKpiRow";
import DashboardPeriodBar from "../components/dashboard/DashboardPeriodBar";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Queries
import { selfTasksQueries } from "../queries/selfTasks.queries";

// Utils
import { formatDateRangeUz } from "@/shared/utils/date.utils";

// Data
import {
  DASHBOARD_PERIODS,
  SORT_OPTIONS,
  TASKS_PAGE_LIMIT,
  TASK_KIND_OPTIONS,
  STATE_FILTER_OPTIONS,
} from "../data/tasks.data";

// Ro'yxatga ta'sir qiladigan parametrlar — hammasi URL'da
const LIST_KEYS = ["state", "kind", "assigneeId", "search", "sort", "startDate", "endDate"];

/**
 * XODIMLAR O'ZIGA BELGILAGAN TOPSHIRIQLAR — boshqaruvchi ekrani
 * (`tasks.self`).
 *
 * Savollar tartibi Lavozimlar markazi dashboardi bilan AYNI: shu davrda
 * nima bo'ldi (KPI) → nega shunday (xulosa, taqsimot, ish turlari) →
 * qayoqqa ketyapti (dinamika) → KIM (xodimlar taxtasi) → aynan qaysi
 * ishlar (ro'yxat).
 *
 * ⚠️ RAQAMLAR SHU YERDA HISOBLANMAYDI: payload Lavozimlar markazi
 * hisobotining AYNI dvigatelidan keladi (`taskReport.service.js`), faqat
 * oqim kesimi boshqa (`self_assigned`). Ikkinchi dvigatel bo'lsa, bir
 * ekranda "bajarildi" uchun ikki xil son chiqardi.
 *
 * ⚠️ FAQAT KO'RISH. Birovning shaxsiy rejasini boshqaruvchi tahrirlamaydi,
 * to'xtatmaydi va yopmaydi — qator EGASIDA qoladi (server ham rad etadi).
 * Shuning uchun jadval `readOnly` va "Topshiriq berish" tugmasi YO'Q:
 * bu bo'lim "kim o'zini qanday rejalashtirmoqda" degan savolga javob
 * beradi, ish taqsimlash joyi emas.
 *
 * ⚠️ JARIMA USTUNI YO'Q — bu oqimda jarima umuman bo'lmaydi (biznes
 * qarori), ya'ni ustun har doim "0 ball" degan ma'nosiz qator bo'lardi.
 *
 * Dashboard kartasi va xodim qatori bosilganda ro'yxat SHU SAHIFADA
 * filtrlanadi va ekran unga suriladi — "bajarilmadi: 3" raqamidan aynan
 * o'sha 3 tasiga bitta bosishda o'tiladi.
 */
const SelfTasksPage = () => {
  const { data: roles = [] } = useRoles();
  const [searchParams, setSearchParams] = useSearchParams();
  const listRef = useRef(null);

  const periodParam = searchParams.get("period");
  const period = DASHBOARD_PERIODS.some((p) => p.value === periodParam) ? periodParam : "month";

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const state = searchParams.get("state") || "all";
  const kind = searchParams.get("kind") || "all";
  const assigneeId = searchParams.get("assigneeId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const sort = searchParams.get("sort") || "newest";

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const search = useDebounce(searchInput.trim());

  const {
    data: report,
    isLoading: reportLoading,
    isError,
    isFetching,
  } = useQuery(selfTasksQueries.overview({ period }));

  const { data: list, isLoading: listLoading } = useQuery(
    selfTasksQueries.all({
      page: currentPage,
      limit: TASKS_PAGE_LIMIT,
      sort,
      ...(state !== "all" && { state }),
      ...(kind !== "all" && { kind }),
      ...(assigneeId && { assigneeId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search }),
    }),
  );

  const tasks = list?.data || [];
  const pagination = list?.pagination;

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

  // ⚠️ KARTA BOSILGANDA EKRAN RO'YXATGA SURILADI. Usiz "Bajarilmadi: 3"
  // raqamini bosgan odam hech narsa o'zgarmagandek ko'rardi: ro'yxat
  // ekranning pastida, dashboard kartalari ostida turadi.
  const filterSignature = `${state}|${kind}|${assigneeId}`;
  const lastSignature = useRef(filterSignature);
  useEffect(() => {
    if (lastSignature.current === filterSignature) return;
    lastSignature.current = filterSignature;
    if (filterSignature === "all|all|") return;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filterSignature]);

  const hasFilters = LIST_KEYS.some((key) => searchParams.get(key));

  const resetFilters = () => {
    setSearchInput("");
    const params = new URLSearchParams();
    if (period !== "month") params.set("period", period);
    setSearchParams(params);
  };

  return (
    <div className="space-y-4">
      <DashboardPeriodBar
        period={period}
        range={report?.period}
        isFetching={isFetching}
        generatedAt={report?.generatedAt}
        onChange={(value) => {
          const params = new URLSearchParams(searchParams);
          if (value === "month") params.delete("period");
          else params.set("period", value);
          // Davr o'zgarsa ro'yxatdagi sana kesimi ham eskiradi
          params.delete("startDate");
          params.delete("endDate");
          params.set("page", "1");
          setSearchParams(params);
        }}
      />

      {reportLoading ? (
        <LoaderCard className="ring-1 ring-gray-100" />
      ) : isError || !report ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            title="Ma'lumot yuklanmadi"
            description="Davrni o'zgartirib yoki sahifani yangilab ko'ring."
          />
        </Card>
      ) : (
        <>
          <DashboardKpiRow report={report} self listPath="/tasks/self" />

          <div className="grid gap-4 lg:grid-cols-3">
            <InsightsCard report={report} self />
            <StatusDonutCard report={report} self />
            <KindSplitCard report={report} self />
          </div>

          <TrendChartCard report={report} self />

          <StaffBoardCard report={report} roles={roles} self listPath="/tasks/self" />
        </>
      )}

      {/* ─── Ro'yxat ─── */}
      <div ref={listRef} className="space-y-3 scroll-mt-4">
        <div>
          <h2 className="font-semibold text-gray-900">Ishlar ro'yxati</h2>
          <p className="text-xs text-gray-500">
            Xodimlar o'zlariga belgilagan har bir ish — faqat ko'rish uchun
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <InputSearch
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Sarlavha yoki tavsif bo'yicha qidirish..."
              className="min-w-56 flex-1"
            />

            <Select
              value={state}
              options={STATE_FILTER_OPTIONS}
              triggerClassName="w-52"
              onChange={(v) => updateParams({ state: v })}
            />

            <Select
              value={kind}
              options={TASK_KIND_OPTIONS}
              triggerClassName="w-40"
              onChange={(v) => updateParams({ kind: v })}
            />

            <div className="flex items-center gap-1">
              <SelectAllUsers
                hideLabel
                label={null}
                required={false}
                className="w-56"
                value={assigneeId}
                placeholder="Barcha xodimlar"
                onChange={(v) => updateParams({ assigneeId: v })}
                formatUsers={(user) => ({
                  value: user.id,
                  label: `${user.firstName} ${user.lastName || ""}`.trim(),
                })}
              />
              {assigneeId && (
                <button
                  type="button"
                  aria-label="Xodim filtrini olib tashlash"
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

            {hasFilters && (
              <Button variant="ghost" className="ml-auto" onClick={resetFilters}>
                <FilterX />
                Tozalash
              </Button>
            )}
          </div>

          {/* Dashboarddan kelgan davr — KO'RINIB tursin: aks holda ro'yxat
              sababsiz qisqargandek tuyulardi */}
          {startDate && endDate && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                <CalendarRange className="size-3.5" />
                {formatDateRangeUz(startDate, endDate)}
                <button
                  type="button"
                  aria-label="Davr kesimini olib tashlash"
                  onClick={() => updateParams({ startDate: "", endDate: "" })}
                  className="rounded-full p-0.5 hover:bg-blue-100"
                >
                  <X className="size-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {listLoading ? (
          <LoaderCard className="ring-1 ring-gray-100" />
        ) : tasks.length === 0 ? (
          <Card className="ring-1 ring-gray-100">
            <EmptyState
              icon={ClipboardList}
              title={
                hasFilters
                  ? "Bu kesim bo'yicha ish topilmadi"
                  : "Hali hech kim o'ziga ish belgilamagan"
              }
              description={
                hasFilters
                  ? "Filtrlarni o'zgartirib ko'ring."
                  : "Xodim o'z panelida \"O'zim belgilagan\" bo'limidan ish qo'shsa, u shu yerda paydo bo'ladi."
              }
            />
          </Card>
        ) : (
          <>
            <TasksTable
              readOnly
              tasks={tasks}
              roles={roles}
              showPenalty={false}
              detailPath="/tasks/self"
              dueSoonHours={report?.live?.dueSoonHours}
            />
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(page));
                  setSearchParams(params);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelfTasksPage;
