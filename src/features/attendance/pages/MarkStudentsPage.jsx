// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useOutletContext } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import AttendanceMarkTable from "../components/AttendanceMarkTable";
import MarkToolbar from "../components/MarkToolbar";

// Queries & hooks
import {
  attendanceQueries,
  studentAttendanceQueries,
} from "../queries/attendance.queries";
import { useMarkStudentAttendance } from "../queries/attendance.mutations";
import useMarkAttendance from "../hooks/useMarkAttendance";

// Helpers
import { matchesNameSearch } from "@/shared/helpers/attendance.helpers";

// Data
import {
  SUMMARY_CARDS,
  SUMMARY_CARDS_GRID,
} from "../data/studentAttendance.data";
import {
  MARK_FILTER_OPTIONS,
  matchesStatusFilter,
} from "../data/attendance.data";

const ALL_CLASSES = "all";

/**
 * O'quvchilar davomatini belgilash.
 *
 * Ikki rejim: bitta sinf (default - birinchi sinf) yoki "Barcha sinflar" -
 * sinfma-sinf yurmasdan, masalan, bugungi barcha kelmaganlarni ochib ichidan
 * belgilash uchun. Holat filtri va qidiruv MIJOZ tomonda va SAQLANGAN
 * (serverdagi) holat bo'yicha ishlaydi: foydalanuvchi qatorni o'zgartirganda
 * u ro'yxatdan g'oyib bo'lmaydi. Default holat BO'SH - avtomatik "Keldi" yo'q.
 */
