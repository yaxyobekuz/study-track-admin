// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// API
import { attendanceAPI } from "../api/attendance.api";

// Components
import Select from "@/shared/components/ui/select/Select";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Data
import { buildRoleOptions, STATUS_SUMMARY_CARDS } from "../data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const StaffMonthlyPage = () => {
  const { month, year, filterSlot } = useOutletContext();
  const [role, setRole] = useState("");

  const { getCollectionData } = useArrayStore("roles");
  const roles = getCollectionData().filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );
  const roleOptions = buildRoleOptions(roles);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "all", { role, month, year }],
    queryFn: () =>
      attendanceAPI
        .getAllRecords({
          role: role || undefined,
          month,
          year,
          noPagination: true,
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
      {/* Rol filtri - layoutdagi tablar qatoriga portal orqali joylanadi */}
      {filterSlot &&
        createPortal(
          <Select
            value={role || "all"}
            triggerClassName="min-w-44"
            placeholder="Barcha rollar"
            options={roleOptions}
            onChange={(v) => setRole(v === "all" ? "" : v)}
          />,
          filterSlot,
        )}

      {!isLoading && records.length > 0 && (
        <AttendanceSummaryCards
          cards={STATUS_SUMMARY_CARDS}
          summary={summary}
          className="sm:grid-cols-4"
        />
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <AttendanceTable records={records} month={month} year={year} />
      )}
    </div>
  );
};

export default StaffMonthlyPage;
