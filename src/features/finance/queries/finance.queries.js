// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tariffsAPI, studentTariffsAPI } from "../api/finance.api";

export const financeKeys = createQueryKeys("finance");

// Sub-resurslar `all` dan kengaytiriladi — bitta invalidatsiya butun
// bo'limni yangilashi uchun.
const tariffsKey = [...financeKeys.all, "tariffs"];
const assignmentsKey = [...financeKeys.all, "student-tariffs"];

export const financeQueries = {
  /** Tariflar katalogi (sahifalangan) → `{ data, pagination }`. */
  tariffList: (params) =>
    queryOptions({
      queryKey: [...tariffsKey, "list", params],
      queryFn: () => tariffsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta tarif — narx tarixi, bo'shliqlar va biriktirishlar soni bilan. */
  tariffDetail: (id, params) =>
    queryOptions({
      queryKey: [...tariffsKey, "detail", id, params],
      queryFn: () => tariffsAPI.getById(id, params).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Biriktirilishi mumkin bo'lgan tariflar (modal select uchun).
   * Arxivlanganlar chiqmaydi — ularni biriktirib bo'lmaydi.
   */
  assignableTariffs: () =>
    queryOptions({
      queryKey: [...tariffsKey, "assignable"],
      queryFn: () =>
        tariffsAPI
          .getAll({ isActive: "true", limit: 200 })
          .then((r) => r.data.data ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** O'quvchi tariflari (sahifalangan) → `{ data, pagination, month }`. */
  assignmentList: (params) =>
    queryOptions({
      queryKey: [...assignmentsKey, "list", params],
      queryFn: () => studentTariffsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};

export { tariffsKey, assignmentsKey };
