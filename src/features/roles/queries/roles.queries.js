// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";
import usePermissions from "@/shared/hooks/usePermissions";

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
  /** Yengil ro'yxat (nom + qiymat) — dropdown'lar uchun, `/roles/options`. */
  options: () =>
    queryOptions({
      queryKey: rolesKeys.list("options"),
      queryFn: () => rolesAPI.getOptions().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
};

/**
 * Shared roles list, owner-gated (the `/roles` endpoint is owner-only, so
 * non-owners get an empty list — matching the previous global preloader).
 * TanStack dedupes this across every consumer, so calling it in many
 * components triggers a single request.
 *
 * `options.enabled` — qo'shimcha shart (owner sharti BILAN BIRGA amal
 * qiladi, uning o'rniga emas): katalog kerak bo'lmagan ekranda ortiqcha
 * so'rov yuborilmasin.
 *
 * @example
 * const { data: roles = [], isLoading } = useRoles();
 */
export const useRoles = ({ enabled = true } = {}) => {
  const { user } = useAuth();
  return useQuery({
    ...rolesQueries.list(),
    enabled: enabled && user?.role === "owner",
  });
};

/**
 * Dropdown uchun yengil rollar ro'yxati (`/roles/options`, nom + qiymat).
 *
 * ⚠️ `useRoles` dan farqi RUXSATDA: to'liq ro'yxat (ruxsatlar matritsasi)
 * faqat owner uchun, bu yengil ro'yxat esa XODIM QO'SHISH huquqi bo'lgan
 * har kim uchun — "Yangi xodim" formasidagi "Rol" ro'yxati chiqishi uchun.
 * Server tomoni ham AYNI shart (`authorizePermission(users.create)`).
 * `can("users.create")` owner uchun ham `true` qaytaradi.
 *
 * @example
 * const { data: roles = [] } = useRoleOptions();
 */
export const useRoleOptions = ({ enabled = true } = {}) => {
  const { can } = usePermissions();
  return useQuery({
    ...rolesQueries.options(),
    enabled: enabled && can("users.create"),
  });
};
