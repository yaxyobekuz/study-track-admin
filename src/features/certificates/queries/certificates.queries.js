// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { certificatesAPI } from "../api/certificates.api";

export const certificatesKeys = createQueryKeys("certificates");

export const certificatesQueries = {
  /** Rejalar ro'yxati → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: certificatesKeys.list(params),
      queryFn: () => certificatesAPI.getPlans(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Statistika → kartalar va kesimlar. */
  stats: (params) =>
    queryOptions({
      queryKey: [...certificatesKeys.all, "stats", params ?? {}],
      queryFn: () => certificatesAPI.getStats(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Yo'nalishlar katalogi — tanlagichlar ham shu so'rovdan. */
  tracks: (params) =>
    queryOptions({
      queryKey: [...certificatesKeys.all, "tracks", params ?? {}],
      queryFn: () => certificatesAPI.getTracks(params).then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),

  /**
   * O'quvchi tanlagichi.
   *
   * ⚠️ `enabled` — qidiruv matni kiritilmaguncha so'rov YUBORILMAYDI
   * (sinf tanlangan bo'lsa yuboriladi): bo'sh qidiruv butun maktabni
   * tortib kelardi.
   */
  students: ({ search, classId } = {}) =>
    queryOptions({
      queryKey: [...certificatesKeys.all, "students", { search, classId }],
      queryFn: () =>
        certificatesAPI
          .searchStudents({ search, classId })
          .then((r) => r.data.data),
      enabled: Boolean(search?.trim()) || Boolean(classId),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    }),

  /**
   * O'QUVCHINING MAVZULAR MANZARASI — "nega bu foiz".
   *
   * Har sertifikat fani uchun o'tilgan va qolgan mavzular ro'yxati.
   * Faqat oyna ochilganda so'raladi (`enabled`): mavzular ro'yxati uzun
   * bo'lishi mumkin va uni ro'yxat bilan birga tortib kelish ortiqcha.
   */
  studentProgress: (studentId) =>
    queryOptions({
      queryKey: [...certificatesKeys.detail(studentId), "progress"],
      queryFn: () =>
        certificatesAPI.getStudentProgress(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** Bitta o'quvchining rejalari (o'quvchi kartasi). */
  student: (studentId, params) =>
    queryOptions({
      queryKey: [...certificatesKeys.detail(studentId), params ?? {}],
      queryFn: () =>
        certificatesAPI
          .getStudentPlans(studentId, params)
          .then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),
};
