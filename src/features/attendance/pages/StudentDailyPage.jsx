// React
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useScrollRestore from "@/shared/hooks/useScrollRestore";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import Pagination from "@/shared/components/ui/Pagination";
import StudentAttendanceTodayTable from "../components/StudentAttendanceTodayTable";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import EditStudentAttendanceModal from "../components/EditStudentAttendanceModal";
import CloseEnrollmentModal from "@/features/enrollment/components/CloseEnrollmentModal";

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
const SEARCH_DEBOUNCE_MS = 300;

// URL'dagi `?status=` faqat ro'yxatdagi qiymat bo'lsa olinadi
const STATUS_VALUES = new Set(
  STUDENT_DAILY_STATUS_OPTIONS.map((option) => option.value).filter(
    (value) => value !== "all",
  ),
);

/**
 * O'quvchilar kunlik davomati.
 *
 * Yig'indi har doim butun doira (sinf yoki maktab) bo'yicha: "bugun nechta
 * bola keldi/kelmadi".
 *
 * Ro'yxatda faqat shu kuni O'QIYOTGAN o'quvchilar (o'qish davri kunni
 * qamragan). Qatordagi amallar:
 * - qatorning o'ziga bosish — o'quvchi profili, darhol "O'qish davrlari"
 *   tabida (davrni yopish/tahrirlash, tarix);
 * - "Tahrirlash" — davomatni to'g'rilash oynasi (belgilanmagan o'quvchi
 *   uchun ham — yozuv yaratadi);
 * - "O'qishni tugatish" — profilga kirmasdan davrni yopish (profildagi AYNI
 *   oyna, ketish oyi va bekor qilinadigan hisob-fakturalar oldindan ko'rinadi).
 *
 * ⚠️ Filtrlar (sinf, holat, qidiruv, sahifa) URL'da, holatda emas: profilga
 * kirib "orqaga" qaytilganda sahifa qayta o'rnatiladi va holatdagi "Kelmadi"
 * tanlovi yo'qolib, ro'yxat boshidan ochilardi. Yozuv `replace` bilan —
 * "orqaga" filtrlar bo'ylab emas, oldingi sahifaga qaytadi.
 */
