// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Data
import {
  issueAuthorKindLabels,
  ISSUE_CHART_COLORS,
} from "../../data/issues.data";

const KINDS = [
  { key: "staff", color: ISSUE_CHART_COLORS.in_review },
  { key: "student", color: ISSUE_CHART_COLORS.new },
];

/**
 * Kim murojaat qilyapti — xodim yoki ota-ona.
 *
 * ⚠️ IKKI RAQAMNI TAQQOSLAB BO'LMAYDI: xodimlar soni ota-onalar sonidan
 * ancha kam, shuning uchun "ota-onalar ko'proq yozyapti" degan xulosa
 * o'z-o'zidan chiqmaydi. Shu sababli panel faqat SANOQ va ULUSH beradi,
 * "faolroq" degan baho bermaydi.
 *
 * @param {{ report: object, className?: string }} props
 */
const IssueAuthorCard = ({ report, className = "" }) => {
  const byKind = report?.byAuthorKind || {};
  const total = KINDS.reduce((sum, k) => sum + (byKind[k.key] || 0), 0);

  return (
    <ReportPanelCard
      title="Kim murojaat qilyapti"
      hint="Davr ichida, bog'lanish turi bo'yicha"
      className={className}
      isEmpty={total === 0}
    >
      <ul className="space-y-4">
        {KINDS.map(({ key, color }) => {
          const count = byKind[key] || 0;
          const share = total > 0 ? count / total : 0;

          return (
            <li key={key}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">
                  {issueAuthorKindLabels[key]}
                </p>

                <p className="text-xs tabular-nums text-gray-500">
                  <b className="text-gray-900">{count}</b> ta ·{" "}
                  {total > 0 ? `${Math.round(share * 1000) / 10}%` : "—"}
                </p>
              </div>

              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <span
                  className="block h-full"
                  style={{
                    width: `${share * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ReportPanelCard>
  );
};

export default IssueAuthorCard;
