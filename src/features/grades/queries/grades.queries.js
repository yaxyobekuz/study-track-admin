// TanStack Query
import { queryOptions, useQuery, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// API
import { gradesAPI } from "../api/grades.api";
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

export const gradesKeys = createQueryKeys("grades");

export const gradesQueries = {
  /**
   * Students with their grades for a class on a given date → the student array.
   * Backs the grades journal table.
   */
  byClassAndDate: (classId, date) =>
    queryOptions({
      queryKey: [...gradesKeys.all, "by-class-date", classId, date],
      queryFn: () =>
        gradesAPI
          .getByClassAndDate(classId, date)
          .then((r) => r.data.data ?? []),
      enabled: Boolean(classId && date),
      placeholderData: keepPreviousData,
    }),

  /**
   * The subjects scheduled for a class on a given date, ordered by lesson slot
   * (a subject may repeat, so each slot carries its `lessonOrder`). Sundays have
   * no lessons, so the query short-circuits to an empty list.
   */
  todaySubjects: (classId, date) =>
    queryOptions({
      queryKey: [...gradesKeys.all, "today-subjects", classId, date],
      queryFn: () => {
        const dayName = getDayOfWeekUZ(date);
        if (dayName === "yakshanba") return [];

        return schedulesAPI.getByDay(classId, dayName).then((r) => {
          const subjects = r.data.data?.subjects;
          if (!subjects) return [];

          return subjects
            .filter((s) => s.subject)
            .map((s) => ({ ...s.subject, lessonOrder: s.order }))
            .sort((a, b) => a.lessonOrder - b.lessonOrder);
        });
      },
      enabled: Boolean(classId && date),
      placeholderData: keepPreviousData,
    }),

  /** Today's missing grades grouped by teacher → the report payload. */
  missingToday: () =>
    queryOptions({
      queryKey: [...gradesKeys.all, "missing-today"],
      queryFn: () => gradesAPI.getMissingToday().then((r) => r.data.data),
    }),
};

/**
 * Students with grades for a class/date (grades journal).
 *
 * @example
 * const { data: students = [], isLoading } = useGradesByClassAndDate(classId, date);
 */
export const useGradesByClassAndDate = (classId, date) =>
  useQuery(gradesQueries.byClassAndDate(classId, date));

/**
 * Scheduled subjects for a class/date (journal columns).
 *
 * @example
 * const { data: todaySubjects = [] } = useTodaySubjects(classId, date);
 */
export const useTodaySubjects = (classId, date) =>
  useQuery(gradesQueries.todaySubjects(classId, date));

/**
 * Today's missing grades report.
 *
 * @example
 * const { data, isLoading, error, refetch } = useMissingGradesToday();
 */
export const useMissingGradesToday = () =>
  useQuery(gradesQueries.missingToday());
