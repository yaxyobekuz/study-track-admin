// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Plus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import InsightsCard from "../components/report/InsightsCard";
import LiveListsCard from "../components/report/LiveListsCard";
import TrendChartCard from "../components/report/TrendChartCard";
import StatusDonutCard from "../components/report/StatusDonutCard";
import KindSplitCard from "../components/dashboard/KindSplitCard";
import StaffBoardCard from "../components/dashboard/StaffBoardCard";
import DashboardKpiRow from "../components/dashboard/DashboardKpiRow";
import DashboardPeriodBar from "../components/dashboard/DashboardPeriodBar";
import CreateTaskModal from "../components/CreateTaskModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Queries
import { tasksQueries } from "../queries/tasks.queries";

// Data
import { DASHBOARD_PERIODS } from "../data/tasks.data";

/**
 * LAVOZIMLAR MARKAZI DASHBOARDI — bo'limning bosh sahifasi.
 *
 * Savollar tartibi: shu davrda nima bo'ldi (KPI) → nega shunday (xulosa,
 * taqsimot, ish turlari) → qayoqqa ketyapti (dinamika) → KIM (xodimlar
 * taxtasi) → hozir nima qilish kerak (jonli ro'yxatlar).
 *
 * ⚠️ Bu fayl faqat KOMPOZITSIYA: payload bir marta olinadi va bo'laklarga
 * uzatiladi, hech bir raqam shu yerda hisoblanmaydi. Dvigatel hisobot
 * bilan BITTA (`taskReport.service.js`) — aks holda dashboard va hisobot
 * "bajarildi" uchun ikki xil son ko'rsatardi.
 *
 * Davr URL'da (`?period=week`) — dashboardni aniq davr bilan link qilib
 * yuborish mumkin.
 */
const TaskDashboardPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { data: roles = [] } = useRoles();
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get("period");
  const period = DASHBOARD_PERIODS.some((p) => p.value === periodParam)
    ? periodParam
    : "month";

  const { data, isLoading, isError, isFetching } = useQuery(
    tasksQueries.dashboard({ period }),
  );

  const canCreate = can("tasks.create") || can("tasks.team");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DashboardPeriodBar
          period={period}
          range={data?.period}
          isFetching={isFetching}
          generatedAt={data?.generatedAt}
          onChange={(value) => setSearchParams(value === "month" ? {} : { period: value })}
        />
        {canCreate && (
          <Button className="ml-auto" onClick={() => openModal("createTask")}>
            <Plus />
            Topshiriq berish
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoaderCard className="ring-1 ring-gray-100" />
      ) : isError || !data ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            title="Dashboard yuklanmadi"
            description="Ma'lumotlarni olishda xatolik yuz berdi. Davrni o'zgartirib yoki sahifani yangilab ko'ring."
          />
        </Card>
      ) : (
        <>
          <DashboardKpiRow report={data} />

          {/* Manzara */}
          <div className="grid gap-4 lg:grid-cols-3">
            <InsightsCard report={data} />
            <StatusDonutCard report={data} />
            <KindSplitCard report={data} />
          </div>

          {/* Dinamika va hozirgi holat */}
          <div className="grid gap-4 lg:grid-cols-3">
            <TrendChartCard report={data} className="lg:col-span-2" />
            <LiveListsCard report={data} />
          </div>

          {/* Kim nima qildi */}
          <StaffBoardCard report={data} roles={roles} />
        </>
      )}

      <CreateTaskModal />
    </div>
  );
};

export default TaskDashboardPage;
