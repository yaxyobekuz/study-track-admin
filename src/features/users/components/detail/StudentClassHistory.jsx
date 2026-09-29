// Router
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowRight } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Queries
import { classesQueries } from "@/features/classes/queries/classes.queries";

const LIMIT = 5;

const personName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "Noma'lum";

const namesOf = (list = []) => list.map((cls) => cls.name).join(", ");

/**
 * O'quvchining sinf o'zgarishlari — "Sinflar" kartasining pastki qismi.
 *
 * "Sinf biriktirilmagan" yozuvi o'zi hech narsa aytmaydi: admin shu yerning
 * o'zida "qachon, kim, nega chiqargan" ni ko'rishi kerak. Sabablar alohida
 * ruxsat ortida (`classes.history`) — ruxsat bo'lmasa blok umuman
 * chizilmaydi va so'rov ham yuborilmaydi.
 *
 * @param {object} props
 * @param {{ id: string, username: string }} props.user
 */
const StudentClassHistory = ({ user }) => {
  const { can } = usePermissions();
  const allowed = can("classes.history");

  const { data } = useQuery({
    ...classesQueries.changes({ studentId: user.id, limit: LIMIT }),
    enabled: allowed,
  });

  if (!allowed) return null;

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  if (rows.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-sm font-medium text-gray-700">Sinf o'zgarishlari</p>

      <ul className="mt-2.5 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="text-sm">
            <div className="flex flex-wrap items-center gap-1.5 text-gray-900">
              {row.type === "moved" ? (
                <>
                  <span>{namesOf(row.fromClasses)}</span>
                  <ArrowRight className="size-3.5 text-gray-400" strokeWidth={2} />
                  <span className="font-medium">{namesOf(row.toClasses)}</span>
                </>
              ) : (
                <span>
                  <span className="font-medium">{namesOf(row.fromClasses)}</span>{" "}
                  sinfidan chiqarildi
                </span>
              )}
            </div>
            <p className="mt-0.5 whitespace-pre-line break-words text-gray-600">
              {row.reason}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {personName(row.createdBy)} · {formatDateTimeUz(row.createdAt)}
            </p>
          </li>
        ))}
      </ul>

      {total > rows.length && (
        <Link
          to={`/classes/changes?search=${encodeURIComponent(user.username)}`}
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Barchasini ko'rish ({total})
        </Link>
      )}
    </div>
  );
};

export default StudentClassHistory;
