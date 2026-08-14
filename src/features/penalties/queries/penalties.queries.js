// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { penaltiesAPI } from "../api/penalties.api";

export const penaltiesKeys = createQueryKeys("penalties");
export const penaltyCategoriesKeys = createQueryKeys("penalty-categories");
export const reductionPackagesKeys = createQueryKeys("penalty-reduction-packages");

/** Penalty settings & the auto grade-penalty settings are singletons, keyed off `all`. */
const SETTINGS_KEY = [...penaltiesKeys.all, "settings"];
const GRADE_SETTINGS_KEY = [...penaltiesKeys.all, "grade-settings"];

export const penaltiesQueries = {
  /** Paginated, filterable penalties list → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: penaltiesKeys.list(params),
      queryFn: () => penaltiesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Bitta foydalanuvchining jarimalari → `{ data, pagination }`.
   * Foydalanuvchi detal sahifasidagi "Jarimalar" tabi shundan o'qiydi.
   */
  byUser: (userId, params) =>
    queryOptions({
      queryKey: [...penaltiesKeys.all, "by-user", userId, params],
      queryFn: () =>
        penaltiesAPI.getUserPenalties(userId, params).then((r) => r.data),
      enabled: Boolean(userId),
      placeholderData: keepPreviousData,
    }),

  /** Single penalty by id → the penalty object. */
  detail: (id) =>
    queryOptions({
      queryKey: penaltiesKeys.detail(id),
      queryFn: () => penaltiesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** Penalty settings (fine amounts, premium discount) → the settings object. */
  settings: () =>
    queryOptions({
      queryKey: SETTINGS_KEY,
      queryFn: () => penaltiesAPI.getSettings().then((r) => r.data.data),
    }),

  /** Auto "no-grade" penalty settings (incl. exempt teachers) → the settings object. */
  gradeSettings: () =>
    queryOptions({
      queryKey: GRADE_SETTINGS_KEY,
      queryFn: () =>
        penaltiesAPI.getGradePenaltySettings().then((r) => r.data.data),
    }),
};

export const penaltyCategoriesQueries = {
  /** Penalty categories, optionally filtered by `targetRole` → the categories array. */
  list: (params) =>
    queryOptions({
      queryKey: penaltyCategoriesKeys.list(params),
      queryFn: () => penaltiesAPI.getCategories(params).then((r) => r.data.data),
    }),
};

export const reductionPackagesQueries = {
  /** Reduction packages → the packages array. */
  list: () =>
    queryOptions({
      queryKey: reductionPackagesKeys.lists(),
      queryFn: () =>
        penaltiesAPI.getReductionPackages().then((r) => r.data.data),
    }),
};
