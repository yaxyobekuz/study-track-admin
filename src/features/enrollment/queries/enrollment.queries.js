// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { enrollmentAPI } from "../api/enrollment.api";

export const enrollmentKeys = createQueryKeys("enrollment");

export const enrollmentQueries = {
  /** Bitta o'quvchining davrlari + hozirgi holati + joriy oy ulushi. */
  forStudent: (studentId) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "student", studentId],
      queryFn: () => enrollmentAPI.getForStudent(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /**
   * Davr shu sanalar bilan saqlansa hisob-fakturalar bilan NIMA bo'ladi:
   * to'liq to'lanadigan ketish oyi va bekor qilinadigan oylar. Yopish va
   * tahrirlash oynasi saqlashdan oldin ko'rsatadi.
   *
   * @param {string} id - davr id
   * @param {{startDate?: string, endDate?: string|null}} data
   */
  preview: (id, data) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "preview", id, data],
      queryFn: () => enrollmentAPI.preview(id, data).then((r) => r.data.data),
      enabled: Boolean(id),
      placeholderData: keepPreviousData,
      // Noto'g'ri sana 400 qaytaradi — qayta urinish foydasiz
      retry: false,
    }),

  /** Umumiy ro'yxat (sahifalangan) — kelajakdagi alohida ekran uchun. */
  list: (params) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "list", params],
      queryFn: () => enrollmentAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
