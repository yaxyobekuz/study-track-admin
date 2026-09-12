// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { scheduleSyncAPI } from "../api/scheduleSync.api";

// Keys
import { scheduleSyncKeys } from "./scheduleSync.queries";

// Helpers
import {
  errorReason,
  errorStatus,
  isStaleConflict,
  isViewRefreshError,
} from "../helpers/scheduleSync.helpers";

// Amaldagi jadvaldan hosil bo'ladigan keshlar. Qo'llash / almashtirish /
// tiklash BUTUN MAKTAB jadvalini almashtiradi — ularning hammasi eskiradi.
import { schedulesKeys } from "@/features/schedules/queries/schedules.queries";
import { gradesKeys } from "@/features/grades/queries/grades.queries";
import { topicsKeys } from "@/features/subjects/queries/topics.queries";
import { lessonHoursKeys } from "@/features/lessonHours/queries/lessonHours.queries";
import { payrollKeys } from "@/features/payroll/queries/payroll.queries";
import {
  attendanceKeys,
  studentAttendanceKeys,
  attendanceReportsKeys,
} from "@/features/attendance/queries/attendance.queries";
import { myAttendanceKeys } from "@/features/myAttendance/queries/myAttendance.queries";
import { usersKeys } from "@/features/users/queries/users.queries";
import { plannerKeys } from "@/features/schedule-planner/queries/planner.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

/**
 * Jadvalga TEGMAYDIGAN amallardan keyin (tekshirish, sozlash, rad etish,
 * moslash): holat, tarix, ko'rinish va moslashlar.
 */
const useInvalidateSyncViews = () => {
  const qc = useQueryClient();

  return () => {
    qc.invalidateQueries({ queryKey: scheduleSyncKeys.status() });
    qc.invalidateQueries({ queryKey: scheduleSyncKeys.revisions() });
    qc.invalidateQueries({ queryKey: scheduleSyncKeys.revision() });
    qc.invalidateQueries({ queryKey: scheduleSyncKeys.mappings() });
  };
};

/**
 * Amaldagi jadval ALMASHGANDAN keyin. `attendanceReportsKeys.all` qo'lda
 * yozilgan `["attendanceReports", ...]` kalitini ham qamraydi, `schedulesKeys.all`
 * esa dashboarddagi `["schedules", "all-today"]` ni.
 */
const useInvalidateTimetable = () => {
  const qc = useQueryClient();

  return () => {
    [
      scheduleSyncKeys.all,
      schedulesKeys.all,
      gradesKeys.all,
      topicsKeys.all,
      lessonHoursKeys.all,
      payrollKeys.all,
      attendanceKeys.all,
      myAttendanceKeys.all,
      studentAttendanceKeys.all,
      attendanceReportsKeys.all,
      usersKeys.all,
      plannerKeys.all,
      // "Belgilangan oylik" kartasi dars soatidan hisoblanadi
      dashboardKeys.all,
    ].forEach((queryKey) => qc.invalidateQueries({ queryKey }));
  };
};

/**
 * Rad etilgan so'rovdan keyin ko'rinishni qayta o'qitadi (so'rov
 * TAKRORLANMAYDI — odam yangi holatni ko'rib qaytadan tasdiqlaydi):
 *
 * - 409 "ko'rinish eskirgan" — butun bo'lim;
 * - 400 `ack_required` / `validation` — holat va ochiq ko'rinishlar: yangi
 *   talab qilingan tasdiq katak bo'lib chiqadi, yangi xato ro'yxatga
 *   tushadi. Xeshlar o'zgarmasa, odamning belgilagan tasdiqlari saqlanadi
 *   (ko'rinish `key` bo'yicha qayta chizilmaydi).
 */
const useRefreshOnConflict = () => {
  const qc = useQueryClient();

  return (err) => {
    const alreadyInMode =
      errorStatus(err) === 409 && errorReason(err) === "already_in_mode";

    if (isStaleConflict(err) || alreadyInMode) {
      qc.invalidateQueries({ queryKey: scheduleSyncKeys.all });
      return;
    }

    if (isViewRefreshError(err)) {
      qc.invalidateQueries({ queryKey: scheduleSyncKeys.status() });
      qc.invalidateQueries({ queryKey: scheduleSyncKeys.revision() });
      qc.invalidateQueries({ queryKey: scheduleSyncKeys.snapshot() });
    }
  };
};

/**
 * Sheet'ni hozir o'qish → `{ created, revision }`.
 *
 * Xato bo'lsa ham holat yangilanadi: server oxirgi tekshiruv xatosini
 * yozib qo'yadi va "Holat" tabida ko'rinishi kerak.
 */
export const useCheckSheet = () => {
  const invalidate = useInvalidateSyncViews();

  return useMutation({
    mutationFn: () => scheduleSyncAPI.check().then((r) => r.data.data),
    onSettled: invalidate,
  });
};

/** Havoladagi varaqlar — keshga tegmaydi (bir martalik so'rov). */
export const useInspectSheet = () =>
  useMutation({
    mutationFn: (sheetUrl) =>
      scheduleSyncAPI.inspect(sheetUrl).then((r) => r.data.data),
  });

/** Havola, varaq va avtomatik tekshirishni saqlash. */
export const useSaveSyncConfig = () => {
  const invalidate = useInvalidateSyncViews();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: (data) =>
      scheduleSyncAPI.updateConfig(data).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};

/** O'zgarishni rad etish (eng oxirgisi bo'lmasa — 409 `not_latest`). */
export const useRejectRevision = () => {
  const invalidate = useInvalidateSyncViews();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: ({ id, reason }) =>
      scheduleSyncAPI.rejectRevision(id, { reason }).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};

/**
 * Moslashlarni saqlash — barcha tahrirlar BITTA so'rovda.
 * Ko'rinish qayta o'qiladi: server nomlarni yangi moslash bilan qayta
 * bog'laydi va farq o'zgaradi.
 */
export const useSaveMappings = () => {
  const invalidate = useInvalidateSyncViews();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: (items) =>
      scheduleSyncAPI.saveMappings(items).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};

/** Sheet o'zgarishini qo'llash. */
export const useApplyRevision = () => {
  const invalidate = useInvalidateTimetable();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: ({ id, ...data }) =>
      scheduleSyncAPI.applyRevision(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};

/** Manbani almashtirish (platforma ↔ sheet). */
export const useSwitchSource = () => {
  const invalidate = useInvalidateTimetable();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: (data) =>
      scheduleSyncAPI.switchSource(data).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};

/** Versiyani tiklash. */
export const useRestoreSnapshot = () => {
  const invalidate = useInvalidateTimetable();
  const refreshOnConflict = useRefreshOnConflict();

  return useMutation({
    mutationFn: ({ id, ...data }) =>
      scheduleSyncAPI.restoreSnapshot(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
    onError: refreshOnConflict,
  });
};
