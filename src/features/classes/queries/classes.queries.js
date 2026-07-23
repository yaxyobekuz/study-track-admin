// TanStack Query
import { queryOptions, useQuery, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { classesAPI } from "../api/classes.api";
import { usersAPI } from "@/features/users/api/users.api";

export const classesKeys = createQueryKeys("classes");

/** Classes are reference data — they change rarely, so cache them longer. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

export const classesQueries = {
  list: () =>
    queryOptions({
      queryKey: classesKeys.lists(),
      queryFn: () => classesAPI.getAll().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
  detail: (id) =>
    queryOptions({
      queryKey: classesKeys.detail(id),
      queryFn: () => classesAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Roster of students in a class (sub-resource of a class detail).
   * Served by the users endpoint filtered to the class → the student array.
   */
  students: (classId) =>
    queryOptions({
      queryKey: [...classesKeys.detail(classId), "students"],
      queryFn: () =>
        usersAPI
          .getAll({ role: "student", class: classId, limit: 200 })
          .then((r) => r.data.data ?? []),
      enabled: Boolean(classId),
    }),

  /**
   * Student search used by the "add students to class" picker (debounced by
   * the caller via the `search` term). Keyed off `classesKeys.all` so it is
   * invalidated together with the rest of the feature.
   */
  studentSearch: (search) =>
    queryOptions({
      queryKey: [...classesKeys.all, "student-search", search],
      queryFn: () =>
        usersAPI
          .getAll({ role: "student", search, limit: 50 })
          .then((r) => r.data.data ?? []),
      placeholderData: keepPreviousData,
    }),
};

/**
 * Shared classes list, available to every authenticated user.
 * Deduped/cached across all consumers.
 *
 * @example
 * const { data: classes = [] } = useClasses();
 */
export const useClasses = () => useQuery(classesQueries.list());

/**
 * Students belonging to a single class (class detail roster).
 *
 * @example
 * const { data: students = [] } = useClassStudents(classId);
 */
export const useClassStudents = (classId) =>
  useQuery(classesQueries.students(classId));
