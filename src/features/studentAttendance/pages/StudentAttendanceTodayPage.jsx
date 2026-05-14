import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { studentAttendanceAPI } from "../api/studentAttendance.api";
import { SUMMARY_CARDS } from "../data/studentAttendance.data";
import StudentAttendanceTodayTable from "../components/StudentAttendanceTodayTable";
import { formatDateUZ } from "@/shared/utils/date.utils";

const StudentAttendanceTodayPage = () => {
  const [classId, setClassId] = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });

  const classes = classesData || [];

  const selectedClassId = classId || classes[0]?._id || "";

  const { data, isLoading } = useQuery({
    queryKey: ["studentAttendance", "today", selectedClassId],
    queryFn: () =>
      studentAttendanceAPI.getTodayClass(selectedClassId).then((r) => r.data),
    enabled: !!selectedClassId,
    refetchInterval: 30000,
  });

  const students = data?.students || [];
  const summary = data?.summary || {};
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">O'quvchilar bugungi davomati</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDateUZ(today)}</p>
        </div>

        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={selectedClassId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

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

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTodayTable students={students} />
      )}
    </div>
  );
};

export default StudentAttendanceTodayPage;
