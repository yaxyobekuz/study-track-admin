// TanStack Query
import { queryOptions, useQuery, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import useAuth from "@/shared/hooks/useAuth";

// API
import { usersAPI } from "../api/users.api";

export const usersKeys = createQueryKeys("users");

export const usersQueries = {
  /** Paginated, filterable users list → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: usersKeys.list(params),
      queryFn: () => usersAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Single user by id → the user object. */
  detail: (id) =>
    queryOptions({
      queryKey: usersKeys.detail(id),
      queryFn: () => usersAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * All users, short form (id, fullName, role, …). Ungated reference list for
   * pickers that must work for any authenticated user (unlike `useTeachers`,
   * which is owner-gated). Filter by role client-side where needed.
   */
  allShort: () =>
    queryOptions({
      queryKey: [...usersKeys.all, "all-short"],
      queryFn: () => usersAPI.getAllShort().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),
};

/**
 * Teachers list, owner-gated (used as reference data for pickers/filters).
 * Mirrors the previous global preloader, which fetched teachers only for owners.
 *
 * @example
 * const { data: teachers = [] } = useTeachers();
 */
export const useTeachers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...usersKeys.all, "teachers"],
    queryFn: () =>
      usersAPI.getAll({ role: "teacher", limit: 200 }).then((r) => r.data.data),
    enabled: user?.role === "owner",
    staleTime: 10 * 60 * 1000,
  });
};

/** Xodim qaysi filiallarda ishlaydi — kalit `usersKeys.all` dan cho'ziladi. */
export const userBranchesKey = (id) => [...usersKeys.detail(id), "branches"];

/**
 * Xodimning filiallari, har birida O'Z roli va O'Z ruxsatlari bilan.
 *
 * Server har filial bazasidan `permissions` ni o'qib beradi — ya'ni bu
 * yagona joy bo'lib, "bu odam qayerda nima qila oladi" degan savolga
 * to'liq javob beradi.
 *
 * @param {string} id
 */
export const useUserBranches = (id) =>
  useQuery({
    queryKey: userBranchesKey(id),
    queryFn: () => usersAPI.getBranches(id).then((r) => r.data.data),
    enabled: Boolean(id),
  });
