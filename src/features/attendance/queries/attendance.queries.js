// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";
import { attendanceAPI } from "../api/attendance.api";

export const attendanceKeys = createQueryKeys("attendance");

export const attendanceQueries = {
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
