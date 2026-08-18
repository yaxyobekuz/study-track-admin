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

  /** Umumiy ro'yxat (sahifalangan) — kelajakdagi alohida ekran uchun. */
  list: (params) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "list", params],
      queryFn: () => enrollmentAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
