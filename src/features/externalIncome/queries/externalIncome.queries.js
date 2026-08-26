// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { incomeCategoriesAPI, externalIncomesAPI } from "../api/externalIncome.api";

export const incomeKeys = createQueryKeys("external-income");

const categoriesKey = [...incomeKeys.all, "categories"];
const listKey = [...incomeKeys.all, "list"];

export const incomeQueries = {
  /** Kategoriyalar → `{ items, totals }`. */
  categories: (params) =>
    queryOptions({
      queryKey: [...categoriesKey, params],
      queryFn: () => incomeCategoriesAPI.getAll(params).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    }),

  /** Faol kategoriyalar — oynadagi tanlagich uchun. */
  activeCategories: () =>
    queryOptions({
      queryKey: [...categoriesKey, "active"],
      queryFn: () =>
        incomeCategoriesAPI
          .getAll({ status: "active" })
          .then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** Kirimlar registri → `{ data, pagination, totals }`. */
  list: (params) =>
    queryOptions({
      queryKey: [...listKey, params],
      queryFn: () => externalIncomesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
