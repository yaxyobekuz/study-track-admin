// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { expenseCategoriesAPI, expensesAPI, expenseLimitRequestsAPI } from "../api/expenses.api";

export const expenseKeys = createQueryKeys("expenses");

const categoriesKey = [...expenseKeys.all, "categories"];
const listKey = [...expenseKeys.all, "list"];

export const limitRequestQueries = {
  mine: () =>
    queryOptions({
      queryKey: ["expense-limit-requests", "mine"],
      queryFn: () => expenseLimitRequestsAPI.getMine().then((r) => r.data.data),
    }),
  all: (params) =>
    queryOptions({
      queryKey: ["expense-limit-requests", "all", params],
      queryFn: () => expenseLimitRequestsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};

export const expenseQueries = {
  /** Kategoriyalar → `{ items, totals }`. */
  categories: (params) =>
    queryOptions({
      queryKey: [...categoriesKey, params],
      queryFn: () => expenseCategoriesAPI.getAll(params).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    }),

  /** Faol kategoriyalar — oynadagi tanlagich uchun. */
  activeCategories: () =>
    queryOptions({
      queryKey: [...categoriesKey, "active"],
      queryFn: () =>
        expenseCategoriesAPI
          .getAll({ status: "active" })
          .then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** Xarajatlar registri → `{ data, pagination, totals }`. */
  list: (params) =>
    queryOptions({
      queryKey: [...listKey, params],
      queryFn: () => expensesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
