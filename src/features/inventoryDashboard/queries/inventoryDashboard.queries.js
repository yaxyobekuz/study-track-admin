// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { inventoryDashboardAPI } from "../api/inventoryDashboard.api";

export const inventoryDashboardKeys = createQueryKeys("inventory-dashboard");

/**
 * Kesim raqamlari sekin o'zgaradi (oylik yig'ma), shuning uchun
 * `staleTime` uzun: rahbar oylar orasida u yoqdan-bu yoqqa o'tganda har
 * safar og'ir yig'ma so'rovni qayta yuborishning ma'nosi yo'q
 * (ta'lim/moliya dashboardlari bilan bir xil qaror).
 */
const STALE = 5 * 60 * 1000;

export const inventoryDashboardQueries = {
  overview: (params) =>
    queryOptions({
      queryKey: [...inventoryDashboardKeys.all, "overview", params],
      queryFn: () => inventoryDashboardAPI.getOverview(params).then((r) => r.data.data),
      staleTime: STALE,
    }),
};

export default inventoryDashboardQueries;
