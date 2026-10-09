// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import IssueKpiRow from "../components/report/IssueKpiRow";
import IssuePeriodBar from "../components/report/IssuePeriodBar";
import IssueStatusCard from "../components/report/IssueStatusCard";
import IssueAuthorCard from "../components/report/IssueAuthorCard";
import IssueTrendCard from "../components/report/IssueTrendCard";
import IssueCategoryCard from "../components/report/IssueCategoryCard";
import IssueWaitingCard from "../components/report/IssueWaitingCard";

// Queries
import { issuesQueries } from "../queries/issues.queries";

// Data
import { REPORT_PERIODS, resolveReportPeriod } from "../data/issues.data";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * "Hisobotlar" tabi.
 *
 * Sahifa umumiydan xususiyga tushadi: KPI (bir qarashda yakun) → taqsimot
 * (qanday holatda, kim yozyapti) → dinamika (qayoqqa ketyapti) →
 * kategoriyalar va hozir javob kutayotganlar (nima qilish kerak).
 *
 * Bu fayl faqat KOMPOZITSIYA: payload bir marta olinadi va bo'laklarga
 * uzatiladi, hech bir raqam shu yerda hisoblanmaydi.
 *
 * Davr URL'da (`?period=30d` yoki `?from=...&to=...`) — hisobotni aniq davr
 * bilan link qilib yuborish mumkin.
 */
const IssueReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const isCustom = DATE_RE.test(fromParam || "") && DATE_RE.test(toParam || "");
  const periodParam = searchParams.get("period");
  const preset = isCustom
    ? "custom"
    : REPORT_PERIODS.some((p) => p.value === periodParam)
      ? periodParam
      : "30d";

  const range = isCustom
    ? { from: fromParam, to: toParam }
    : resolveReportPeriod(preset);

  const { data, isLoading, isError, isFetching } = useQuery(
    issuesQueries.report(range),
  );

  return (
    <div className="space-y-4">
      <IssuePeriodBar
        preset={preset}
        range={range}
        isFetching={isFetching}
        generatedAt={data?.generatedAt}
        onPresetChange={(value) => setSearchParams({ period: value })}
        onRangeChange={(next) =>
          setSearchParams({ from: next.from, to: next.to })
        }
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
          <IssueKpiRow report={data} />

          {/* Manzara: holatlar va kim yozyapti */}
          <div className="grid gap-4 lg:grid-cols-3">
            <IssueStatusCard report={data} />
            <IssueAuthorCard report={data} />
            <IssueWaitingCard report={data} />
          </div>

          {/* Dinamika va yo'nalishlar */}
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <IssueTrendCard report={data} className="lg:col-span-2" />
            <IssueCategoryCard report={data} />
          </div>
        </>
      )}
    </div>
  );
};

export default IssueReportsPage;
