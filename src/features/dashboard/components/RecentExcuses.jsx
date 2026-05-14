// Router
import { Link } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { attendanceAPI } from "@/features/attendance/api/attendance.api";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Data
import {
  EXCUSE_TYPE_LABELS,
  EXCUSE_STATUS_LABELS,
  EXCUSE_STATUS_COLORS,
} from "@/features/attendance/data/attendance.data";

const RecentExcuses = () => {
  const { data } = useQuery({
    queryKey: ["attendance", "excuses", "recent"],
    queryFn: () =>
      attendanceAPI.getRecentExcuses().then((res) => res.data.data),
  });

  const items = data?.items || [];
  const pendingCount = data?.pendingCount || 0;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">So'nggi uzrli so'rovlar</h2>

        {pendingCount > 0 && (
          <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
            {pendingCount} ta kutilmoqda
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Hozircha uzrli so'rovlar yo'q
          </p>
        )}

        {items.map((ex) => (
          <div
            key={ex._id}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {ex.user?.firstName} {ex.user?.lastName}
              </p>

              <p className="text-xs text-gray-400">
                {formatDateUZ(ex.date)} ·{" "}
                {EXCUSE_TYPE_LABELS[ex.type] || ex.type}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                EXCUSE_STATUS_COLORS[ex.status]
              }`}
            >
              {EXCUSE_STATUS_LABELS[ex.status]}
            </span>
          </div>
        ))}
      </div>

      <Button
        asChild
        variant="link"
        className="mx-auto inline-block size-auto py-0 text-sm"
      >
        <Link to="/attendance/excuses">Barcha so'rovlar</Link>
      </Button>
    </Card>
  );
};

export default RecentExcuses;
