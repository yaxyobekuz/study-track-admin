// TanStack Query
import { queryOptions, useQuery, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tasksAPI } from "../api/tasks.api";
import { usersAPI } from "@/features/users/api/users.api";

// Keys of the users feature — the assignable-users read shares that namespace,
// so it stays in sync with user mutations (create / archive / …).
import { usersKeys } from "@/features/users/queries/users.queries";

// Data
import { ASSIGNEES_PAGE_LIMIT } from "../data/tasks.data";

export const tasksKeys = createQueryKeys("tasks");

export const tasksQueries = {
  /** Paginated, filterable tasks list (owner) → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: tasksKeys.list(params),
      queryFn: () => tasksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Live counters for the "Asosiy" tab → `{ total, byStatus, overdue, dueSoon, ... }`. */
  stats: () =>
    queryOptions({
      queryKey: [...tasksKeys.all, "stats"],
      queryFn: () => tasksAPI.getStats().then((r) => r.data.data),
      staleTime: 30 * 1000,
    }),

  /**
   * Period report for the "Hisobotlar" tab.
   * @param {{ from: string, to: string }} params - "YYYY-MM-DD"
   */
  report: (params) =>
    queryOptions({
      queryKey: [...tasksKeys.all, "report", params],
      queryFn: () => tasksAPI.getReport(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Lavozimlar markazi dashboardi → the same payload as the report.
   * @param {{ period: "day"|"week"|"month"|"year" }} params
   */
  dashboard: (params) =>
    queryOptions({
      queryKey: [...tasksKeys.all, "dashboard", params],
      queryFn: () => tasksAPI.getDashboard(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
      // Jonli ro'yxatlar (muddati o'tganlar, tekshiruv navbati) bu
      // payload ichida — uzoq kesh ularni eskirtirardi.
      staleTime: 30 * 1000,
    }),

  /**
   * Assignee options for a DEPARTMENT HEAD (`tasks.team`) — the normal users
   * list sits behind `users.view`, which such a manager may not have.
   *
   * Response shape is flattened to `{ data }` (no pagination): one department
   * fits in a single page, and the server caps the list anyway.
   *
   * @param {{ search?: string, group?: "staff"|"student", limit?: number }} params
   */
  scopedAssignees: (params = {}) =>
    queryOptions({
      queryKey: [...tasksKeys.all, "assignees", params],
      queryFn: () => tasksAPI.getAssignees(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
    }),

  /** Task rules singleton (create/submit validation, penalties). */
  settings: () =>
    queryOptions({
      queryKey: [...tasksKeys.all, "settings"],
      queryFn: () => tasksAPI.getSettings().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),

  /** Single task by id → the task object. */
  detail: (id) =>
    queryOptions({
      queryKey: tasksKeys.detail(id),
      queryFn: () => tasksAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Assignee options for the create modal → `{ data, pagination }`.
   *
   * ⚠️ Filtered and searched ON THE SERVER. The old picker loaded the 500
   * newest users of every role: with 500+ students, staff never made it into
   * the list. Keyed under the users namespace with the users list's shape so
   * it is deduped/invalidated with the rest of users.
   *
   * `role` (lavozim) faqat xodimlarda, `classId` faqat o'quvchilarda —
   * ikkalasi ham guruh ichidagi toraytirish. `limit` — "Hammasini tanlash"
   * butun filtrni bir so'rovda olishi uchun.
   *
   * @param {{ group: "staff" | "student", search?: string, role?: string, classId?: string, limit?: number }} params
   */
  assignees: ({ group, search, role, classId, limit }) => {
    const params = {
      role: role || group,
      limit: limit || ASSIGNEES_PAGE_LIMIT,
      ...(search && { search }),
      ...(classId && { class: classId }),
    };

    return queryOptions({
      queryKey: usersKeys.list(params),
      queryFn: () => usersAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
    });
  },
};

/**
 * Assignable users for the task create picker.
 *
 * @example
 * const { data, isFetching } = useTaskAssignees({ group: "staff", search });
 */
export const useTaskAssignees = (params) => useQuery(tasksQueries.assignees(params));
