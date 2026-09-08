// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import Pagination from "@/shared/components/ui/Pagination";
import StudentAttendanceTodayTable from "../components/StudentAttendanceTodayTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import EditStudentAttendanceModal from "../components/EditStudentAttendanceModal";

// Queries
import { studentAttendanceQueries } from "../queries/attendance.queries";

// Helpers
import { matchesNameSearch } from "@/shared/helpers/attendance.helpers";

// Data
import {
  SUMMARY_CARDS,
  SUMMARY_CARDS_GRID,
} from "../data/studentAttendance.data";
import {
  STUDENT_DAILY_STATUS_OPTIONS,
  matchesStatusFilter,
} from "../data/attendance.data";

const ALL_CLASSES = "all";

/**
 * O'quvchilar kunlik davomati.
 *
 * Yig'indi har doim butun doira (sinf yoki maktab) bo'yicha: "bugun nechta
 * bola keldi/kelmadi". Qatorga bosilganda tahrirlash oynasi ochiladi -
 * belgilanmagan o'quvchi uchun ham (yozuv yaratadi).
 */
const StudentDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const { openModal } = useModal();
  const { can } = usePermissions();
  // Tahrirlash oynasi `POST /mark` chaqiradi — sahifa esa `attendance.view`
  // bilan ochiladi. Belgilash ruxsati bo'lmasa qator bosilmaydi (403 o'rniga).
  const canMark = can("attendance.mark");
  // Default — BARCHA SINFLAR: kunlik davomat ekrani "bugun maktabda nima
  // bo'ldi" degan savolga javob beradi, bitta sinfga tushib qolgan default
  // esa qolgan sinflarni ko'rinmas qilib qo'yardi.
  const [classId, setClassId] = useState(ALL_CLASSES);
  const [status, setStatus] = useState(""); // "" => barcha holatlar
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Serverga (barcha sinflar rejimi) har harfda emas, to'xtagach yuboriladi
  const debouncedSearch = useDebounce(search.trim());

  const { data: classes = [] } = useQuery(studentAttendanceQueries.classes());
  const firstClassId = classes[0]?.id || "";
  const isAll = classId === ALL_CLASSES;
  const perClassId = isAll ? "" : classId || firstClassId;
  const selectValue = classId || firstClassId; // SelectSearch ko'rsatadigan qiymat (bo'sh => birinchi sinf)

  // Sinf / holat / qidiruv / sana o'zgarsa sahifani boshiga qaytaramiz (render vaqtida, effektsiz)
  const resetKey = `${date}|${status}|${classId}|${debouncedSearch}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  // Bitta sinf ko'rinishi
  const classQuery = useQuery({
    ...studentAttendanceQueries.todayClass(perClassId, date),
    enabled: !isAll && !!perClassId,
    refetchInterval: 30000,
  });

  // Barcha sinflar ko'rinishi (sahifalangan; filtr va qidiruv server tomonda)
  const allQuery = useQuery({
    ...studentAttendanceQueries.todayAll({
      date,
      status: status || undefined,
      search: debouncedSearch || undefined,
      page,
      limit: 20,
    }),
    enabled: isAll,
    refetchInterval: 30000,
  });

  const data = isAll ? allQuery.data : classQuery.data;
  const isLoading = isAll ? allQuery.isLoading : classQuery.isLoading;

  let students = data?.students || [];
  const summary = data?.summary || {};
  const pagination = isAll ? data?.pagination : null;

  // Bitta sinf ko'rinishida holat filtri va qidiruv mijoz tomonda qo'llanadi
  // (barcha sinflarda esa server tomonda filtrlanadi)
  if (!isAll && (status || search)) {
    students = students.filter(
      ({ student, attendance }) =>
        matchesStatusFilter(attendance?.status || null, status) &&
        matchesNameSearch(student, search),
    );
  }

  const classOptions = [
    { label: "Barcha sinflar", value: ALL_CLASSES },
    ...classes.map((cls) => ({ label: cls.name, value: cls.id })),
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

      {/* Yig'indi - butun doira bo'yicha (filtr va sahifadan qat'i nazar) */}
      {!isLoading && (
        <AttendanceSummaryCards
          cards={SUMMARY_CARDS}
          summary={summary}
          className={SUMMARY_CARDS_GRID}
        />
      )}

      {/* Qidiruv - portal slotga sig'maydi, sahifa ichida */}
      <Input
        type="search"
        value={search}
        className="sm:max-w-sm"
        placeholder="Ism yoki familiya bo'yicha qidirish..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Jadval - qatorga bosilganda tahrirlash oynasi */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTodayTable
          students={students}
          showClass={isAll}
          onRowClick={
            canMark
              ? (row) => openModal("editStudentAttendance", { row, date })
              : undefined
          }
        />
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

      {canMark && <EditStudentAttendanceModal />}
    </div>
  );
};

export default StudentDailyPage;
