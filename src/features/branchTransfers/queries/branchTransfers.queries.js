// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { branchTransfersAPI } from "../api/branchTransfers.api";

export const branchTransfersKeys = createQueryKeys("branchTransfers");

export const branchTransfersQueries = {
  /** Jurnal — `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: branchTransfersKeys.list(params),
      queryFn: () => branchTransfersAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Maqsad filial sinflari (filial tanlanganda). */
  targetClasses: (branchId) =>
    queryOptions({
      queryKey: [...branchTransfersKeys.all, "targetClasses", branchId],
      queryFn: () => branchTransfersAPI.getTargetClasses(branchId).then((r) => r.data.data),
      enabled: Boolean(branchId),
    }),

  /** Odamning filiallararo tarixi (profil kartasi). */
  userTransfers: (userId) =>
    queryOptions({
      queryKey: [...branchTransfersKeys.all, "user", userId],
      queryFn: () => branchTransfersAPI.getUserTransfers(userId).then((r) => r.data.data),
      enabled: Boolean(userId),
    }),

  /** Xodimning oyligi filiallar kesimida. */
  userPayroll: (userId, months = 6) =>
    queryOptions({
      queryKey: [...branchTransfersKeys.all, "userPayroll", userId, months],
      queryFn: () =>
        branchTransfersAPI.getUserPayroll(userId, { months }).then((r) => r.data.data),
      enabled: Boolean(userId),
    }),
};
