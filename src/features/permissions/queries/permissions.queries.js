// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";

// API
import { permissionsAPI } from "../api/permissions.api";

export const permissionsKeys = createQueryKeys("permissions");

export const permissionsQueries = {
  /** Owner'dan tashqari xodimlar + joriy ruxsatlari. */
  staff: () =>
    queryOptions({
      queryKey: [...permissionsKeys.all, "staff"],
      queryFn: () => permissionsAPI.getStaff().then((r) => r.data.data),
    }),
};

/**
 * Xodimlar ro'yxati, owner-gated (`/permissions/*` endpointlari owner-only,
 * shuning uchun non-owner uchun so'rov yuborilmaydi).
 */
export const useStaff = () => {
  const { user } = useAuth();
  return useQuery({
    ...permissionsQueries.staff(),
    enabled: user?.role === "owner",
  });
};
