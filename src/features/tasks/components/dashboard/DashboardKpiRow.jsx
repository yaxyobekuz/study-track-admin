// Router
import { Link } from "react-router-dom";

// Components
import Counter from "@/shared/components/ui/Counter";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, buildDashboardKpis } from "../../data/tasks.data";

/**
 * Dashboard kartalari. Har biri BOSILADI va topshiriqlar ro'yxatini o'sha
 * kesimda ochadi — "bajarilmadi: 7" raqamidan "aynan qaysi 7 tasi" ga
 * bitta bosishda o'tiladi.
 *
 * Tarkibi `buildDashboardKpis` da; bu komponent faqat ko'rinish bilan
 * shug'ullanadi va hech bir raqamni o'zi hisoblamaydi.
 *
 * @param {{ report: object }} props
 */
const DashboardKpiRow = ({ report }) => (
  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    {buildDashboardKpis(report).map(({ key, label, value, icon: Icon, tone, hint, filter }) => {
      const t = TONES[tone];
      // ⚠️ DAVR HAM UZATILADI: aks holda "Bajarilmadi: 2" raqamini bosgan
      // odam butun tarixdagi bajarilmaganlar ro'yxatiga tushardi va
      // ekrandagi raqam bilan ro'yxat bir-biriga mos kelmasdi.
      const params = new URLSearchParams({
        ...filter,
        ...(report.period?.from && { startDate: report.period.from }),
        ...(report.period?.to && { endDate: report.period.to }),
      });
      return (
        <Link
          key={key}
          to={`/tasks/list${params.toString() ? `?${params}` : ""}`}
          className={cn(
            "rounded-2xl bg-gradient-to-b to-white p-4 ring-1 transition-shadow hover:shadow-md",
            t.card,
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                t.chip,
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </span>
            <p className={cn("min-w-0 text-sm font-medium leading-tight", t.text)}>{label}</p>
          </div>

          <p className="mt-3 text-3xl font-bold tabular-nums text-gray-900">
            {typeof value === "number" ? <Counter value={value} /> : value}
          </p>
          <p className="mt-1 text-xs leading-snug text-gray-500">{hint}</p>
        </Link>
      );
    })}
  </div>
);

export default DashboardKpiRow;
