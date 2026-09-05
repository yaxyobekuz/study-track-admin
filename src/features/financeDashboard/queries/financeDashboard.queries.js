// TanStack Query
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { financeDashboardAPI } from "../api/financeDashboard.api";

export const dashboardKeys = createQueryKeys("finance-dashboard");

/**
 * Dashboard raqamlari sekin o'zgaradi (oy kesimidagi yig'ma), shuning uchun
 * `staleTime` uzun: rahbar oylar orasida u yoqdan-bu yoqqa o'tganda har
 * safar og'ir yig'ma so'rovni qayta yuborishning ma'nosi yo'q.
 */
const STALE = 5 * 60 * 1000;

export const dashboardQueries = {
  overview: (params) =>
    queryOptions({
      queryKey: [...dashboardKeys.all, "overview", params],
      queryFn: () => financeDashboardAPI.getDashboard(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  scorecard: (params) =>
    queryOptions({
      queryKey: [...dashboardKeys.all, "scorecard", params],
      queryFn: () => financeDashboardAPI.getScorecard(params).then((r) => r.data.data),
      staleTime: STALE,
    }),

  targets: (params) =>
    queryOptions({
      queryKey: [...dashboardKeys.all, "targets", params],
      queryFn: () => financeDashboardAPI.getTargets(params).then((r) => r.data.data),
      staleTime: STALE,
    }),
};

/**
 * Rejani saqlash.
 *
 * Butun dashboard invalidatsiya qilinadi: reja "Reja:" yorlig'ida ham,
 * "Budjet ijrosi" jadvalida ham, KPI kartalaridagi bajarilish foizida ham
 * ishtirok etadi — bittasini yangilab qolganini eskirgan holda qoldirish
 * bir ekranda ikki xil reja ko'rsatardi.
 */
export const useSaveTargets = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => financeDashboardAPI.saveTargets(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};
