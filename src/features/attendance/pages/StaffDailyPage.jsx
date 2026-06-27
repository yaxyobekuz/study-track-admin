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
import AttendanceTodayTable from "../components/AttendanceTodayTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Data
import {
  STAFF_SUMMARY_CARDS,
  STAFF_DAILY_STATUS_OPTIONS,
  buildRoleOptions,
} from "../data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const StaffDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const { getCollectionData } = useArrayStore("roles");
  const roles = getCollectionData().filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );
  const roleOptions = buildRoleOptions(roles);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "today-all", { role, date }],
    queryFn: () =>
      attendanceAPI
        .getTodayAll({ role: role || undefined, date })
        .then((r) => r.data),
    refetchInterval: 30000,
  });

  const rows = data?.rows || [];
  const summary = data?.summary || {};
  const filteredRows = rows
    .filter((r) => (role ? r.user.role === role : true))
    .filter((r) => (status ? r.status === status : true));

  return (
    <div className="space-y-4">
      {/* Rol va holat filtri - layoutdagi tablar qatoriga portal orqali joylanadi */}
      {filterSlot &&
        createPortal(
          <>
            <Select
              value={role || "all"}
              triggerClassName="min-w-44"
              placeholder="Barcha rollar"
              options={roleOptions}
              onChange={(v) => setRole(v === "all" ? "" : v)}
            />

            <Select
              value={status || "all"}
              triggerClassName="min-w-40"
              placeholder="Barcha holatlar"
              options={STAFF_DAILY_STATUS_OPTIONS}
              onChange={(v) => setStatus(v === "all" ? "" : v)}
            />
          </>,
          filterSlot,
        )}

      {/* Yig'indi */}
      {!isLoading && (
        <AttendanceSummaryCards
          cards={STAFF_SUMMARY_CARDS}
          summary={summary}
          className="sm:grid-cols-3 lg:grid-cols-6"
        />
      )}

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <AttendanceTodayTable rows={filteredRows} />
      )}
    </div>
  );
};

export default StaffDailyPage;
