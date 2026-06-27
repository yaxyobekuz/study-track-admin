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
import { studentAttendanceAPI } from "../api/studentAttendance.api";

// Components
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import AttendanceMarkTable from "../components/AttendanceMarkTable";
import MarkToolbar from "../components/MarkToolbar";

// Data & hooks
import { SUMMARY_CARDS } from "../data/studentAttendance.data";
import useMarkAttendance from "../hooks/useMarkAttendance";

const MarkStudentsPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [classId, setClassId] = useState("");
  const queryClient = useQueryClient();

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });
  const classes = classesData || [];
  const selectedClassId = classId || classes[0]?._id || "";

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["studentAttendance", "mark", selectedClassId, date],
    queryFn: () =>
      studentAttendanceAPI
        .getTodayClass(selectedClassId, date)
        .then((r) => r.data),
    enabled: !!selectedClassId,
    refetchOnWindowFocus: false,
  });

  const students = data?.students || [];

  // Familiya-ism bo'yicha A-Z + belgilash uchun normalizatsiya
  const people = [...students]
    .sort((a, b) => {
      const an = `${a.student?.lastName || ""} ${a.student?.firstName || ""}`;
      const bn = `${b.student?.lastName || ""} ${b.student?.firstName || ""}`;
      return an.localeCompare(bn);
    })
    .map(({ student, attendance }) => ({
      id: student._id,
      name: `${student.lastName} ${student.firstName}`,
      subtitle: null,
      originalStatus: attendance?.status || null,
      defaultStatus: attendance?.status || "present", // belgilanmagan -> "Keldi"
      originalReason: attendance?.excuseReason || "",
    }));

  const syncKey = data ? dataUpdatedAt : null;
  const { marks, setStatus, setReason, setAll, dirty, counts } =
    useMarkAttendance(people, syncKey);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload) => studentAttendanceAPI.mark(payload),
    onSuccess: () => {
      toast.success("O'quvchilar davomati saqlandi");
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSave = () => {
    if (!selectedClassId || dirty.length === 0) return;
    save({
      classId: selectedClassId,
      date,
      records: dirty.map((p) => ({
        studentId: p.id,
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
      {/* Sinf tanlash (qidiruvli) - layoutdagi tablar qatoriga portal orqali */}
      {filterSlot &&
        createPortal(
          <SelectSearch
            value={selectedClassId || undefined}
            triggerClassName="min-w-44"
            placeholder="Sinfni tanlang"
            searchPlaceholder="Sinfni qidirish..."
            emptyText="Sinf topilmadi"
            onChange={(v) => setClassId(v)}
            options={classes.map((cls) => ({
              label: cls.name,
              value: cls._id,
            }))}
          />,
          filterSlot,
        )}

      {/* Jonli yig'indi (joriy tanlovlar bo'yicha) */}
      {!isLoading && students.length > 0 && (
        <AttendanceSummaryCards
          cards={SUMMARY_CARDS}
          summary={counts}
          className="sm:grid-cols-3 lg:grid-cols-5"
        />
      )}

      {/* Belgilash paneli */}
      {!isLoading && students.length > 0 && (
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

export default MarkStudentsPage;
