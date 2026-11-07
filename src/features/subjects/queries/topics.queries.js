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

  /**
   * Fanlar bo'yicha mavzu holati → `{ items, totals }`.
   *
   * ⚠️ `topicsKeys.all` ostida: yuklash va o'chirish mutatsiyalari shu
   * kalitni bekor qiladi, ya'ni holat alohida listener'siz yangilanadi.
   */
  subjectStatus: () =>
    queryOptions({
      queryKey: [...topicsKeys.all, "subject-status"],
      queryFn: () =>
        topicsAPI.subjectStatus().then((r) => r.data.data ?? null),
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

/**
 * Qaysi fanga mavzu yuklangan, qaysiga yo'q.
 *
 * @example
 * const { data } = useTopicSubjectStatus();
 */
export const useTopicSubjectStatus = () =>
  useQuery(topicsQueries.subjectStatus());
