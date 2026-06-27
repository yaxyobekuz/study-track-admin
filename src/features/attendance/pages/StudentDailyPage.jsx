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
import Pagination from "@/shared/components/ui/Pagination";
import StudentAttendanceTodayTable from "../components/StudentAttendanceTodayTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Data
import { SUMMARY_CARDS } from "../data/studentAttendance.data";
import { STUDENT_DAILY_STATUS_OPTIONS } from "../data/attendance.data";

const ALL_CLASSES = "all";

const StudentDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [classId, setClassId] = useState(""); // "" => birinchi sinf, "all" => barcha sinflar
  const [status, setStatus] = useState(""); // "" => barcha holatlar
  const [page, setPage] = useState(1);

  const { data: classesData } = useQuery({
    queryKey: ["studentAttendance", "classes"],
    queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
  });

  const classes = classesData || [];
  const firstClassId = classes[0]?._id || "";
  const isAll = classId === ALL_CLASSES;
  const perClassId = isAll ? "" : classId || firstClassId;
  const selectValue = classId || firstClassId; // SelectSearch ko'rsatadigan qiymat

  // Sinf / holat / sana o'zgarsa sahifani boshiga qaytaramiz (render vaqtida, effektsiz)
  const resetKey = `${date}|${status}|${classId}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  // Bitta sinf ko'rinishi
  const classQuery = useQuery({
    queryKey: ["studentAttendance", "today", perClassId, date],
    queryFn: () =>
      studentAttendanceAPI.getTodayClass(perClassId, date).then((r) => r.data),
    enabled: !isAll && !!perClassId,
    refetchInterval: 30000,
  });

  // Barcha sinflar ko'rinishi (sahifalangan)
  const allQuery = useQuery({
    queryKey: ["studentAttendance", "today-all", { date, status, page }],
    queryFn: () =>
      studentAttendanceAPI
        .getTodayAll({
          date,
          status: status || undefined,
          page,
          limit: 20,
        })
        .then((r) => r.data),
    enabled: isAll,
    refetchInterval: 30000,
  });

  const data = isAll ? allQuery.data : classQuery.data;
  const isLoading = isAll ? allQuery.isLoading : classQuery.isLoading;

  let students = data?.students || [];
  const summary = data?.summary || {};
  const pagination = isAll ? data?.pagination : null;

  // Bitta sinf ko'rinishida status filtri mijoz tomonda qo'llanadi
  // (barcha sinflarda esa server tomonda filtrlanadi)
  if (!isAll && status) {
    students = students.filter(({ attendance }) =>
      status === "unmarked" ? !attendance : attendance?.status === status,
    );
  }

  const classOptions = [
    { label: "Barcha sinflar", value: ALL_CLASSES },
    ...classes.map((cls) => ({ label: cls.name, value: cls._id })),
  ];

  return (
    <div className="space-y-4">
      {/* Sinf va holat filtri - layoutdagi tablar qatoriga portal orqali joylanadi */}
      {filterSlot &&
        createPortal(
          <>
            <SelectSearch
              value={selectValue || undefined}
              triggerClassName="min-w-44"
              placeholder="Sinfni tanlang"
              searchPlaceholder="Sinfni qidirish..."
              emptyText="Sinf topilmadi"
              onChange={(v) => setClassId(v)}
              options={classOptions}
            />

            <Select
              value={status || "all"}
              triggerClassName="min-w-40"
              placeholder="Barcha holatlar"
              options={STUDENT_DAILY_STATUS_OPTIONS}
              onChange={(v) => setStatus(v === "all" ? "" : v)}
            />
          </>,
          filterSlot,
        )}

      {/* Yig'indi */}
      {!isLoading && (
        <AttendanceSummaryCards
          cards={SUMMARY_CARDS}
          summary={summary}
          className="sm:grid-cols-3 lg:grid-cols-5"
        />
      )}

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTodayTable students={students} showClass={isAll} />
      )}

      {/* Sahifalash - faqat barcha sinflar ko'rinishida */}
      {isAll && pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default StudentDailyPage;
