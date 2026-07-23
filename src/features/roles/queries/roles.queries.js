// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";

// API
import { rolesAPI } from "../api/roles.api";

export const rolesKeys = createQueryKeys("roles");

/** Roles are reference data — they change rarely, so cache them longer. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

export const rolesQueries = {
  list: () =>
    queryOptions({
      queryKey: rolesKeys.lists(),
      queryFn: () => rolesAPI.getAll().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
};

/**
 * Shared roles list, owner-gated (the `/roles` endpoint is owner-only, so
 * non-owners get an empty list — matching the previous global preloader).
 * TanStack dedupes this across every consumer, so calling it in many
 * components triggers a single request.
 *
 * @example
 * const { data: roles = [], isLoading } = useRoles();
 */
export const useRoles = () => {
  const { user } = useAuth();
  return useQuery({
    ...rolesQueries.list(),
    enabled: user?.role === "owner",
  });
};
