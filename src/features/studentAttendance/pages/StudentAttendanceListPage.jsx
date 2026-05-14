import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { studentAttendanceAPI } from "../api/studentAttendance.api";
import { MONTH_OPTIONS, SUMMARY_CARDS } from "../data/studentAttendance.data";
import StudentAttendanceTable from "../components/StudentAttendanceTable";

const StudentAttendanceListPage = () => {
  const now = new Date();
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });
  const classes = classesData || [];

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
    unmarked: 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">O'quvchilar davomati</h1>

        <div className="flex flex-wrap gap-2">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Barcha sinflar</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Barcha holatlar</option>
            <option value="present">Keldi</option>
            <option value="late">Kech keldi</option>
            <option value="absent">Kelmadi</option>
            <option value="excused">Sababli</option>
          </select>

          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isLoading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CARDS.filter((c) => c.key !== "unmarked").map(({ key, label, color }) => (
            <div key={key} className={`rounded-xl px-4 py-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{summary[key]}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
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

export default StudentAttendanceListPage;
