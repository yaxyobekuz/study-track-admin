// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { dormAttendanceAPI } from "../api/dormAttendance.api";

export const dormAttendanceKeys = createQueryKeys("dormAttendance");

export const dormAttendanceQueries = {
  /**
   * Kunlik ro'yxat — javobda `summary`, `gate` va `scope` ham keladi:
   * kartalardagi sanoq, "16:00 dan boshlanadi" yozuvi va tugmalarning
   * ochiq-yopiqligi AYNI so'rovdan (server bilan panel bir xil gapiradi).
   *
   * ⚠️ `refetchOnWindowFocus: false` — tarbiyachi 100 ta qatorni
   * belgilayotganda boshqa oynaga o'tib qaytsa, ro'yxat qayta yuklanib
   * saqlanmagan tanlovlarni o'chirib yuborardi (`MarkStudentsPage` bilan
   * AYNI qaror).
   */
  day: (params) =>
    queryOptions({
      queryKey: dormAttendanceKeys.list(params),
      queryFn: () => dormAttendanceAPI.getDay(params).then((r) => r.data.data),
      refetchOnWindowFocus: false,
    }),

  /** Sinflar kesimi — butun maktab bo'yicha, sinf filtriga bog'liq emas. */
  classes: (params) =>
    queryOptions({
      queryKey: [...dormAttendanceKeys.all, "classes", params],
      queryFn: () => dormAttendanceAPI.getClasses(params).then((r) => r.data.data),
    }),

  /**
   * BITTA SINF — "guruh ichiga kirilganda" ko'rinadigan to'liq manzara:
   * kunlik ro'yxat, har o'quvchining oxirgi kunlardagi yo'nalishi va
   * sinfning kunlar kesimi.
   *
   * ⚠️ Kunlik ro'yxat bilan AYNI `refetchOnWindowFocus: false`: bu ham
   * belgilash ekrani va boshqa oynadan qaytganda saqlanmagan tanlovlar
   * o'chib ketmasligi kerak.
   */
  classDetail: (classId, params) =>
    queryOptions({
      queryKey: [...dormAttendanceKeys.detail(classId), params],
      queryFn: () =>
        dormAttendanceAPI.getClassDetail(classId, params).then((r) => r.data.data),
      enabled: Boolean(classId),
      refetchOnWindowFocus: false,
    }),

  /** Bitta o'quvchining kun-ba-kun tarixi (oyna ichida). */
  studentHistory: (studentId, params) =>
    queryOptions({
      queryKey: [...dormAttendanceKeys.all, "student", studentId, params],
      queryFn: () =>
        dormAttendanceAPI.getStudentHistory(studentId, params).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** Boshlanish vaqti (sozlama). */
  settings: () =>
    queryOptions({
      queryKey: [...dormAttendanceKeys.all, "settings"],
      queryFn: () => dormAttendanceAPI.getSettings().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),
};
