// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { financeReportsAPI } from "../api/financeReports.api";

export const reportKeys = createQueryKeys("finance-reports");

/**
 * Hisobot so'rovlari.
 *
 * `staleTime` uzun (5 daqiqa): hisobot raqamlari sekin o'zgaradi va
 * foydalanuvchi tablar orasida u yoqdan-bu yoqqa o'tganda har safar
 * og'ir yig'ma so'rovni qayta yuborishning ma'nosi yo'q.
 */
const STALE = 5 * 60 * 1000;

export const reportQueries = {
  overview: (params) =>
    queryOptions({
      queryKey: [...reportKeys.all, "overview", params],
      queryFn: () => financeReportsAPI.getOverview(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  cashflow: (params) =>
    queryOptions({
      queryKey: [...reportKeys.all, "cashflow", params],
      queryFn: () => financeReportsAPI.getCashflow(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  debt: (params) =>
    queryOptions({
      queryKey: [...reportKeys.all, "debt", params],
      queryFn: () => financeReportsAPI.getDebt(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  tariffs: (params) =>
    queryOptions({
      queryKey: [...reportKeys.all, "tariffs", params],
      queryFn: () => financeReportsAPI.getTariffs(params).then((r) => r.data.data),
      staleTime: STALE,
    }),
};
