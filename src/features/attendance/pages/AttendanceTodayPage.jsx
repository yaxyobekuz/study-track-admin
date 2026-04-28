// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";

// Components
import AttendanceTodayTable from "../components/AttendanceTodayTable";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const SUMMARY_CARDS = [
  { key: "total", label: "Jami", color: "bg-gray-100 text-gray-700" },
  { key: "present", label: "Keldi", color: "bg-green-100 text-green-700" },
  { key: "late", label: "Kech keldi", color: "bg-yellow-100 text-yellow-700" },
  { key: "absent", label: "Kelmadi", color: "bg-red-100 text-red-700" },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
  { key: "notMarked", label: "Belgilanmagan", color: "bg-gray-50 text-gray-400" },
];

const AttendanceTodayPage = () => {
  const [role, setRole] = useState("");

  const { getCollectionData } = useArrayStore("roles");
  const roles = getCollectionData().filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );

  const roleOptions = [
    { label: "Barcha rollar", value: "" },
    ...roles.map((r) => ({ label: r.name, value: r.value })),
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "today-all", { role }],
    queryFn: () =>
      attendanceAPI
        .getTodayAll({ role: role || undefined })
        .then((r) => r.data),
    refetchInterval: 30000,
  });

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const date = data?.date ? new Date(data.date) : new Date();

  const filteredRows = role
    ? rows.filter((r) => r.user.role === role)
    : rows;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Bugungi davomat</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDateUZ(date)}</p>
        </div>

        {/* Role filter */}
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SUMMARY_CARDS.map(({ key, label, color }) => (
            <div
              key={key}
              className={`rounded-xl px-4 py-3 text-center ${color}`}
            >
              <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <AttendanceTodayTable rows={filteredRows} />
      )}
    </div>
  );
};

export default AttendanceTodayPage;
