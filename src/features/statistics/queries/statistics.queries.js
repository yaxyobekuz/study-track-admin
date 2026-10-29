// TanStack Query
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { statisticsAPI } from "../api/statistics.api";

export const statisticsKeys = createQueryKeys("statistics");

/**
 * REYTING JONLI: baho qo'yilishi bilan ball o'zgaradi. Shuning uchun
 * `staleTime` qisqa — yangi baho tez ko'rinsin, lekin bosh sahifaga har
 * qaytganda so'rov qayta ketmasin.
 */
const STALE = 60 * 1000;

export const statisticsQueries = {
  /**
   * Bosh sahifadagi "O'quvchilar natijalari" kartasi — eng yuqori va eng
   * past beshtalik.
   *
   * ⚠️ MANBA — Statistika bo'limining O'ZI (`/statistics/weekly/school/top`),
   * ya'ni kartadagi ball bilan bo'limdagi "Umumiy ball" AYNI raqam. Davr
   * kalitlari ham o'sha: "day" | "week" | "month" | "year".
   */
  schoolTop: (params) =>
    queryOptions({
      queryKey: [...statisticsKeys.all, "school-top", params],
      queryFn: () => statisticsAPI.getSchoolTop(params).then((r) => r.data.data),
      // Davr almashtirilganda karta bo'shamaydi — balandligi sakramasin
      placeholderData: keepPreviousData,
      staleTime: STALE,
    }),
};
