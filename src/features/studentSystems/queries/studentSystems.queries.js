// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { studentSystemsAPI } from "../api/studentSystems.api";

export const studentSystemsKeys = createQueryKeys("studentSystems");

export const studentSystemsQueries = {
  /**
   * O'quvchilar ro'yxati — ERP va Kundalik.com belgilari bilan. Javob to'liq
   * qaytadi (`data`, `pagination`, `summary`): kartalardagi sanoq ham shu
   * so'rovdan.
   */
  list: (params) =>
    queryOptions({
      queryKey: studentSystemsKeys.list(params),
      queryFn: () => studentSystemsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
