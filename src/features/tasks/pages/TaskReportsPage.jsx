// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import TimingCard from "../components/report/TimingCard";
import LeadersCard from "../components/report/LeadersCard";
import ReportKpiRow from "../components/report/ReportKpiRow";
import InsightsCard from "../components/report/InsightsCard";
import AttentionCard from "../components/report/AttentionCard";
import LiveListsCard from "../components/report/LiveListsCard";
import TrendChartCard from "../components/report/TrendChartCard";
import StatusDonutCard from "../components/report/StatusDonutCard";
import PeopleTableCard from "../components/report/PeopleTableCard";
import ReportPeriodBar from "../components/report/ReportPeriodBar";
import WeekdayChartCard from "../components/report/WeekdayChartCard";
import RolesCreatorsCard from "../components/report/RolesCreatorsCard";

// Hooks
import { useRoles } from "@/features/roles/queries/roles.queries";

// Queries
import { tasksQueries } from "../queries/tasks.queries";

// Data
import { REPORT_PERIODS, resolveReportPeriod } from "../data/tasks.data";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * "Hisobotlar" tabi.
 *
 * Sahifa umumiydan xususiyga tushadi: KPI (bir qarashda yakun) → xulosa va
 * taqsimot (qanday holatda) → dinamika (qayoqqa ketyapti) → odamlar (kim
 * yaxshi, kimga yordam kerak, hozir nima qilish kerak) → batafsil jadval.
 *
 * Bu fayl faqat KOMPOZITSIYA: payload bir marta olinadi va bo'laklarga
 * uzatiladi, hech bir raqam shu yerda hisoblanmaydi.
 *
 * Davr URL'da (`?period=30d` yoki `?from=...&to=...`) — hisobotni aniq davr
 * bilan link qilib yuborish mumkin.
 */
const TaskReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: roles = [] } = useRoles();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const isCustom = DATE_RE.test(fromParam || "") && DATE_RE.test(toParam || "");
  const periodParam = searchParams.get("period");
  const preset = isCustom
    ? "custom"
    : REPORT_PERIODS.some((p) => p.value === periodParam)
      ? periodParam
      : "30d";

  const range = isCustom ? { from: fromParam, to: toParam } : resolveReportPeriod(preset);

  const { data, isLoading, isError, isFetching } = useQuery(tasksQueries.report(range));

  return (
    <div className="space-y-4">
      <ReportPeriodBar
        preset={preset}
        range={range}
        isFetching={isFetching}
        generatedAt={data?.generatedAt}
        onPresetChange={(value) => setSearchParams({ period: value })}
        onRangeChange={(next) => setSearchParams({ from: next.from, to: next.to })}
      />

      {isLoading ? (
        <LoaderCard className="ring-1 ring-gray-100" />
      ) : isError || !data ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            title="Hisobot yuklanmadi"
            description="Ma'lumotlarni olishda xatolik yuz berdi. Davrni o'zgartirib yoki sahifani yangilab ko'ring."
          />
        </Card>
      ) : (
        <>
          <ReportKpiRow report={data} />

          {/* Manzara: oddiy tilda xulosa, holatlar va vaqtga rioya */}
          <div className="grid gap-4 lg:grid-cols-3">
            <InsightsCard report={data} />
            <StatusDonutCard report={data} />
            <TimingCard report={data} />
          </div>

          {/* Dinamika */}
          <div className="grid gap-4 lg:grid-cols-3">
            <TrendChartCard report={data} className="lg:col-span-2" />
            <WeekdayChartCard report={data} />
          </div>

          {/* Odamlar va harakat */}
          <div className="grid gap-4 lg:grid-cols-3">
            <LeadersCard report={data} roles={roles} />
            <AttentionCard report={data} roles={roles} />
            <LiveListsCard report={data} />
          </div>

          {/* Batafsil */}
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <PeopleTableCard report={data} roles={roles} className="lg:col-span-2" />
            <RolesCreatorsCard report={data} roles={roles} />
          </div>
        </>
      )}
    </div>
  );
};

export default TaskReportsPage;
