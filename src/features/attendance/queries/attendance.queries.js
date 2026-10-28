// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";
import { attendanceAPI } from "../api/attendance.api";
import { attendanceReportAPI } from "../api/attendanceReport.api";
import { studentAttendanceAPI } from "../api/studentAttendance.api";

export const attendanceKeys = createQueryKeys("attendance");
export const studentAttendanceKeys = createQueryKeys("studentAttendance");
export const attendanceReportsKeys = createQueryKeys("attendanceReports");

export const attendanceQueries = {
  /**
   * Bitta xodimning oylik davomati → `{ user, records, summary }`.
   * Oy almashganda eski ma'lumot ekranda qoladi (keepPreviousData), shuning
   * uchun ‹ › tugmalari bosilganda panel "sakramaydi".
   */
  userMonth: (userId, month, year) =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "user", userId, month, year],
      queryFn: () =>
        attendanceAPI.getUserMonthRecords(userId, month, year).then((r) => r.data),
      enabled: Boolean(userId),
      placeholderData: keepPreviousData,
    }),

  /** Bitta o'quvchining oylik davomati → `{ student, records, summary }`. */
  studentMonth: (studentId, month, year) =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "student", studentId, month, year],
      queryFn: () =>
        studentAttendanceAPI
          .getStudentMonthRecords(studentId, month, year)
          .then((r) => r.data),
      enabled: Boolean(studentId),
      placeholderData: keepPreviousData,
    }),

  /** Paginated absence reasons (owner management) → `{ data, pagination }`. */
  absenceReasonsList: (params) =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "absence-reasons", "list", params],
      queryFn: () => absenceReasonAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** All active absence reasons (filtered by role in the mark table) → array. */
  activeAbsenceReasons: () =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "absence-reasons", "active"],
      queryFn: () => absenceReasonAPI.getActive().then((r) => r.data.data),
    }),

  /** Attendance settings singleton → the settings object. */
  settings: () =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "settings"],
      queryFn: () => attendanceAPI.getSettings().then((r) => r.data.data),
    }),

  /**
   * Darsga kelmaganlar → `{ teachers, summary, closed, message, ... }`.
   * Bugun uchun JONLI: dars boshlanishi bilan ro'yxat o'zgaradi, shuning
   * uchun daqiqada bir yangilanadi. O'tgan kun o'zgarmaydi.
   */
  /**
   * Ketish so'rovlari (rahbariyat) → `{ data, pagination, pendingCount }`.
   * O'qituvchi javobni kutib turibdi — ro'yxat yarim daqiqada bir yangilanadi.
   */
  checkoutRequests: (params) =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "checkout-requests", params],
      queryFn: () =>
        attendanceAPI.getCheckoutRequests(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      refetchInterval: 30 * 1000,
    }),

  lessonAbsentees: (date, isToday) =>
    queryOptions({
      queryKey: [...attendanceKeys.all, "lesson-absentees", date],
      queryFn: () =>
        attendanceAPI.getLessonAbsentees(date ? { date } : undefined).then((r) => r.data.data),
      refetchInterval: isToday ? 60 * 1000 : false,
      placeholderData: keepPreviousData,
    }),
};

/**
 * O'quvchilar davomati (kunlik ro'yxatlar va belgilash).
 * Hammasi `["studentAttendance", ...]` ildizida — belgilashdan keyin
 * `studentAttendanceKeys.all` bilan bir yo'la eskiradi.
 */
