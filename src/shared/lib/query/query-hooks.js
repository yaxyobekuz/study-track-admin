import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── useAppQuery ───────────────────────────────────────────────────────

/**
 * Wrapper around `useQuery` that normalises the Axios response.
 * Automatically extracts `response.data` so consumers work with plain data.
 *
 * @param {object} options
 * @param {readonly unknown[]} options.queryKey - TanStack query key.
 * @param {() => Promise<import("axios").AxiosResponse>} options.queryFn - Axios-based fetch function.
 * @param {boolean}  [options.enabled=true]  - Whether the query should run.
 * @param {number}   [options.staleTime]     - Override default stale time (ms).
 * @param {number}   [options.gcTime]        - Override default GC time (ms).
 * @param {number}   [options.retry]         - Number of retries on failure.
 * @param {boolean}  [options.keepPreviousData] - Keep previous data while refetching.
 * @param {Function} [options.select]        - Transform/select a subset of data.
 * @param {import("@tanstack/react-query").UseQueryOptions} [options.rest] - Any extra TanStack Query options.
 * @returns {import("@tanstack/react-query").UseQueryResult}
 *
 * @example
 * const { data, isLoading } = useAppQuery({
 *   queryKey: usersKeys.list({ page: 1 }),
 *   queryFn: () => usersAPI.getAll({ page: 1 }),
 * });
 */
export const useAppQuery = ({
  queryKey,
  queryFn,
  enabled = true,
  staleTime,
  gcTime,
  retry,
  keepPreviousData,
  select,
  ...rest
}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      return response.data;
    },
    enabled,
    ...(staleTime !== undefined && { staleTime }),
    ...(gcTime !== undefined && { gcTime }),
    ...(retry !== undefined && { retry }),
    ...(keepPreviousData && { placeholderData: (prev) => prev }),
    ...(select && { select }),
    ...rest,
  });
};

// ─── useAppMutation ────────────────────────────────────────────────────

/**
 * Wrapper around `useMutation` with built-in cache invalidation.
 * Automatically extracts `response.data` from the Axios response.
 *
 * @param {object} options
 * @param {(variables: unknown) => Promise<import("axios").AxiosResponse>} options.mutationFn - Axios-based mutation function.
 * @param {Array<readonly unknown[]>} [options.invalidateKeys=[]] - Query keys to invalidate on success.
 * @param {(data: unknown, variables: unknown) => void} [options.onSuccess] - Callback after successful mutation.
 * @param {(error: unknown, variables: unknown) => void} [options.onError] - Callback on error.
 * @param {(data: unknown, error: unknown, variables: unknown) => void} [options.onSettled] - Callback when mutation settles.
 * @param {import("@tanstack/react-query").UseMutationOptions} [options.rest] - Any extra TanStack Query options.
 * @returns {import("@tanstack/react-query").UseMutationResult}
 *
 * @example
 * const createUser = useAppMutation({
 *   mutationFn: (data) => usersAPI.create(data),
 *   invalidateKeys: [usersKeys.lists()],
 *   onSuccess: (data) => toast.success("User created"),
 * });
 *
 * createUser.mutate({ name: "John" });
 */
export const useAppMutation = ({
  mutationFn,
  invalidateKeys = [],
  onSuccess,
  onError,
  onSettled,
  ...rest
}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      return response.data;
    },
    onSuccess: async (data, variables) => {
      // Invalidate related queries
      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) => qc.invalidateQueries({ queryKey: key })),
        );
      }

      onSuccess?.(data, variables);
    },
    onError,
    onSettled,
    ...rest,
  });
};

// ─── useOptimisticMutation ─────────────────────────────────────────────

/**
 * Mutation hook with optimistic update support.
 * Cancels in-flight queries, snapshots cache, applies optimistic update,
 * and rolls back on error automatically.
 *
 * @param {object} options
 * @param {(variables: unknown) => Promise<import("axios").AxiosResponse>} options.mutationFn - Axios mutation function.
 * @param {readonly unknown[]} options.queryKey - The query key to optimistically update.
 * @param {(oldData: unknown, variables: unknown) => unknown} options.updater - Function that produces the optimistic cache state.
 * @param {Array<readonly unknown[]>} [options.invalidateKeys=[]] - Extra keys to invalidate on settle.
 * @param {(data: unknown, variables: unknown) => void} [options.onSuccess] - Called on success.
 * @param {(error: unknown, variables: unknown) => void} [options.onError] - Called on error (after rollback).
 * @returns {import("@tanstack/react-query").UseMutationResult}
 *
 * @example
 * const deleteUser = useOptimisticMutation({
 *   mutationFn: (id) => usersAPI.delete(id),
 *   queryKey: usersKeys.list({ page: 1 }),
 *   updater: (old, id) => ({
 *     ...old,
 *     data: old.data.filter((u) => u.id !== id),
 *   }),
 *   invalidateKeys: [usersKeys.lists()],
 * });
 */
export const useOptimisticMutation = ({
  mutationFn,
  queryKey,
  updater,
  invalidateKeys = [],
  onSuccess,
  onError,
}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      return response.data;
    },

    onMutate: async (variables) => {
      // Cancel running queries so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey });

      // Snapshot current value
      const previousData = qc.getQueryData(queryKey);

      // Optimistically set new value
      qc.setQueryData(queryKey, (old) => updater(old, variables));

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback to snapshot
      if (context?.previousData !== undefined) {
        qc.setQueryData(queryKey, context.previousData);
      }

      onError?.(error, variables);
    },

    onSuccess,

    onSettled: async () => {
      // Always refetch after mutation settles to ensure cache is correct
      const keysToInvalidate = [queryKey, ...invalidateKeys];
      await Promise.all(
        keysToInvalidate.map((key) => qc.invalidateQueries({ queryKey: key })),
      );
    },
  });
};
