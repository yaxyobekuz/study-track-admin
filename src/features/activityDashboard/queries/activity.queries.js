// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { activityAPI } from "../api/activity.api";

export const activityKeys = createQueryKeys("activity");

/**
 * ⚠️ `staleTime` QISQA (60 soniya) va bu boshqa dashboardlardan FARQ
 * QILADI. Moliya/inventar/ta'lim dashboardlari OYLIK yig'ma ko'rsatadi
 * va u soatlab o'zgarmaydi, shuning uchun u yerda 5 daqiqa. Bu yerda
 * esa ekranning yuqorisida "bugun nechta ota-ona kirdi" turadi —
 * rahbar sahifani yangilaganda o'sha raqam yangilanishi kerak, aks
 * holda "jonli signal" degan butun g'oya yolg'on bo'lardi.
 */
const STALE = 60 * 1000;

export const activityQueries = {
  /** Butun manzara. Params: `{ granularity, count }` yoki eski `{ days }`. */
  overview: (params) =>
    queryOptions({
      queryKey: [...activityKeys.all, "overview", params],
      queryFn: () => activityAPI.getOverview(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  /** Bitta odamning faollik tarixi — modal ochilganda yuklanadi. */
  subject: (params) =>
    queryOptions({
      queryKey: [...activityKeys.all, "subject", params],
      queryFn: () => activityAPI.getSubject(params).then((r) => r.data.data),
      enabled: Boolean(params?.userId || params?.telegramId),
      staleTime: STALE,
    }),

  /**
   * Bitta sinfning kesimi — modal ochilganda yuklanadi.
   *
   * ⚠️ `classId` kalitning ICHIDA turadi (`{ classId, days }`), garchi
   * u API'da yo'l segmenti bo'lsa ham: ikkita sinf ketma-ket ochilganda
   * kesh ularni ajrata olishi kerak, aks holda ikkinchi sinf birinchisining
   * ma'lumotini ko'rsatib turardi.
   */
  classDetail: ({ classId, days }) =>
    queryOptions({
      queryKey: [...activityKeys.all, "class", classId, { days }],
      queryFn: () =>
        activityAPI.getClass(classId, { days }).then((r) => r.data.data),
      enabled: Boolean(classId),
      staleTime: STALE,
    }),
};

export default activityQueries;