export const studentAttendanceQueries = {
  /** Davomat uchun sinflar ro'yxati → `[{ id, name, ... }]`. */
  classes: () =>
    queryOptions({
      queryKey: [...studentAttendanceKeys.all, "classes"],
      queryFn: () => studentAttendanceAPI.getClasses().then((r) => r.data.data),
    }),

  /** Bitta sinfning kunlik davomati → `{ classInfo, students, summary, date }`. */
  todayClass: (classId, date) =>
    queryOptions({
      queryKey: [...studentAttendanceKeys.all, "today", classId, date],
      queryFn: () =>
        studentAttendanceAPI.getTodayClass(classId, date).then((r) => r.data),
      enabled: Boolean(classId),
    }),

  /**
   * Barcha sinflar, sahifalangan → `{ students, summary, date, pagination }`.
   * `summary` sahifadan qat'i nazar butun maktab bo'yicha keladi.
   */
  todayAll: (params) =>
    queryOptions({
      queryKey: [...studentAttendanceKeys.all, "today-all", params],
      queryFn: () =>
        studentAttendanceAPI.getTodayAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Belgilash uchun to'liq ro'yxat (sahifalanmaydi) → `{ students, summary, date }`.
   * `classId` bo'lmasa barcha faol o'quvchilar.
   */
  markList: (params) =>
    queryOptions({
      queryKey: [...studentAttendanceKeys.all, "mark-list", params],
      queryFn: () =>
        studentAttendanceAPI.getMarkList(params).then((r) => r.data),
    }),

  /** Sinfning oylik davomati (kun matritsasi) → `{ records, summary }`. */
  classMonth: (classId, month, year) =>
    queryOptions({
      queryKey: [...studentAttendanceKeys.all, "class-month", classId, month, year],
      queryFn: () =>
        studentAttendanceAPI
          .getClassMonthRecords(classId, month, year)
          .then((r) => r.data),
      enabled: Boolean(classId),
    }),
};

/** Davomat hisobotlari — belgilashdan keyin foizlar ham eskiradi. */
export const attendanceReportsQueries = {
  /**
   * O'quvchilar oylik hisoboti → `{ overall, byDay, byClass, ... }`.
   *
   * ⚠️ Taqqoslash parametrlari (`day`, `compareDay`, `compareMonth`,
   * `compareYear`) KALITGA kiradi: ular javobni o'zgartiradi, ya'ni
   * kalitdan tashqarida qolsa 6-sentabrni tanlaganda ekranda 8-sentabr
   * keshdan chiqib turardi.
   */
  students: (month, year, compare = {}) =>
    queryOptions({
      queryKey: [
        ...attendanceReportsKeys.all,
        "students",
        { month, year, ...compare },
      ],
      queryFn: () =>
        attendanceReportAPI
          .getStudentReport(month, year, compare)
          .then((r) => r.data),
    }),

  /**
   * So'nggi N kundagi davomat trendi (bosh sahifadagi grafik) →
   * `{ byDay, summary }`.
   *
   * Davomat kun davomida belgilanadi, ya'ni bugungi nuqta kun davomida
   * o'sib boradi — shuning uchun ma'lumot 5 daqiqada eskiradi.
   */
  studentTrend: (days = 30) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "students", "trend", days],
      queryFn: () => attendanceReportAPI.getStudentTrend(days).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    }),

  /**
   * Bitta sinf hisoboti (kunlik / oylik / yillik) →
   * `{ classInfo, summary, concentration, students, byDay?, byMonth? }`.
   * Davr almashganda eski jadval ekranda qoladi — sahifa "sakramaydi".
   */
  studentClass: (classId, params) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "student-class", classId, params],
      queryFn: () =>
        attendanceReportAPI.getClassReport(classId, params).then((r) => r.data),
      enabled: Boolean(classId),
      placeholderData: keepPreviousData,
    }),

  /**
   * BOSH SAHIFADAGI KARTA — davr kesimidagi davomat
   * (`{ totals, previous, change, byBranch }`).
   *
   * ⚠️ Davr KALITGA kiradi: tanlagich almashganda javob o'zgaradi.
   * Eski ma'lumot ekranda qoladi (`keepPreviousData`), shuning uchun
   * karta tanlov almashganda "sakramaydi".
   *
   * Davomat kun davomida belgilanadi — ma'lumot bir daqiqada eskiradi.
   */
  studentPulse: (params) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "students", "pulse", params],
      queryFn: () =>
        attendanceReportAPI.getStudentAttendancePulse(params).then((r) => r.data.data),
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  teacherPulse: (params) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "teachers", "pulse", params],
      queryFn: () =>
        attendanceReportAPI.getTeacherAttendancePulse(params).then((r) => r.data.data),
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  /**
   * HUJJAT KO'RINISHIDAGI HISOBOT — ekrandagi nusxa ham, Word fayli ham
   * AYNI shu obyektdan quriladi (server tomonda ham bitta hisob).
   */
  studentAttendanceReport: (params) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "students", "report", params],
      queryFn: () =>
        attendanceReportAPI.getStudentAttendanceReport(params).then((r) => r.data.data),
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  teacherAttendanceReport: (params) =>
    queryOptions({
      queryKey: [...attendanceReportsKeys.all, "teachers", "report", params],
      queryFn: () =>
        attendanceReportAPI.getTeacherAttendanceReport(params).then((r) => r.data.data),
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
    }),
};
