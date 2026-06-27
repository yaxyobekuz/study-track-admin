// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// Toast
import { toast } from "sonner";

// API
import { attendanceAPI } from "../api/attendance.api";

// Components
import Select from "@/shared/components/ui/select/Select";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import AttendanceMarkTable from "../components/AttendanceMarkTable";
import MarkToolbar from "../components/MarkToolbar";

// Data & hooks
import { SUMMARY_CARDS } from "../data/studentAttendance.data";
import { buildRoleOptions, buildRoleLabelMap } from "../data/attendance.data";
import useMarkAttendance from "../hooks/useMarkAttendance";
import useArrayStore from "@/shared/hooks/useArrayStore";

const MarkStaffPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [role, setRole] = useState("");
  const queryClient = useQueryClient();

  const { getCollectionData } = useArrayStore("roles");
  const allRoles = getCollectionData();
  const roles = allRoles.filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );
  const roleOptions = buildRoleOptions(roles);
  const roleLabelMap = buildRoleLabelMap(allRoles);

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["attendance", "mark-staff", { role, date }],
    queryFn: () =>
      attendanceAPI
        .getTodayAll({ role: role || undefined, date })
        .then((r) => r.data),
    refetchOnWindowFocus: false,
  });

  const rows = data?.rows || [];

  // Ism-familiya bo'yicha A-Z + belgilash uchun normalizatsiya
  const people = [...rows]
    .sort((a, b) => {
      const an = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`;
      const bn = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`;
      return an.localeCompare(bn);
    })
    .map((r) => {
      // Xodimlarda belgilanmagan (not_marked) -> dastlab tanlanmagan
      const persisted = r.status && r.status !== "not_marked" ? r.status : null;
      return {
        id: r.user._id,
        name: `${r.user.firstName} ${r.user.lastName}`,
        subtitle: roleLabelMap[r.user.role] || r.user.role,
        originalStatus: persisted,
        defaultStatus: persisted,
        originalReason: r.excuseReason || "",
      };
    });

  const syncKey = data ? dataUpdatedAt : null;
  const { marks, setStatus, setReason, setAll, dirty, counts } =
    useMarkAttendance(people, syncKey);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload) => attendanceAPI.markStaff(payload),
    onSuccess: () => {
      toast.success("Xodimlar davomati saqlandi");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSave = () => {
    if (dirty.length === 0) return;
    save({
      date,
      records: dirty.map((p) => ({
        userId: p.id,
        status: marks[p.id].status,
        excuseReason:
          marks[p.id].status === "excused"
            ? marks[p.id].excuseReason
            : undefined,
      })),
    });
  };

  return (
    <div className="space-y-4">
      {/* Rol filtri - layoutdagi tablar qatoriga portal orqali */}
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

      {/* Jonli yig'indi (joriy tanlovlar bo'yicha) */}
      {!isLoading && rows.length > 0 && (
        <AttendanceSummaryCards
          cards={SUMMARY_CARDS}
          summary={counts}
          className="sm:grid-cols-3 lg:grid-cols-5"
        />
      )}

      {/* Belgilash paneli */}
      {!isLoading && rows.length > 0 && (
        <MarkToolbar
          onBulk={setAll}
          dirtyCount={dirty.length}
          onSave={handleSave}
          isSaving={isPending}
        />
      )}

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <AttendanceMarkTable
          people={people}
          marks={marks}
          onStatusChange={setStatus}
          onReasonChange={setReason}
        />
      )}
    </div>
  );
};

export default MarkStaffPage;
