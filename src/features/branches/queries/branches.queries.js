// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// API
import { branchesAPI } from "../api/branches.api";

export const branchesKeys = createQueryKeys("branches");

/**
 * Filial "tayyorlanmoqda" holatida bo'lsa ro'yxat qayta so'raladi.
 *
 * Yangi filial ochilganda schema yaratiladi va migratsiyalar qo'llanadi —
 * bu bir necha soniya. Server javobni kutmaydi (fonda bajaradi), shuning
 * uchun UI holatni o'zi kuzatadi.
 */
const REFETCH_WHILE_PROVISIONING = 3000;

export const branchesQueries = {
  list: (params) =>
    queryOptions({
      queryKey: branchesKeys.list(params),
      queryFn: () => branchesAPI.getAll(params).then((r) => r.data.data),
      refetchInterval: (query) => {
        const rows = query.state.data;
        if (!Array.isArray(rows)) return false;
        return rows.some((b) => b.status === "provisioning")
          ? REFETCH_WHILE_PROVISIONING
          : false;
      },
    }),

  detail: (id) =>
    queryOptions({
      queryKey: branchesKeys.detail(id),
      queryFn: () => branchesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),
};

/**
 * Filiallar ro'yxati.
 *
 * `/branches` — `branches.view` ruxsati bilan himoyalangan, shuning uchun
 * ruxsati yo'q foydalanuvchida so'rov umuman yuborilmaydi (`useRoles`
 * uslubi: owner-gated reference hook).
 *
 * @param {{includeArchived?: boolean}} [params]
 */
export const useBranches = (params) => {
  const { can } = usePermissions();
  return useQuery({
    ...branchesQueries.list(params),
    enabled: can("branches.view"),
  });
};
