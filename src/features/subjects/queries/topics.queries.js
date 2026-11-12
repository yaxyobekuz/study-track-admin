// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { topicsAPI } from "../api/topics.api";

export const topicsKeys = createQueryKeys("topics");

export const topicsQueries = {
  /** Topics belonging to a subject → topic[] (ordered). */
  bySubject: (subjectId, language = null) =>
    queryOptions({
      // ⚠️ TIL KALITDA: uch tilning ro'yxati bitta keshga tushsa, rus
      // guruhida o'zbek mavzulari ko'rinib qolardi.
      queryKey: [...topicsKeys.all, "subject", subjectId, language ?? "uz"],
      queryFn: () =>
        topicsAPI.getBySubject(subjectId, language).then((r) => r.data.data ?? []),
      enabled: Boolean(subjectId),
    }),

  /**
   * Fanlar bo'yicha mavzu holati → `{ items, totals }`.
   *
   * ⚠️ `topicsKeys.all` ostida: yuklash va o'chirish mutatsiyalari shu
   * kalitni bekor qiladi, ya'ni holat alohida listener'siz yangilanadi.
   */
  subjectStatus: (language = null) =>
    queryOptions({
      queryKey: [...topicsKeys.all, "subject-status", language ?? "all"],
      queryFn: () =>
        topicsAPI.subjectStatus(language).then((r) => r.data.data ?? null),
    }),

  /**
   * O'quv tillari katalogi.
   *
   * ⚠️ Paneldagi ro'yxat (`teachingLanguage.data.js`) — ZAXIRA: so'rov
   * kelmaganda tanlagich bo'sh qolmasligi uchun (`leads.data.js` bilan
   * AYNI mulohaza).
   */
  languages: () =>
    queryOptions({
      queryKey: [...topicsKeys.all, "languages"],
      queryFn: () => topicsAPI.languages().then((r) => r.data.data ?? []),
      staleTime: 60 * 60 * 1000,
    }),
};

/**
 * Topics for a single subject.
 *
 * @example
 * const { data: topics = [] } = useSubjectTopics(subjectId);
 */
export const useSubjectTopics = (subjectId, language = null) =>
  useQuery(topicsQueries.bySubject(subjectId, language));

/**
 * Qaysi fanga mavzu yuklangan, qaysiga yo'q.
 *
 * @example
 * const { data } = useTopicSubjectStatus();
 */
export const useTopicSubjectStatus = (language = null) =>
  useQuery(topicsQueries.subjectStatus(language));

/** O'quv tillari katalogi (tanlagichlar uchun). */
export const useTeachingLanguages = () => useQuery(topicsQueries.languages());
