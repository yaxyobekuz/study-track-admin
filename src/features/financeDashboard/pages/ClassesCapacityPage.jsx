// Router
import { Link, useSearchParams } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";
import ClassBreakdownCard, {
  SchoolCapacityBar,
} from "../components/ClassBreakdownCard";

// Utils
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * SINFLAR BO'YICHA SIG'IM VA QARZ — to'liq ro'yxat.
 *
 * Moliya dashboardidagi jadval faqat 7 ta sinfni ko'rsatadi; "Ko'proq"
 * tugmasi shu sahifaga olib keladi (barcha sinflar). Manba "Umumiy" bilan
 * bir xil (`overviewDashboard`).
 */
const ClassesCapacityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || currentMonthKey();

  const { data, isLoading, isError } = useQuery(
    financeQueries.overviewDashboard(month),
  );

  const setMonth = (v) =>
    setSearchParams((prev) => {
      prev.set("month", String(v));
      return prev;
    });

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/finance/main/dashboard"
            className="flex size-9 items-center justify-center rounded-xl text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sinflar bo'yicha sig'im va qarz
            </h1>
            <p className="text-xs text-gray-400">Barcha sinflar</p>
          </div>
        </div>

        <Select
          value={String(month)}
          triggerClassName="min-w-40"
          options={MONTH_OPTIONS}
          onChange={(v) => setMonth(Number(v))}
        />
      </div>

      <SchoolCapacityBar data={data} />

      <ClassBreakdownCard data={data} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ClassesCapacityPage;
