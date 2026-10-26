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

  /** Boshlanish vaqti (sozlama). */
  settings: () =>
    queryOptions({
      queryKey: [...dormAttendanceKeys.all, "settings"],
      queryFn: () => dormAttendanceAPI.getSettings().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),
};
