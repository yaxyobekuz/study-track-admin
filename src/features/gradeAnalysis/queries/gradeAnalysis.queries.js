// TanStack Query
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { gradeAnalysisAPI } from "../api/gradeAnalysis.api";

export const gradeAnalysisKeys = createQueryKeys("grade-analysis");

/**
 * Tayyor tahlil MUHRLANGAN — raqami o'zgarmaydi, shuning uchun uzoq
 * `staleTime`. Ishlanayotgan tahlil esa `refetchInterval` bilan kuzatiladi
 * (`runPollInterval`) va tugashi bilan so'rov to'xtaydi.
 */
const STALE = 5 * 60 * 1000;

/** Navbatdagi/ishlanayotgan tahlil — 2.5 soniyada bir; tayyor bo'lsa — to'xtaydi. */
export const ACTIVE_STATUSES = ["queued", "running"];
export const runPollInterval = (query) =>
  ACTIVE_STATUSES.includes(query.state.data?.status) ? 2500 : false;

export const gradeAnalysisQueries = {
  options: () =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "options"],
      queryFn: () => gradeAnalysisAPI.getOptions().then((r) => r.data.data),
      staleTime: 60 * 1000,
    }),

  runs: (params) =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.lists(), params],
      queryFn: () => gradeAnalysisAPI.getRuns(params).then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000,
    }),

  run: (id) =>
    queryOptions({
      queryKey: gradeAnalysisKeys.detail(id),
      queryFn: () => gradeAnalysisAPI.getRun(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: STALE,
      refetchInterval: runPollInterval,
    }),

  reports: (params) =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "reports", params],
      queryFn: () => gradeAnalysisAPI.getRunReports(params).then((r) => r.data),
      enabled: Boolean(params?.id),
      placeholderData: keepPreviousData,
      staleTime: STALE,
    }),

  report: (id) =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "report", id],
      queryFn: () => gradeAnalysisAPI.getReport(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: STALE,
    }),

  studentHistory: (studentId) =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "history", studentId],
      queryFn: () => gradeAnalysisAPI.getStudentHistory(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
      staleTime: STALE,
    }),

  students: (params) =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "students", params],
      queryFn: () => gradeAnalysisAPI.searchStudents(params).then((r) => r.data.data),
      enabled: Boolean(params?.q?.trim() || params?.classId),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    }),

  settings: () =>
    queryOptions({
      queryKey: [...gradeAnalysisKeys.all, "settings"],
      queryFn: () => gradeAnalysisAPI.getSettings().then((r) => r.data.data),
      staleTime: STALE,
    }),
};
