// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { topicsAPI } from "../api/topics.api";

export const topicsKeys = createQueryKeys("topics");

export const topicsQueries = {
  /** Topics belonging to a subject → topic[] (ordered). */
  bySubject: (subjectId) =>
    queryOptions({
      queryKey: [...topicsKeys.all, "subject", subjectId],
      queryFn: () => topicsAPI.getBySubject(subjectId).then((r) => r.data.data ?? []),
      enabled: Boolean(subjectId),
    }),
};

/**
 * Topics for a single subject.
 *
 * @example
 * const { data: topics = [] } = useSubjectTopics(subjectId);
 */
export const useSubjectTopics = (subjectId) =>
  useQuery(topicsQueries.bySubject(subjectId));