const StudentDailyPage = () => {
  const { date, filterSlot } = useOutletContext();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { can } = usePermissions();
  // Tahrirlash oynasi `POST /mark` chaqiradi — sahifa esa `attendance.view`
  // bilan ochiladi. Belgilash ruxsati bo'lmasa tugma chiqmaydi (403 o'rniga).
  const canMark = can("attendance.mark");
  // Davrni yopish — `PATCH /student-enrollments/:id/close` bilan AYNI ruxsat
  const canCloseEnrollment = can("enrollment.update");
  // Profil `GET /users/:id` ga tayanadi — ruxsatsiz qator bosilmaydi
  const canOpenProfile = can("users.view");

  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status") || "";
  const status = STATUS_VALUES.has(rawStatus) ? rawStatus : ""; // "" => barcha holatlar
  const search = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  /** Filtr yozuvi: sahifa raqami har doim boshiga qaytadi. */
  const setFilter = useCallback(
    (key, value) =>
      setSearchParams(
        (prev) => {
          if (value) prev.set(key, value);
          else prev.delete(key);
          prev.delete("page");
          return prev;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const setPage = (next) =>
    setSearchParams(
      (prev) => {
        if (next > 1) prev.set("page", String(next));
        else prev.delete("page");
        return prev;
      },
      { replace: true },
    );

  // Qidiruv inputi darhol yangilanadi, URL esa to'xtagach (serverga ham
  // har harfda emas). URL tashqaridan o'zgarsa ("orqaga") input ham
  // moslashadi — render paytida, effektsiz (`UsersListView` bilan bir xil).
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  const debounceRef = useRef(null);
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setFilter("q", value.trim()),
      SEARCH_DEBOUNCE_MS,
    );
  };
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const { data: classes = [], isSuccess: classesLoaded } = useQuery(
    studentAttendanceQueries.classes(),
  );

  // Default — BARCHA SINFLAR: kunlik davomat ekrani "bugun maktabda nima
  // bo'ldi" degan savolga javob beradi, bitta sinfga tushib qolgan default
  // esa qolgan sinflarni ko'rinmas qilib qo'yardi. URL'dagi sinf o'chirilgan
  // bo'lsa ham "Barcha sinflar"ga qaytadi (aks holda 404 bilan bo'sh ro'yxat);
  // ro'yxat hali yuklanmagan paytda esa URL'ga ishoniladi.
  const rawClassId = searchParams.get("class") || "";
  const classId =
    rawClassId &&
    (!classesLoaded || classes.some((cls) => cls.id === rawClassId))
      ? rawClassId
      : ALL_CLASSES;
  const isAll = classId === ALL_CLASSES;

  // Bitta sinf ko'rinishi
  const classQuery = useQuery({
    ...studentAttendanceQueries.todayClass(isAll ? "" : classId, date),
    enabled: !isAll,
    refetchInterval: 30000,
  });

  // Barcha sinflar ko'rinishi (sahifalangan; filtr va qidiruv server tomonda)
  const allQuery = useQuery({
    ...studentAttendanceQueries.todayAll({
      date,
      status: status || undefined,
      search: search || undefined,
      page,
      limit: 20,
    }),
    enabled: isAll,
    refetchInterval: 30000,
  });

  const data = isAll ? allQuery.data : classQuery.data;
  const isLoading = isAll ? allQuery.isLoading : classQuery.isLoading;

  // Profildan "orqaga" qaytilganda ro'yxatning o'sha joyiga qaytadi
  const saveScroll = useScrollRestore(Boolean(data));

  let students = data?.students || [];
  const summary = data?.summary || {};
  const pagination = isAll ? data?.pagination : null;

  // Bitta sinf ko'rinishida holat filtri va qidiruv mijoz tomonda qo'llanadi
  // (barcha sinflarda esa server tomonda filtrlanadi)
  if (!isAll && (status || searchInput)) {
    students = students.filter(
      ({ student, attendance }) =>
        matchesStatusFilter(attendance?.status || null, status) &&
        matchesNameSearch(student, searchInput),
    );
  }

  const classOptions = [
    { label: "Barcha sinflar", value: ALL_CLASSES },
    ...classes.map((cls) => ({ label: cls.name, value: cls.id })),
  ];

  const openProfile = (row) => {
    saveScroll();
    navigate(`/users/${row.student.id}?tab=enrollment`);
  };

  return (
    <div className="space-y-4">
      {/* Sinf va holat filtri - layoutdagi tablar qatoriga portal orqali joylanadi */}
      {filterSlot &&
        createPortal(
          <>
            <SelectSearch
              value={classId}
              triggerClassName="min-w-44"
              placeholder="Sinfni tanlang"
              searchPlaceholder="Sinfni qidirish..."
              emptyText="Sinf topilmadi"
              onChange={(v) => setFilter("class", v === ALL_CLASSES ? "" : v)}
              options={classOptions}
            />

            <Select
              value={status || "all"}
              triggerClassName="min-w-40"
              placeholder="Barcha holatlar"
              options={STUDENT_DAILY_STATUS_OPTIONS}
              onChange={(v) => setFilter("status", v === "all" ? "" : v)}
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
        value={searchInput}
        className="sm:max-w-sm"
        placeholder="Ism yoki familiya bo'yicha qidirish..."
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      {/* Jadval - qatorga bosilganda profil ochiladi */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : (
        <StudentAttendanceTodayTable
          students={students}
          showClass={isAll}
          onRowClick={canOpenProfile ? openProfile : undefined}
          onEdit={
            canMark
              ? (row) => openModal("editStudentAttendance", { row, date })
              : undefined
          }
          onCloseEnrollment={
            canCloseEnrollment
              ? (row) =>
                  openModal("closeEnrollment", {
                    period: row.enrollment,
                    student: row.student,
                    // Davomatdagi izoh ketish sababining izohiga o'tadi
                    note: row.attendance?.excuseReason || "",
                  })
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
      {canCloseEnrollment && <CloseEnrollmentModal />}
    </div>
  );
};

export default StudentDailyPage;
