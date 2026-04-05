// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { attendanceAPI } from "../api/attendance.api";

// Components
import AttendanceTable from "../components/AttendanceTable";
import AttendanceFilters from "../components/AttendanceFilters";
import AttendanceSummaryCard from "../components/AttendanceSummaryCard";

const AttendanceListPage = () => {
  const now = new Date();
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "all", { role, userId, month, year }],
    queryFn: () =>
      attendanceAPI
        .getAllRecords({
          role: role || undefined,
          userId: userId || undefined,
          month,
          year,
          limit: 200,
        })
        .then((r) => r.data),
  });

  const records = data?.data || [];

  const summary = {
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
    total: records.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <h1 className="page-title">Davomat</h1>

        {/* Filters */}
        <AttendanceFilters
          role={role}
          year={year}
          month={month}
          userId={userId}
          onRoleChange={setRole}
          onYearChange={setYear}
          onUserChange={setUserId}
          onMonthChange={setMonth}
        />
      </div>

      {!isLoading && records.length > 0 && (
        <AttendanceSummaryCard summary={summary} />
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <AttendanceTable records={records} month={month} year={year} />
      )}
    </div>
  );
};

export default AttendanceListPage;
