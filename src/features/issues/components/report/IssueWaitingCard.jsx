// Router
import { Link } from "react-router-dom";

// Components
import ReportPanelCard from "@/features/users/components/reports/ReportPanelCard";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  issueStatusColors,
  issueStatusLabels,
  issueAuthorKindLabels,
} from "../../data/issues.data";

/**
 * JAVOBSIZ TURGANLAR — eng eskisidan boshlab.
 *
 * ⚠️ DAVRGA BOG'LIQ EMAS (server `live` kesimi): bu "hozir nima qilish
 * kerak" degan savol va u tanlangan davrga bog'liq bo'lmasligi kerak —
 * aks holda "7 kun" tanlanganda bir oy javobsiz turgan murojaat
 * ro'yxatdan tushib qolardi. Panel sarlavhasida shu aytiladi.
 *
 * @param {{ report: object, className?: string }} props
 */
const IssueWaitingCard = ({ report, className = "" }) => {
  const rows = report?.live || [];

  return (
    <ReportPanelCard
      title="Javob kutayotganlar"
      hint="Hozirgi holat — tanlangan davrga bog'liq emas"
      className={className}
      isEmpty={rows.length === 0}
      emptyText="Javobsiz murojaat yo'q"
      action={
        <Link
          to="/issues?status=new"
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          Ro'yxatga o'tish
        </Link>
      }
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-gray-900">
                {row.authorName}
                <span className="ml-1 text-xs font-normal text-gray-500">
                  ({issueAuthorKindLabels[row.authorKind] || row.authorKind})
                </span>
              </p>

              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  issueStatusColors[row.status]
                }`}
              >
                {issueStatusLabels[row.status]}
              </span>
            </div>

            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
              {row.body}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              {row.categoryName} · {formatDateTimeUz(row.createdAt)}
              {/* 0 kun — "bugun keldi", ya'ni kechikish emas */}
              {row.waitingDays > 0 && (
                <span className="text-amber-600">
                  {" "}
                  · {row.waitingDays} kun kutyapti
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </ReportPanelCard>
  );
};

export default IssueWaitingCard;
