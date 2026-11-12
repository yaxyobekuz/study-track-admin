// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { studentTopicsAPI } from "../api/studentTopics.api";

export const studentTopicsKeys = createQueryKeys("student-topics");

export const studentTopicsQueries = {
  /** Guruh + fan → `{ class, subject, language, students, totals }`. */
  byClass: (classId, subjectId) =>
    queryOptions({
      queryKey: [...studentTopicsKeys.all, "class", classId, subjectId],
      queryFn: () =>
        studentTopicsAPI.byClass(classId, subjectId).then((r) => r.data.data ?? null),
      enabled: Boolean(classId && subjectId),
    }),

  /** Bitta o'quvchining reja tarixi. */
  history: (studentId, subjectId = null) =>
    queryOptions({
      queryKey: [...studentTopicsKeys.all, "history", studentId, subjectId ?? "all"],
      queryFn: () =>
        studentTopicsAPI.history(studentId, subjectId).then((r) => r.data.data ?? []),
      enabled: Boolean(studentId),
    }),
};

export const useClassStudentTopics = (classId, subjectId) =>
  useQuery(studentTopicsQueries.byClass(classId, subjectId));

export const useStudentTopicHistory = (studentId, subjectId = null) =>
  useQuery(studentTopicsQueries.history(studentId, subjectId));
