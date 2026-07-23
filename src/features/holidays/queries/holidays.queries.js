// TanStack Query
import { queryOptions, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { holidaysAPI } from "../api/holidays.api";

export const holidaysKeys = createQueryKeys("holidays");

/** Today's holiday check is a sub-resource of the feature, keyed off `all`. */
const CHECK_TODAY_KEY = [...holidaysKeys.all, "check", "today"];

export const holidaysQueries = {
  /** All holidays → the holidays array. */
  list: () =>
    queryOptions({
      queryKey: holidaysKeys.lists(),
      queryFn: () => holidaysAPI.getAll().then((r) => r.data.data),
    }),

  /**
   * Whether today is a holiday → `{ isHoliday, holiday }`.
   * Replaces the old global "holidayCheck" store entity.
   */
  checkToday: () =>
    queryOptions({
      queryKey: CHECK_TODAY_KEY,
      queryFn: () => holidaysAPI.checkToday().then((r) => r.data.data),
    }),
};

/**
 * Shared holidays list.
 *
 * @example
 * const { data: holidays = [], isLoading } = useHolidays();
 */
export const useHolidays = () => useQuery(holidaysQueries.list());

/**
 * Today's holiday info (`{ isHoliday, holiday }`), deduped across consumers.
 *
 * @example
 * const { data } = useTodayHoliday();
 * const isHoliday = data?.isHoliday;
 */
export const useTodayHoliday = () => useQuery(holidaysQueries.checkToday());
