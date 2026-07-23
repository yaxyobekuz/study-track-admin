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

export const tasksKeys = createQueryKeys("tasks");

/** Params used by the assignable-users picker in CreateTaskModal. */
const ASSIGNEES_PARAMS = { limit: 500 };

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
   * Full users list used as assignee options in the create modal. Keyed under
   * the users namespace so it is deduped/invalidated with the rest of users.
   */
  assignees: () =>
    queryOptions({
      queryKey: usersKeys.list(ASSIGNEES_PARAMS),
      queryFn: () => usersAPI.getAll(ASSIGNEES_PARAMS).then((r) => r.data.data ?? []),
      staleTime: 5 * 60 * 1000,
    }),
};

/**
 * Assignable users for the task create picker (all users, full objects).
 *
 * @example
 * const { data: users = [], isLoading } = useTaskAssignees();
 */
export const useTaskAssignees = () => useQuery(tasksQueries.assignees());
