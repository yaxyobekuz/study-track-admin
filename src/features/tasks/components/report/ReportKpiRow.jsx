// Components
import Counter from "@/shared/components/ui/Counter";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, buildReportKpis } from "../../data/tasks.data";

/**
 * Beshta KPI kartasi. Tarkibi `buildReportKpis` da — bu komponent faqat
 * "qanday ko'rsatish" bilan shug'ullanadi. Raqam qiymatlar jonli sanaladi,
 * tayyor satrlar ("92.4%", "—") esa to'g'ridan-to'g'ri chiziladi.
 *
 * @param {{ report: object }} props
 */
const ReportKpiRow = ({ report }) => (
  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {buildReportKpis(report).map(({ key, label, value, icon: Icon, tone, delta, hint }) => {
      const t = TONES[tone];
      const DeltaIcon = delta?.icon;
      return (
        <div key={key} className={cn("rounded-2xl bg-gradient-to-b to-white p-4 ring-1", t.card)}>
          <div className="flex items-center gap-2.5">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", t.chip)}>
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <p className={cn("min-w-0 text-sm font-medium leading-tight", t.text)}>{label}</p>
          </div>

          <p className="mt-3 text-3xl font-bold tabular-nums text-gray-900">
            {typeof value === "number" ? <Counter value={value} /> : value}
          </p>

          <p
            className={cn(
              "mt-1 flex items-start gap-1 text-xs leading-snug",
              delta ? delta.className : "text-gray-500",
            )}
          >
            {DeltaIcon && <DeltaIcon className="mt-px size-3.5 shrink-0" />}
            <span className="min-w-0">{delta ? delta.text : hint}</span>
          </p>
        </div>
      );
    })}
  </div>
);

export default ReportKpiRow;
