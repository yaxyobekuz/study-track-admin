// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { coinBlocksAPI } from "../api/coin-blocks.api";

export const coinBlocksKeys = createQueryKeys("coinBlocks");

const listKey = [...coinBlocksKeys.all, "list"];
const summaryKey = [...coinBlocksKeys.all, "summary"];
const candidatesKey = [...coinBlocksKeys.all, "candidates"];

export const coinBlocksQueries = {
  /** Cheklovlar registri (faol yoki tarix). */
  list: (params) =>
    queryOptions({
      queryKey: [...listKey, params],
      queryFn: () => coinBlocksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Yuqoridagi kartalar. */
  summary: () =>
    queryOptions({
      queryKey: summaryKey,
      queryFn: () => coinBlocksAPI.getSummary().then((r) => r.data.data),
    }),

  /**
   * Cheklash oynasidagi tanlov ro'yxati. Qarz SERVERDA hisoblanadi —
   * panel summani o'zi yig'maydi (qarzdorlar registri bilan AYNI manba).
   */
  candidates: (params) =>
    queryOptions({
      queryKey: [...candidatesKey, params],
      queryFn: () => coinBlocksAPI.getCandidates(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
