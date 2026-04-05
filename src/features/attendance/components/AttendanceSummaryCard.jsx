// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

const AttendanceSummaryCard = ({ summary }) => {
  if (!summary) return null;

  const items = [
    { key: "present", count: summary.present },
    { key: "late", count: summary.late },
    { key: "absent", count: summary.absent },
    { key: "excused", count: summary.excused },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(({ key, count }) => (
        <div
          key={key}
          className={cn(STATUS_COLORS[key], "space-y-1 rounded-lg px-4 py-3 text-center")}
        >
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm">{STATUS_LABELS[key]}</p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummaryCard;
