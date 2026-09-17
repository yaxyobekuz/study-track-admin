// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tutorGroupsAPI } from "../api/tutorGroups.api";

export const tutorGroupsKeys = createQueryKeys("tutorGroups");

export const tutorGroupsQueries = {
  /** Xodimning guruhlari: amaldagi/rejadagi, tugaganlari va joriy oy jami. */
  staff: (staffId) =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.all, "staff", staffId],
      queryFn: () => tutorGroupsAPI.getStaffGroups(staffId).then((r) => r.data.data),
      enabled: Boolean(staffId),
    }),

  /**
   * Biriktirish oynasi: sinflar, o'quvchilar soni va tanlangan davrda
   * (`month` … `endMonth`) kimga biriktirilgani. Davr almashganda ro'yxat
   * miltillamasin — eski natija `isPlaceholderData` bilan turadi.
   */
  classOptions: (params) =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.all, "classOptions", params],
      queryFn: () => tutorGroupsAPI.getClassOptions(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Jonli hisob — oynadagi "jami" serverdan (summa frontendda hisoblanmaydi).
   * `classIds` — bir yoki bir nechta sinf; har sinf alohida va jami.
   */
  preview: (data) =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.all, "preview", data],
      queryFn: () => tutorGroupsAPI.preview(data).then((r) => r.data.data),
      enabled: Array.isArray(data?.classIds) && data.classIds.length > 0,
      placeholderData: keepPreviousData,
    }),

  /** Guruh manzarasi: o'quvchilar, davomat, baholar, qo'shimcha oylik. */
  overview: (id, month) =>
    queryOptions({
      queryKey: [...tutorGroupsKeys.detail(id), "overview", month ?? null],
      queryFn: () =>
        tutorGroupsAPI
          .getOverview(id, month ? { month } : undefined)
          .then((r) => r.data.data),
      enabled: Boolean(id),
      placeholderData: keepPreviousData,
    }),
};
