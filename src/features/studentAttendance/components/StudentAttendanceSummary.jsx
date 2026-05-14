import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";

import { studentAttendanceAPI } from "../api/studentAttendance.api";
import { STATUS_COLORS, STATUS_LABELS, MONTH_OPTIONS } from "../data/studentAttendance.data";
import { formatDateUZ } from "@/shared/utils/date.utils";

const StudentAttendanceSummary = ({ studentId }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["studentAttendance", "student", studentId, month, year],
    queryFn: () =>
      studentAttendanceAPI
        .getStudentMonthRecords(studentId, month, year)
        .then((r) => r.data),
    enabled: !!studentId,
  });

  const records = data?.records || [];
  const summary = data?.summary || {};

  const summaryItems = [
    { key: "present", label: "Keldi" },
    { key: "late", label: "Kech keldi" },
    { key: "absent", label: "Kelmadi" },
    { key: "excused", label: "Sababli" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-gray-800">O'quvchi davomati</h2>
        <div className="flex gap-2">
          <select
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-gray-400 text-sm">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {summaryItems.map(({ key, label }) => (
              <div
                key={key}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-center",
                  STATUS_COLORS[key]
                )}
              >
                <p className="text-xl font-bold">{summary[key] ?? 0}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Bu oy uchun davomat ma&apos;lumoti yo&apos;q
            </p>
          ) : (
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
              {records.map((rec) => (
                <div
                  key={rec._id}
                  className="flex items-center justify-between px-3 py-2.5 text-sm"
                >
                  <span className="text-gray-600">{formatDateUZ(new Date(rec.date))}</span>
                  <div className="flex items-center gap-2">
                    {rec.excuseReason && (
                      <span className="text-xs text-gray-400 max-w-[120px] truncate">
                        {rec.excuseReason}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[rec.status]
                      )}
                    >
                      {STATUS_LABELS[rec.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentAttendanceSummary;