const MarkStudentsPage = () => {
  const { date, filterSlot } = useOutletContext();
  const [classId, setClassId] = useState(""); // "" => birinchi sinf, "all" => barcha sinflar
  const [statusFilter, setStatusFilter] = useState(""); // "" => barcha holatlar
  const [search, setSearch] = useState("");

  const { data: classes = [] } = useQuery(studentAttendanceQueries.classes());
  const isAll = classId === ALL_CLASSES;
  const selectedClassId = isAll ? "" : classId || classes[0]?.id || "";
  const selectValue = classId || classes[0]?.id; // SelectSearch ko'rsatadigan qiymat

  // Barcha aktiv "Kelmaslik sabablari" (jadvalda rol bo'yicha filtrlanadi)
  const { data: reasons = [] } = useQuery(
    attendanceQueries.activeAbsenceReasons(),
  );

  // Sinf rejimi - shu sinf; "Barcha sinflar" - to'liq ro'yxat BIR MARTA yuklanadi
  // (serverga faqat sana ketadi), filtr/qidiruv esa shu yerda - tez bo'lsin.
  // Belgilash paytida fokus qaytganda qayta yuklanmaydi - tanlovlar o'chib ketmasin.
  const classQuery = useQuery({
    ...studentAttendanceQueries.todayClass(selectedClassId, date),
    enabled: !isAll && !!selectedClassId,
    refetchOnWindowFocus: false,
  });
  const allQuery = useQuery({
    ...studentAttendanceQueries.markList({ date }),
    enabled: isAll,
    refetchOnWindowFocus: false,
  });
  const { data, isLoading, dataUpdatedAt } = isAll ? allQuery : classQuery;

  const students = data?.students || [];

  // Belgilash uchun normalizatsiya: sinf rejimida familiya-ism bo'yicha,
  // "Barcha sinflar"da avval sinf, keyin familiya-ism bo'yicha A-Z
  const people = students
    .map(({ student, attendance, classId: rowClassId }) => {
      const classes = Array.isArray(student.classes) ? student.classes : [];
      const cls = classes.find((c) => c?.id === rowClassId) || classes[0];
      return {
        id: student.id,
        name: `${student.lastName} ${student.firstName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        subtitle: isAll ? cls?.name || "Sinfsiz" : null,
        role: "student",
        phone: student.phone,
        parentPhone: student.parentPhone,
        classId: rowClassId || (isAll ? cls?.id : selectedClassId) || null,
        className: cls?.name || null,
        originalStatus: attendance?.status || null,
        defaultStatus: attendance?.status || null, // belgilanmagan -> BO'SH
        originalReasonId: attendance?.absenceReason || null,
        originalNote: attendance?.excuseReason || "",
      };
    })
    .sort(
      (a, b) =>
        (isAll ? (a.className || "").localeCompare(b.className || "") : 0) ||
        a.name.localeCompare(b.name),
    );

  const syncKey = data ? dataUpdatedAt : null;
  const { marks, setStatus, setReason, setNote, setAll, dirty, counts } =
    useMarkAttendance(people, syncKey);

  // Ko'rinib turgan qatorlar - SAQLANGAN holat bo'yicha (joriy tanlov emas)
  const visible = people.filter(
    (p) =>
      matchesStatusFilter(p.originalStatus, statusFilter) &&
      matchesNameSearch(p, search),
  );
  const visibleIds = visible.map((p) => p.id);

  const { mutate: save, isPending } = useMarkStudentAttendance();

  const handleSave = () => {
    if (dirty.length === 0) return;

    // "Sababli" uchun sabab majburiy
    const missing = dirty.find(
      (p) => marks[p.id].status === "excused" && !marks[p.id].absenceReasonId,
    );
    if (missing) {
      toast.warning("'Sababli' belgilangan o'quvchi uchun sabab tanlang");
      return;
    }

    // Sinfsiz o'quvchi uchun yozuv qaysi sinfga tegishli ekani noma'lum
    const noClass = dirty.find((p) => !p.classId);
    if (noClass) {
      toast.warning(`${noClass.name} - sinfga biriktirilmagan, avval sinfga qo'shing`);
      return;
    }

    save(
      {
        // Yuqori darajadagi sinf faqat sinf rejimida; har yozuvda o'z sinfi
        classId: isAll ? undefined : selectedClassId,
        date,
        records: dirty.map((p) => {
          const m = marks[p.id];
          const excused = m.status === "excused";
          return {
            studentId: p.id,
            classId: p.classId,
            status: m.status,
            absenceReason: excused ? m.absenceReasonId : undefined,
            excuseReason: excused ? m.note : undefined,
          };
        }),
      },
      {
        onSuccess: () => toast.success("O'quvchilar davomati saqlandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const classOptions = [
    { label: "Barcha sinflar", value: ALL_CLASSES },
    ...classes.map((cls) => ({ label: cls.name, value: cls.id })),
  ];

  return (
    <div className="space-y-4">
      {/* Sinf va holat filtri - layoutdagi tablar qatoriga portal orqali */}
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
              value={statusFilter || "all"}
              triggerClassName="min-w-40"
              placeholder="Barcha holatlar"
              options={MARK_FILTER_OPTIONS}
              onChange={(v) => setStatusFilter(v === "all" ? "" : v)}
            />
          </>,
          filterSlot,
        )}

      {/* Jonli yig'indi (joriy tanlovlar bo'yicha, butun ro'yxat) */}
      {!isLoading && people.length > 0 && (
        <AttendanceSummaryCards
          cards={SUMMARY_CARDS}
          summary={counts}
          className={SUMMARY_CARDS_GRID}
        />
      )}

      {/* Qidiruv - portal slotga sig'maydi, sahifa ichida */}
      {!isLoading && people.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="search"
            value={search}
            className="sm:max-w-sm"
            placeholder="Ism yoki familiya bo'yicha qidirish..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-sm text-gray-500">
            {visible.length} / {people.length} ta o&apos;quvchi ko&apos;rsatilmoqda
          </span>
        </div>
      )}

      {/* Belgilash paneli - "Barchasini belgilash" faqat ko'rinib turganlarga */}
      {!isLoading && people.length > 0 && (
        <MarkToolbar
          onBulk={(status) => setAll(status, visibleIds)}
          dirtyCount={dirty.length}
          onSave={handleSave}
          isSaving={isPending}
        />
      )}

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : people.length > 0 && visible.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          Filtrga mos o&apos;quvchi topilmadi
        </div>
      ) : (
        <AttendanceMarkTable
          showPhone
          people={visible}
          marks={marks}
          reasons={reasons}
          onStatusChange={setStatus}
          onReasonChange={setReason}
          onNoteChange={setNote}
        />
      )}
    </div>
  );
};

export default MarkStudentsPage;
