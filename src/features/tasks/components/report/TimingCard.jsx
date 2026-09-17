// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TIMING_META, durationText, percentText } from "../../data/tasks.data";

/**
 * "Ishlar qachon topshiriladi?" — erta / oxirgi kunda / kechikib.
 * Bitta gorizontal bo'lingan chiziq + katta emoji'li qatorlar: foizni
 * o'qimasdan ham "ko'pi yashil" yoki "ko'pi qizil" ko'rinadi.
 *
 * @param {{ report: object }} props
 */
const TimingCard = ({ report }) => {
  const { timing, kpis } = report;
  const total = timing.early + timing.lastDay + timing.late;

  return (
    <ReportPanelCard
      title="Ishlar qachon topshiriladi?"
      hint="Bajarilgan ishlar muddatga nisbatan"
      isEmpty={total === 0}
      emptyText="Hali bajarilgan ish yo'q"
    >
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
        {TIMING_META.map((m) =>
          timing[m.key] > 0 ? (
            <div
              key={m.key}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", m.bar)}
              style={{ width: `${(timing[m.key] / total) * 100}%` }}
              title={`${m.label}: ${timing[m.key]}`}
            />
          ) : null,
        )}
      </div>

      <div className="mt-4 space-y-3">
        {TIMING_META.map((m) => (
          <div key={m.key} className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl" aria-hidden>
              {m.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800">{m.label}</p>
              <p className="text-[11px] text-gray-400">{m.hint}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums text-gray-900">{timing[m.key]}</p>
              <p className="text-[11px] tabular-nums text-gray-400">
                {percentText(total ? Math.round((timing[m.key] / total) * 1000) / 10 : null)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[11px] text-gray-500">O'rtacha bajarish vaqti</p>
          <p className="text-sm font-semibold text-gray-900">{durationText(kpis.avgCompletionMinutes)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[11px] text-gray-500">Tekshirish kutilgan vaqt</p>
          <p className="text-sm font-semibold text-gray-900">{durationText(kpis.avgReviewMinutes)}</p>
        </div>
      </div>
    </ReportPanelCard>
  );
};

export default TimingCard;
