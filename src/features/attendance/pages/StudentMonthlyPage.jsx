// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// API
import { studentAttendanceAPI } from "../api/studentAttendance.api";

// Components
import Select from "@/shared/components/ui/select/Select";
import StudentAttendanceTable from "../components/StudentAttendanceTable";

// Data
import {
  SUMMARY_CARDS,
  STATUS_FILTER_OPTIONS,
} from "../data/studentAttendance.data";

const StudentMonthlyPage = () => {
  const { month, year } = useOutletContext();
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });
  const classes = classesData || [];

  const classOptions = [
    { label: "Barcha sinflar", value: "all" },
    ...classes.map((cls) => ({ label: cls.name, value: cls._id })),
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["studentAttendance", "all", { classId, status, month, year }],
    queryFn: () =>
      studentAttendanceAPI
        .getAllRecords({
          classId: classId || undefined,
          status: status || undefined,
          month,
          year,
          limit: 500,
        })
        .then((r) => r.data),
  });

  const records = data?.data || [];

  const summary = {
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
  };

  return (
    <div className="space-y-4">
      {/* Sinf va holat filtri */}
      <div className="flex flex-wrap justify-end gap-2">
        <Select
          value={classId || "all"}
          triggerClassName="min-w-40"
          options={classOptions}
          onChange={(v) => setClassId(v === "all" ? "" : v)}
        />

        <Select
          value={status || "all"}
          triggerClassName="min-w-40"
          options={STATUS_FILTER_OPTIONS}
          onChange={(v) => setStatus(v === "all" ? "" : v)}
        />
      </div>

      {!isLoading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CARDS.filter((c) => c.key !== "unmarked").map(
            ({ key, label, color }) => (
              <div
                key={key}
                className={`rounded-xl px-4 py-3 text-center ${color}`}
              >
                <p className="text-2xl font-bold">{summary[key]}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ),
          )}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTable records={records} />
      )}
    </div>
  );
};

export default StudentMonthlyPage;
