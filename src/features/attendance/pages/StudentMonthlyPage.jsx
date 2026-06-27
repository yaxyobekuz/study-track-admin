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
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import StudentAttendanceMonthTable from "../components/StudentAttendanceMonthTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Data
import { STATUS_SUMMARY_CARDS, STATUS_FILTER_OPTIONS } from "../data/attendance.data";

// Tanlangan holatga ega (kamida bitta kun) o'quvchilar yozuvlarini qoldiradi
const filterRecordsByStatus = (records, status) => {
  if (!status) return records;
  const matchedIds = new Set(
    records
      .filter((r) => r.status === status)
      .map((r) => String(r.student?._id || r.student)),
  );
  return records.filter((r) =>
    matchedIds.has(String(r.student?._id || r.student)),
  );
};

const StudentMonthlyPage = () => {
  const { month, year, filterSlot } = useOutletContext();
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");

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
  const tableRecords = filterRecordsByStatus(records, status);

  return (
    <div className="space-y-4">
      {/* Sinf va holat filtri - layoutdagi tablar qatoriga portal orqali joylanadi */}
      {filterSlot &&
        createPortal(
          <>
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
            />

            <Select
              value={status || "all"}
              triggerClassName="min-w-40"
              placeholder="Barcha holatlar"
              options={STATUS_FILTER_OPTIONS}
              onChange={(v) => setStatus(v === "all" ? "" : v)}
            />
          </>,
          filterSlot,
        )}

      {/* Yig'indi */}
      {!isLoading && records.length > 0 && (
        <AttendanceSummaryCards
          cards={STATUS_SUMMARY_CARDS}
          summary={summary}
          className="sm:grid-cols-4"
        />
      )}

      {/* Jadval (Xodimlar oylik jadvali singari kun matritsasi) */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceMonthTable
          records={tableRecords}
          month={month}
          year={year}
        />
      )}
    </div>
  );
};

export default StudentMonthlyPage;
