// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { groupSignalsAPI } from "../api/group-signals.api";

// ⚠️ MUAMMOLAR KALITIDAN ALOHIDA (`issuesKeys` emas): signallar PLATFORMA
// ma'lumoti, muammolar esa filialning — `telegram-groups` bilan ayni
// mulohaza. Biriktirish esa IKKALASIGA ham tegadi, shuning uchun
// mutatsiya ikkala kalitni bekor qiladi.
export const groupSignalsKeys = createQueryKeys("group-signals");

export const groupSignalsQueries = {
  /**
   * AI topgan signallar.
   *
   * ⚠️ Havola (`messageLink`) SERVERDA quriladi: ommaviy va yopiq guruh
   * uchun ikki xil shakl bor va `-100` prefiksi olib tashlanishi kerak
   * (`groupSignal.service.js#buildMessageLink`). Panel uni qayta
   * yig'maydi — aks holda qoida ikki joyda yashardi.
   */
  list: (params = {}) =>
    queryOptions({
      queryKey: groupSignalsKeys.list(params),
      queryFn: () => groupSignalsAPI.getAll(params).then((r) => r.data.data),
    }),

  /** Holat bo'yicha sanoq — filtr tugmalaridagi raqamlar. */
  counts: () =>
    queryOptions({
      queryKey: [...groupSignalsKeys.all, "counts"],
      queryFn: () => groupSignalsAPI.getCounts().then((r) => r.data.data),
    }),
};
