// TanStack Query
import { queryOptions, keepPreviousData, useQuery } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { issuesAPI } from "../api/issues.api";

export const issuesKeys = createQueryKeys("issues");
export const issueCategoriesKeys = createQueryKeys("issue-categories");

/** Holat sanoqlari va hisobot — ro'yxatdan alohida kesimlar, `all` dan hosila. */
const COUNTS_KEY = [...issuesKeys.all, "counts"];
const REPORT_KEY = [...issuesKeys.all, "report"];

export const issuesQueries = {
  /** Sahifalangan, filtrlanadigan muammolar ro'yxati → `{ data, pagination }`. */
  list: (params) =>
    queryOptions({
      queryKey: issuesKeys.list(params),
      queryFn: () => issuesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Holatlar bo'yicha sanoq → `{ new, in_review, resolved, rejected, total }`.
   *
   * ⚠️ FILTRGA BOG'LIQ EMAS — tablardagi raqamlar qaysi tab ochiq
   * bo'lishidan qat'i nazar bir xil qoladi (server ham shunday hisoblaydi).
   */
  counts: () =>
    queryOptions({
      queryKey: COUNTS_KEY,
      queryFn: () => issuesAPI.getCounts().then((r) => r.data.data),
    }),

  /** Bitta muammo → muammo obyekti. */
  detail: (id) =>
    queryOptions({
      queryKey: issuesKeys.detail(id),
      queryFn: () => issuesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** Hisobot payload'i (davr bo'yicha) → `issueReport.service.js` natijasi. */
  report: (params) =>
    queryOptions({
      queryKey: [...REPORT_KEY, params],
      queryFn: () => issuesAPI.getReport(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),
};

export const issueCategoriesQueries = {
  /** Boshqaruv ro'yxati — noaktivlar ham, har biriga muammolar soni bilan. */
  list: () =>
    queryOptions({
      queryKey: issueCategoriesKeys.lists(),
      queryFn: () => issuesAPI.getCategories().then((r) => r.data.data),
    }),

  /** Faol kategoriyalar — ro'yxat filtri uchun (botdagi ro'yxatning ko'zgusi). */
  active: () =>
    queryOptions({
      queryKey: [...issueCategoriesKeys.all, "active"],
      queryFn: () => issuesAPI.getActiveCategories().then((r) => r.data.data),
    }),
};

/**
 * Filtr uchun faol kategoriyalar.
 *
 * @example
 * const { data: categories = [] } = useActiveIssueCategories();
 */
export const useActiveIssueCategories = () =>
  useQuery(issueCategoriesQueries.active());
