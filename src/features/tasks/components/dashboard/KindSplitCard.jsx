// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TASK_KIND_META, getRateBarClass, percentText } from "../../data/tasks.data";

/**
 * ASOSIY va QO'SHIMCHA ishlar kesimi.
 *
 * Rahbarning savoli bitta: "qo'shimcha topshiriqlar asosiy ishni bosib
 * ketmayaptimi". Shuning uchun ikkala tur yonma-yon turadi va har birida
 * bajarilish darajasi bor — soni emas, SIFATI taqqoslanadi.
 *
 * @param {{ report: object, className?: string }} props
 */
const KindSplitCard = ({ report, className = "" }) => {
  const rows = report.kinds || [];
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <ReportPanelCard
      title="Ish turlari"
      hint="Asosiy — lavozim bo'yicha doimiy ish, qo'shimcha — bir martalik"
      className={className}
      isEmpty={total === 0}
      emptyText="Bu davrda topshiriq berilmagan"
    >
      <div className="space-y-4">
        {rows.map((row) => {
          const meta = TASK_KIND_META[row.key] || TASK_KIND_META.main;
          const Icon = meta.icon;
          const share = total > 0 ? Math.round((row.total / total) * 100) : 0;

          return (
            <div key={row.key}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    meta.chip,
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                  <p className="text-xs text-gray-500">{meta.hint}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="text-lg font-bold tabular-nums text-gray-900">
                    {row.total}
                  </span>
                  <span className="ml-1 text-xs text-gray-400">ta · {share}%</span>
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                  {row.rate != null && (
                    <div
                      className={cn("h-1.5 rounded-full", getRateBarClass(row.rate))}
                      style={{ width: `${Math.max(row.rate, 2)}%` }}
                    />
                  )}
                </div>
                <span className="w-12 text-right text-xs font-semibold tabular-nums text-gray-700">
                  {percentText(row.rate)}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span className="text-emerald-600">Bajarildi: {row.completed}</span>
                <span className={row.overdue > 0 ? "text-rose-600" : undefined}>
                  Bajarilmadi: {row.overdue}
                </span>
                <span>Jarayonda: {row.inProgress}</span>
                <span>Tekshiruvda: {row.review}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ReportPanelCard>
  );
};

export default KindSplitCard;
