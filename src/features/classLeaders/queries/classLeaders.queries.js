// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { classLeadersAPI } from "../api/classLeaders.api";

export const classLeadersKeys = createQueryKeys("classLeaders");

export const classLeadersQueries = {
  /** Xodimning sinflari + rol belgisi bor-yo'qligi (`staff.isClassLeader`). */
  staff: (staffId) =>
    queryOptions({
      queryKey: [...classLeadersKeys.all, "staff", staffId],
      queryFn: () => classLeadersAPI.getStaffClasses(staffId).then((r) => r.data.data),
      enabled: Boolean(staffId),
    }),

  /** Biriktirish oynasi: sinflar, o'quvchilar soni va kim band qilgani. */
  classOptions: (params) =>
    queryOptions({
      queryKey: [...classLeadersKeys.all, "classOptions", params ?? null],
      queryFn: () => classLeadersAPI.getClassOptions(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Registr — "kim qaysi sinfga rahbar" (sahifalanadi). */
  list: (params) =>
    queryOptions({
      queryKey: [...classLeadersKeys.all, "list", params],
      queryFn: () => classLeadersAPI.getLeaders(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
