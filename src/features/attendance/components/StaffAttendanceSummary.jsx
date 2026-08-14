// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ, formatTimeUZ } from "@/shared/utils/date.utils";

// API & data
import { attendanceAPI } from "../api/attendance.api";
import {
  MONTH_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  USER_SUMMARY_ITEMS,
  YEAR_OPTIONS,
} from "../data/studentAttendance.data";

// Radix Select faqat string qiymat bilan ishlaydi
const monthOptions = MONTH_OPTIONS.map(({ label, value }) => ({
  label,
  value: String(value),
}));
const yearOptions = YEAR_OPTIONS.map(({ label, value }) => ({
  label,
  value: String(value),
}));

/**
 * Xodimning oylik davomati.
 *
 * O'quvchi versiyasidan (`StudentAttendanceSummary`) farqi — bu yerda kelish
 * va ketish vaqtlari ko'rsatiladi: xodimning kechikishi aynan shu vaqtdan
 * hisoblanadi.
 */
const StaffAttendanceSummary = ({ userId }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "user", userId, month, year],
    queryFn: () =>
      attendanceAPI.getUserMonthRecords(userId, month, year).then((r) => r.data),
    enabled: Boolean(userId),
  });

  const records = data?.records ?? [];
  const summary = data?.summary ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-gray-900">Oylik davomat</h2>

        <div className="flex gap-2">
          <Select
            options={monthOptions}
            value={String(month)}
            triggerClassName="w-32"
            onChange={(value) => setMonth(Number(value))}
          />

          <Select
            options={yearOptions}
            value={String(year)}
            triggerClassName="w-24"
            onChange={(value) => setYear(Number(value))}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {USER_SUMMARY_ITEMS.map(({ key, label, color }) => (
              <div
                key={key}
                className={cn("rounded-xl px-3 py-2.5 text-center", color)}
              >
                <p className="text-xl font-bold">{summary[key] ?? 0}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Bu oy uchun davomat ma'lumoti yo'q
            </p>
          ) : (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <span className="text-gray-600">
                    {formatDateUZ(record.date)}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimeUZ(record.checkIn)} —{" "}
                      {formatTimeUZ(record.checkOut)}
                    </span>

                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                        STATUS_COLORS[record.status],
                      )}
                    >
                      {STATUS_LABELS[record.status]}
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

export default StaffAttendanceSummary;
