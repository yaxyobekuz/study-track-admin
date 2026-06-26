// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// API
import { studentAttendanceAPI } from "../api/studentAttendance.api";

// Components
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import StudentAttendanceTodayTable from "../components/StudentAttendanceTodayTable";

// Data
import { SUMMARY_CARDS } from "../data/studentAttendance.data";

const StudentDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [classId, setClassId] = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });

  const classes = classesData || [];
  const selectedClassId = classId || classes[0]?._id || "";

  const { data, isLoading } = useQuery({
    queryKey: ["studentAttendance", "today", selectedClassId, date],
    queryFn: () =>
      studentAttendanceAPI
        .getTodayClass(selectedClassId, date)
        .then((r) => r.data),
    enabled: !!selectedClassId,
    refetchInterval: 30000,
  });

  const students = data?.students || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-4">
      {/* Sinf filtri (qidiruvli) - layoutdagi tablar qatoriga portal orqali joylanadi */}
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

      {/* Yig'indi */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTodayTable students={students} />
      )}
    </div>
  );
};

export default StudentDailyPage;
