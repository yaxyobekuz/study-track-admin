// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";
import { attendanceAPI } from "../api/attendance.api";
import { studentAttendanceAPI } from "../api/studentAttendance.api";

export const attendanceKeys = createQueryKeys("attendance");

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
