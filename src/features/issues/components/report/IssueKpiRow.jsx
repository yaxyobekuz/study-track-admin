// Components
import Counter from "@/shared/components/ui/Counter";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TONES, buildIssueKpis } from "../../data/issues.data";

/**
 * To'rtta KPI kartasi. Tarkibi `buildIssueKpis` da — bu komponent faqat
 * "qanday ko'rsatish" bilan shug'ullanadi. Raqam qiymatlar jonli sanaladi,
 * tayyor satrlar ("—", "4 soat") esa to'g'ridan-to'g'ri chiziladi.
 *
 * @param {{ report: object }} props
 */
const IssueKpiRow = ({ report }) => (
  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
    {buildIssueKpis(report).map(
      ({ key, label, value, icon: Icon, tone, hint }) => {
        const t = TONES[tone];

        return (
          <div
            key={key}
            className={cn(
              "rounded-2xl bg-gradient-to-b to-white p-4 ring-1",
              t.card,
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  t.chip,
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p
                className={cn(
                  "min-w-0 text-sm font-medium leading-tight",
                  t.text,
                )}
              >
                {label}
              </p>
            </div>

            <p className="mt-3 text-3xl font-bold tabular-nums text-gray-900">
              {typeof value === "number" ? <Counter value={value} /> : value}
            </p>

            <p className="mt-1 text-xs leading-snug text-gray-500">{hint}</p>
          </div>
        );
      },
    )}
  </div>
);

export default IssueKpiRow;
