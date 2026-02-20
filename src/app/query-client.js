import { QueryClient } from "@tanstack/react-query";

/** Default stale time: 5 minutes */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

/** Default garbage-collection time: 15 minutes */
const DEFAULT_GC_TIME = 15 * 60 * 1000;

/**
 * Pre-configured QueryClient instance with sensible defaults.
 * - Queries: 5 min stale time, 15 min GC time, 1 retry, refetch on window focus.
 * - Mutations: no retry by default.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
});

export default queryClient;
