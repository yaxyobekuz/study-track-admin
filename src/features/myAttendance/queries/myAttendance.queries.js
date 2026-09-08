// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { myAttendanceAPI } from "../api/myAttendance.api";

/**
 * ⚠️ ILDIZ KALIT `attendance` DAN ALOHIDA (`myAttendance`).
 *
 * Boshqa xodimning davomatini belgilash `attendanceKeys.all` ni eskirtiradi;
 * agar o'z davomatim ham shu ildizda tursa, kassir birovni belgilaganda
 * mening check-in kartam ham qayta yuklanardi — va aksincha, o'zimni qayd
 * etganda butun ma'muriy bo'lim eskirardi.
 */
export const myAttendanceKeys = createQueryKeys("myAttendance");

export const myAttendanceQueries = {
  /** Bugungi yozuvim → `{ checkIn, checkOut, status, ... }` yoki `null`. */
  today: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "today"],
      queryFn: () => myAttendanceAPI.getToday().then((r) => r.data.data),
      // Kartada "keldi/ketdi" turadi — boshqa qurilmadan qayd etilgan
      // bo'lsa ham bir daqiqada o'zi yangilanadi.
      refetchInterval: 60_000,
    }),

  /** Bugungi effektiv ish jadvalim → `{ workStartTime, workEndTime, ... }`. */
  schedule: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "schedule"],
      queryFn: () => myAttendanceAPI.getMySchedule().then((r) => r.data.data),
    }),

  /**
   * Oylik tarixim → `{ records, summary }`.
   * Oy almashganda eski ma'lumot ekranda qoladi — ‹ › tugmalari bosilganda
   * kalendar "sakramaydi" (`UserAttendancePanel` bilan bir xil xulq).
   */
  month: (month, year) =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "month", month, year],
      queryFn: () => myAttendanceAPI.getMyHistory(month, year).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Mening uzrli so'rovlarim → massiv. */
  excuses: (params) =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "excuses", params],
      queryFn: () => myAttendanceAPI.getMyExcuses(params).then((r) => r.data.data),
    }),

  /** O'z rolimga tegishli kelmaslik sabablari → massiv. */
  absenceReasons: () =>
    queryOptions({
      queryKey: [...myAttendanceKeys.all, "absence-reasons"],
      queryFn: () => myAttendanceAPI.getAbsenceReasons().then((r) => r.data.data),
    }),
};
