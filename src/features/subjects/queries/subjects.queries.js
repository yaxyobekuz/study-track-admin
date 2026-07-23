// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { subjectsAPI } from "../api/subjects.api";

export const subjectsKeys = createQueryKeys("subjects");

/** Subjects are reference data — they change rarely, so cache them longer. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

export const subjectsQueries = {
  list: () =>
    queryOptions({
      queryKey: subjectsKeys.lists(),
      queryFn: () => subjectsAPI.getAll().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
};

/**
 * Shared subjects list, available to every authenticated user.
 * Deduped/cached across all consumers.
 *
 * @example
 * const { data: subjects = [] } = useSubjects();
 */
export const useSubjects = () => useQuery(subjectsQueries.list());
