// TanStack Query
import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

// Query keys
import { createQueryKeys } from "@/shared/lib/query";

// API
import { aiAssistantAPI } from "../api/aiAssistant.api";

// Data
import { ACTIONS_PAGE_SIZE, CONVERSATIONS_PAGE_SIZE } from "../data/aiAssistant.data";

/**
 * AI YORDAMCHI — o'qish so'rovlari.
 *
 * ⚠️ JONLI JAVOB (SSE) BU YERDA EMAS. Oqim `useAssistantChat` holatida
 * turadi; tur tugagach yakuniy xabarlar suhbat keshiga `setQueryData` bilan
 * yoziladi va keyin server bilan solishtirish uchun qayta so'raladi.
 *
 * ⚠️ HAMMA KALIT `"ai-assistant"` BILAN BOSHLANADI. Amal bajarilgach
 * boshqa bo'limlar keshi shu prefiks BO'YICHA ajratib yangilanadi
 * (`aiAssistant.mutations.js`) — prefiks o'zgarsa u predikat buziladi.
 */
export const aiAssistantKeys = createQueryKeys("ai-assistant");

export const AI_ASSISTANT_ROOT = aiAssistantKeys.all[0];

/**
 * ⚠️ `executing` HOLATIDAGI AMAL KUZATIB TURILADI. Tasdiq bosilgan oynada
 * natija javobning o'zida keladi, lekin sahifa shu paytda yangilangan yoki
 * boshqa oynada ochilgan bo'lsa, karta "Bajarilmoqda" da qotib qolardi —
 * `staleTime` tugaguncha hech kim qayta so'ramaydi.
 */
const EXECUTING_POLL_MS = 3000;
const isExecuting = (action) => action?.status === "executing";

const STALE = {
  status: 60 * 1000,
  conversation: 60 * 1000,
  list: 30 * 1000,
  actions: 20 * 1000,
};

export const aiAssistantQueries = {
  status: () =>
    queryOptions({
      queryKey: [...aiAssistantKeys.all, "status"],
      queryFn: () => aiAssistantAPI.getStatus().then((r) => r.data.data),
      staleTime: STALE.status,
    }),

  /**
   * Suhbatlar ro'yxati — "Ko'proq yuklash" bilan sahifalanadi.
   * @param {{ search?: string }} params
   */
  conversations: ({ search = "" } = {}) =>
    infiniteQueryOptions({
      queryKey: aiAssistantKeys.list({ search }),
      queryFn: ({ pageParam }) =>
        aiAssistantAPI
          .getConversations({ page: pageParam, limit: CONVERSATIONS_PAGE_SIZE, ...(search ? { search } : {}) })
          .then((r) => r.data),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage?.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
      placeholderData: keepPreviousData,
      staleTime: STALE.list,
    }),

  /** Bitta suhbat: `{ conversation, messages }`. */
  conversation: (id) =>
    queryOptions({
      queryKey: aiAssistantKeys.detail(id),
      queryFn: () => aiAssistantAPI.getConversation(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: STALE.conversation,
      refetchInterval: (query) =>
        query.state.data?.messages?.some((message) => message.actions?.some(isExecuting)) ? EXECUTING_POLL_MS : false,
      // 404 (o'chirilgan / boshqa filial) — qayta urinish ma'nosiz.
      retry: (failureCount, error) => failureCount < 1 && (error?.response?.status ?? 500) >= 500,
    }),

  /**
   * Amallar tarixi.
   * @param {{ status?: string, page?: number }} params
   */
  actions: ({ status = "", page = 1 } = {}) =>
    queryOptions({
      queryKey: [...aiAssistantKeys.all, "actions", { status, page }],
      queryFn: () =>
        aiAssistantAPI
          .getActions({ page, limit: ACTIONS_PAGE_SIZE, ...(status ? { status } : {}) })
          .then((r) => r.data),
      placeholderData: keepPreviousData,
      staleTime: STALE.actions,
      refetchInterval: (query) => (query.state.data?.data?.some(isExecuting) ? EXECUTING_POLL_MS : false),
    }),
};

/** Amallar ro'yxatlarining umumiy kaliti (invalidatsiya uchun). */
export const aiActionsListKey = [...aiAssistantKeys.all, "actions"];

export default aiAssistantQueries;
