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
   * @param {{ group: "staff" | "student", search?: string }} params
   */
  assignees: ({ group, search }) => {
    const params = {
      role: group,
      limit: ASSIGNEES_PAGE_LIMIT,
      ...(search && { search }),
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
