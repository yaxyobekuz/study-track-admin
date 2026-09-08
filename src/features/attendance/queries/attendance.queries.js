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
};
