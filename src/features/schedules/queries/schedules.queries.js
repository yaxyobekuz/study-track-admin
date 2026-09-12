// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { schedulesAPI } from "../api/schedules.api";

export const schedulesKeys = createQueryKeys("schedules");

export const schedulesQueries = {
  /**
   * Whole-week schedule of a single class → array of `{ day, subjects }`.
   * The endpoint is scoped by class, so it lives under `all` rather than the
   * generic `list`/`detail` shape.
   */
  byClass: (classId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "class", classId],
      queryFn: () => schedulesAPI.getByClass(classId).then((r) => r.data.data),
      enabled: Boolean(classId),
    }),

  /** A single class' schedule for one day → the day's `{ day, subjects }`. */
  byDay: (classId, day) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "class", classId, "day", day],
      queryFn: () =>
        schedulesAPI.getByDay(classId, day).then((r) => r.data.data),
      enabled: Boolean(classId) && Boolean(day),
    }),

  /** Every schedule that includes a given subject → array of schedules. */
  bySubject: (subjectId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "subject", subjectId],
      queryFn: () =>
        schedulesAPI.getBySubject(subjectId).then((r) => r.data.data),
      enabled: Boolean(subjectId),
    }),

  /**
   * Bitta o'qituvchining haftalik yuklamasi (profil sahifasi):
   * jami soat, sinflar kesimi, haftalik jadval va — `payroll.view` bo'lsa —
   * joriy oylik. Oylik maydonini SERVER kesadi, bu yerda emas.
   */
  teacherWorkload: (teacherId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "teacher", teacherId, "workload"],
      queryFn: () =>
        schedulesAPI.getTeacherWorkload(teacherId).then((r) => r.data.data),
      enabled: Boolean(teacherId),
    }),

  /** Current user's lessons for today → array of lessons. */
  myToday: () =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "my-today"],
      queryFn: () => schedulesAPI.getMyToday().then((r) => r.data.data),
    }),

  /** All classes' lessons for today → array of schedules. */
  allToday: () =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "all-today"],
      queryFn: () => schedulesAPI.getAllToday().then((r) => r.data.data),
    }),

  /**
   * Dars biriktirish uchun o'qituvchilar: `[{ id, fullName, subjectIds }]`.
   *
   * Ma'lumotnoma — kamdan-kam o'zgaradi, shuning uchun uzun `staleTime`.
   */
  teacherOptions: () =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "teacher-options"],
      queryFn: () =>
        schedulesAPI.getTeacherOptions().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),

  /**
   * Sinf uchun MENING qoralamam:
   * `{ draft: { week, baseHash, updatedAt } | null, currentHash, isStale }`.
   *
   * ⚠️ `staleTime: Infinity` — qoralamani faqat forma yozadi. Qayta so'rov
   * tahrir o'rtasida serverdagi eski nusxani qaytarib, formani orqaga
   * tashlab yuborardi.
   */
  draft: (classId) =>
    queryOptions({
      queryKey: [...schedulesKeys.all, "class", classId, "draft"],
      queryFn: () => schedulesAPI.getDraft(classId).then((r) => r.data.data),
      enabled: Boolean(classId),
      staleTime: Infinity,
      gcTime: 0,
      retry: false,
    }),
};

/**
 * Whole-week schedule for a class.
 *
 * @example
 * const { data: schedules = [] } = useClassSchedule(classId);
 */
export const useClassSchedule = (classId) =>
  useQuery(schedulesQueries.byClass(classId));

/**
 * Dars biriktirish uchun o'qituvchilar (fanlari bilan).
 *
 * @example
 * const { data: teachers = [] } = useTeacherOptions();
 */
export const useTeacherOptions = () => useQuery(schedulesQueries.teacherOptions());

/**
 * Sinf jadvalining MENING qoralamam (tugallanmagan tahrir).
 *
 * `enabled: false` — so'rov yuborilmaydi (masalan sheet rejimida: u yerda
 * platformadagi tahrir ham, uning zaxirasi ham yo'q).
 *
 * @param {string} classId
 * @param {{ enabled?: boolean }} [options]
 */
export const useScheduleDraft = (classId, { enabled = true } = {}) =>
  useQuery({
    ...schedulesQueries.draft(classId),
    enabled: Boolean(classId) && enabled,
  });
