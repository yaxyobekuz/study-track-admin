// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Data
import { ISSUE_STATUSES, ISSUE_BREAKDOWN_META } from "../../data/issues.data";

/**
 * Holat bo'linishi — bitta yig'ma ustun va afsona.
 *
 * ⚠️ DONUT EMAS, YIG'MA USTUN: to'rtta bo'lakdan ikkitasi ko'pincha nol
 * bo'ladi ("rad etildi" kam uchraydi) va donutda nol bo'lak ko'rinmas
 * kesma bo'lib qolardi. Ustunda esa har bir holat afsonada o'z raqami
 * bilan turadi.
 *
 * ⚠️ Ulush JONLI hisoblanadi (maxraj — davrdagi jami), chunki server
 * holat ulushini bermaydi: u faqat sanoq beradi va bitta foizni ikki
 * joyda hisoblamaslik uchun bu yerda qoladi.
 *
 * @param {{ report: object, className?: string }} props
 */
const IssueStatusCard = ({ report, className = "" }) => {
  const byStatus = report?.byStatus || {};
  const total = ISSUE_STATUSES.reduce((sum, s) => sum + (byStatus[s] || 0), 0);

  const rows = ISSUE_STATUSES.map((status) => ({
    status,
    ...ISSUE_BREAKDOWN_META[status],
    count: byStatus[status] || 0,
    share: total > 0 ? (byStatus[status] || 0) / total : 0,
  }));

  return (
    <ReportPanelCard
      title="Holatlar bo'linishi"
      hint="Davr ichida kelgan murojaatlar"
      className={className}
      isEmpty={total === 0}
    >
      {/* Yig'ma ustun */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {rows
          .filter((r) => r.count > 0)
          .map((r) => (
            <span
              key={r.status}
              title={`${r.label}: ${r.count} ta`}
              style={{
                width: `${r.share * 100}%`,
                backgroundColor: r.color,
              }}
            />
          ))}
      </div>

      {/* Afsona */}
      <ul className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <li key={r.status} className="flex items-start gap-2.5 text-sm">
            <span
              className="mt-1.5 size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: r.color }}
            />

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{r.label}</p>
              <p className="text-xs text-gray-500">{r.hint}</p>
            </div>

            <div className="text-right">
              <p className="font-semibold tabular-nums text-gray-900">
                {r.count}
              </p>
              <p className="text-xs tabular-nums text-gray-400">
                {total > 0 ? `${Math.round(r.share * 1000) / 10}%` : "—"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ReportPanelCard>
  );
};

export default IssueStatusCard;
