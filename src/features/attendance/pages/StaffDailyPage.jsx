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

// Data
import { STAFF_SUMMARY_CARDS, buildRoleOptions } from "../data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const StaffDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [role, setRole] = useState("");

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
  const filteredRows = role ? rows.filter((r) => r.user.role === role) : rows;

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

      {/* Yig'indi */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAFF_SUMMARY_CARDS.map(({ key, label, color }) => (
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
