// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// API
import { studentAttendanceAPI } from "../api/studentAttendance.api";

// Components
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import StudentAttendanceMonthTable from "../components/StudentAttendanceMonthTable";

// Data
import { SUMMARY_CARDS } from "../data/studentAttendance.data";

const StudentMonthlyPage = () => {
  const { month, year } = useOutletContext();
  const [classId, setClassId] = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });
  const classes = classesData || [];

  // Oylik davomat sinf bo'yicha ko'rsatiladi - bitta sinf tanlanadi (default - birinchisi)
  const selectedClassId = classId || classes[0]?._id || "";

  const { data, isLoading } = useQuery({
    queryKey: ["studentAttendance", "class-month", selectedClassId, month, year],
    queryFn: () =>
      studentAttendanceAPI
        .getClassMonthRecords(selectedClassId, month, year)
        .then((r) => r.data),
    enabled: !!selectedClassId,
  });

  const records = data?.records || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-4">
      {/* Sinf tanlash (qidiruvli - oylik davomat sinf bo'yicha ko'rsatiladi) */}
      <div className="flex justify-end">
        <SelectSearch
          value={selectedClassId || undefined}
          triggerClassName="min-w-44"
          placeholder="Sinfni tanlang"
          searchPlaceholder="Sinfni qidirish..."
          emptyText="Sinf topilmadi"
          onChange={(v) => setClassId(v)}
          options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
        />
      </div>

      {/* Yig'indi */}
      {!isLoading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CARDS.filter((c) => c.key !== "unmarked").map(
            ({ key, label, color }) => (
              <div
                key={key}
                className={`rounded-xl px-4 py-3 text-center ${color}`}
              >
                <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ),
          )}
        </div>
      )}

      {/* Jadval (Xodimlar oylik jadvali singari kun matritsasi) */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceMonthTable
          records={records}
          month={month}
          year={year}
        />
      )}
    </div>
  );
};

export default StudentMonthlyPage;
