import queryClient from "@/app/query-client";

// ─── Invalidation helpers ──────────────────────────────────────────────

/**
 * Invalidates all queries whose key starts with the given key prefix.
 *
 * @param {readonly unknown[]} queryKey - The key (or prefix) to invalidate.
 * @returns {Promise<void>}
 *
 * @example
 * await invalidateQueries(usersKeys.all);        // all user queries
 * await invalidateQueries(usersKeys.lists());     // only user lists
 */
export const invalidateQueries = (queryKey) => {
  return queryClient.invalidateQueries({ queryKey });
};

/**
 * Invalidates multiple query keys at once.
 *
 * @param {Array<readonly unknown[]>} queryKeys - Array of query keys to invalidate.
 * @returns {Promise<void[]>}
 *
 * @example
 * await invalidateMany([usersKeys.all, classesKeys.all]);
 */
export const invalidateMany = (queryKeys) => {
  return Promise.all(queryKeys.map((key) => invalidateQueries(key)));
};

// ─── Refetch helpers ───────────────────────────────────────────────────

/**
 * Forces an immediate refetch for queries matching the given key.
 *
 * @param {readonly unknown[]} queryKey - The key (or prefix) to refetch.
 * @returns {Promise<void>}
 */
export const refetchQueries = (queryKey) => {
  return queryClient.refetchQueries({ queryKey });
};

// ─── Cache read / write ────────────────────────────────────────────────

/**
 * Returns cached data for a given query key without triggering a fetch.
 *
 * @param {readonly unknown[]} queryKey - The exact query key.
 * @returns {unknown | undefined} Cached data or undefined.
 *
 * @example
 * const users = getQueryData(usersKeys.list({ page: 1 }));
 */
export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

/**
 * Manually sets data in the query cache.
 *
 * @param {readonly unknown[]} queryKey - The exact query key.
 * @param {unknown} data - The data to cache.
 *
 * @example
 * setQueryData(usersKeys.detail(5), updatedUser);
 */
export const setQueryData = (queryKey, data) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * Updates cached data using an updater function (optimistic update helper).
 *
 * @param {readonly unknown[]} queryKey - The exact query key.
 * @param {(oldData: unknown) => unknown} updater - Receives old data, returns new data.
 *
 * @example
 * updateQueryData(usersKeys.list(), (old) => ({
 *   ...old,
 *   data: old.data.filter((u) => u.id !== deletedId),
 * }));
 */
export const updateQueryData = (queryKey, updater) => {
  queryClient.setQueryData(queryKey, updater);
};

// ─── Cache removal ─────────────────────────────────────────────────────

/**
 * Removes queries from the cache that match the given key.
 *
 * @param {readonly unknown[]} queryKey - The key (or prefix) to remove.
 *
 * @example
 * removeQueries(usersKeys.detail(5)); // remove single detail
 * removeQueries(usersKeys.all);       // remove all user queries
 */
export const removeQueries = (queryKey) => {
  queryClient.removeQueries({ queryKey });
};

/**
 * Clears the entire query cache (all features).
 * Useful on logout or hard reset scenarios.
 */
export const clearAllQueries = () => {
  queryClient.clear();
};

// ─── Prefetching ───────────────────────────────────────────────────────

/**
 * Prefetches a query and stores the result in cache.
 *
 * @param {readonly unknown[]} queryKey - The query key.
 * @param {() => Promise<unknown>} queryFn - The function that fetches data.
 * @param {number} [staleTime=300000] - How long (ms) the prefetched data stays fresh. Default 5 min.
 * @returns {Promise<void>}
 *
 * @example
 * await prefetchQuery(usersKeys.list({ page: 2 }), () => usersAPI.getAll({ page: 2 }));
 */
export const prefetchQuery = (queryKey, queryFn, staleTime = 5 * 60 * 1000) => {
  return queryClient.prefetchQuery({ queryKey, queryFn, staleTime });
};

// ─── TTL helpers ───────────────────────────────────────────────────────

/**
 * Sets custom stale time and GC time for existing cached queries.
 *
 * @param {readonly unknown[]} queryKey - The exact query key.
 * @param {{ staleTime?: number, gcTime?: number }} options - TTL options in milliseconds.
 *
 * @example
 * setQueryTTL(usersKeys.lists(), { staleTime: 10 * 60 * 1000 }); // 10 min
 */
export const setQueryTTL = (queryKey, { staleTime, gcTime } = {}) => {
  queryClient.setQueryDefaults(queryKey, {
    ...(staleTime !== undefined && { staleTime }),
    ...(gcTime !== undefined && { gcTime }),
  });
};

// ─── Query state inspection ───────────────────────────────────────────

/**
 * Returns the current state object of a query (data, error, status, etc.).
 *
 * @param {readonly unknown[]} queryKey - The exact query key.
 * @returns {import("@tanstack/react-query").QueryState | undefined}
 */
export const getQueryState = (queryKey) => {
  return queryClient.getQueryState(queryKey);
};

/**
 * Checks whether a query is currently fetching.
 *
 * @param {readonly unknown[]} queryKey - The query key to check.
 * @returns {boolean}
 */
export const isQueryFetching = (queryKey) => {
  return queryClient.isFetching({ queryKey }) > 0;
};

// ─── Cancel queries ────────────────────────────────────────────────────

/**
 * Cancels in-flight queries matching the given key. Useful before optimistic updates.
 *
 * @param {readonly unknown[]} queryKey - The key (or prefix) to cancel.
 * @returns {Promise<void>}
 */
export const cancelQueries = (queryKey) => {
  return queryClient.cancelQueries({ queryKey });
};
