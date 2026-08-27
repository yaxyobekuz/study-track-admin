// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { scheduleSettingsAPI } from "../api/scheduleSettings.api";

export const scheduleSettingsKeys = createQueryKeys("schedule-settings");

/** Dars soatlari kamdan-kam o'zgaradi — uzoqroq keshlanadi. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

export const scheduleSettingsQueries = {
  detail: () =>
    queryOptions({
      queryKey: scheduleSettingsKeys.details(),
      queryFn: () =>
        scheduleSettingsAPI.getSettings().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
};

/**
 * Dars soatlari (`periods`) — jadval gridining yagona manbai.
 *
 * Uni uchta joy o'qiydi: sozlamalar sahifasi, dars jadvali formasi va
 * rejalashtirish bo'limi. Avval har biri o'zicha `useQuery({ queryKey:
 * ["schedule-settings"] })` yozgan edi — kalit qo'lda yozilgani uchun
 * mutatsiya ularni yangilamas, uch qavatli `data.data.data` esa har safar
 * qaytadan ochilardi.
 *
 * @example
 * const { data: periods = [] } = usePeriods();
 */
export const useScheduleSettings = () =>
  useQuery(scheduleSettingsQueries.detail());

/** Faqat `periods` massivi kerak bo'lganda. */
export const usePeriods = () =>
  useQuery({
    ...scheduleSettingsQueries.detail(),
    select: (settings) => settings?.periods ?? [],
  });
