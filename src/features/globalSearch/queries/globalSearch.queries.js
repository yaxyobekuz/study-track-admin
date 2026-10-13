// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { globalSearchAPI } from "../api/globalSearch.api";

export const globalSearchKeys = createQueryKeys("globalSearch");

/** Serverdagi `MIN_QUERY` bilan bir xil — qisqa so'rovga borib kelmaymiz. */
export const MIN_QUERY_LENGTH = 2;

export const globalSearchQueries = {
  /**
   * Foydalanuvchilarni butun platforma bo'ylab qidirish.
   *
   * `keepPreviousData` — yozish davomida ro'yxat "sakramaydi": yangi
   * natija kelguncha eskisi turadi.
   */
  users: (q) =>
    queryOptions({
      queryKey: globalSearchKeys.list({ q }),
      queryFn: () =>
        globalSearchAPI.searchUsers({ q }).then((r) => r.data.data),
      enabled: String(q ?? "").trim().length >= MIN_QUERY_LENGTH,
      placeholderData: keepPreviousData,
      // Qidiruv natijasi tez eskiradi, lekin bir xil so'rovni ikki marta
      // yubormaslik uchun qisqa muddat keshlanadi
      staleTime: 30 * 1000,
    }),
};
