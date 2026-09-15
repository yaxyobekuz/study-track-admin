// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { aiAssistantAPI } from "../api/aiAssistant.api";

// Queries
import { AI_ASSISTANT_ROOT, aiActionsListKey, aiAssistantKeys } from "./aiAssistant.queries";
import {
  removeConversationFromCaches,
  replaceActionInCaches,
  setConversationInCaches,
} from "./aiAssistant.cache";

// Lib
import { patchLiveAction } from "../lib/liveTurnStore";

/**
 * AI YORDAMCHI — yozish hooklari. Kesh yangilash shu yerda, UX (toast,
 * navigatsiya, karta ichidagi eslatma) esa komponentda.
 */

export const useRenameConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }) => aiAssistantAPI.renameConversation(id, title).then((r) => r.data.data),
    onSuccess: (conversation) => {
      setConversationInCaches(queryClient, conversation);
      queryClient.invalidateQueries({ queryKey: aiAssistantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: aiActionsListKey });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => aiAssistantAPI.deleteConversation(id).then((r) => r.data),
    onSuccess: (_, id) => {
      removeConversationFromCaches(queryClient, id);
      queryClient.invalidateQueries({ queryKey: aiAssistantKeys.lists() });
      // Tasdiq kutayotgan amallar serverda `rejected` bo'ldi.
      queryClient.invalidateQueries({ queryKey: aiActionsListKey });
    },
  });
};

/**
 * Amal bajarilgach BOSHQA bo'limlar keshi yangilanadi.
 *
 * ⚠️ QAYSI bo'lim o'zgarganini frontend bilmaydi (amal turi 50+ xil:
 * oylik, to'lov, ruxsat, jadval...). Har amal uchun kalitlar ro'yxatini
 * qo'lda yuritish birinchi yangi amaldayoq eskirardi. Shu sababli
 * yordamchining o'z keshidan tashqari HAMMASI eskirgan deb belgilanadi —
 * faol ekranlar (odatda bittasi ham yo'q) qayta so'raydi, qolganlari
 * ochilganda yangilanadi.
 */
const invalidateOtherFeatures = (queryClient) =>
  queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== AI_ASSISTANT_ROOT });

/**
 * Serverdan kelgan amal holatini hamma nusxaga yozadi: suhbat keshi,
 * amallar tarixi va hali serverda saqlanmagan jonli javob.
 *
 * ⚠️ Karta suhbat keshida TOPILMASA (javob jonli nusxadan ko'rsatilayotgan
 * edi) suhbat qayta so'raladi — aks holda keyingi o'qishgacha eski holat
 * turib qolardi.
 */
const applyActionUpdate = (queryClient, action) => {
  if (!action?.id) return;
  const replaced = replaceActionInCaches(queryClient, action);
  patchLiveAction(action);
  queryClient.invalidateQueries({ queryKey: aiActionsListKey });
  if (!replaced && action.conversationId) {
    queryClient.invalidateQueries({ queryKey: aiAssistantKeys.detail(action.conversationId) });
  }
};

/** 409 (`preview_changed` / `expired` / `not_pending`) — server amalning HOZIRGI holatini qaytaradi. */
const freshActionFromError = (error) => error?.response?.data?.details?.action ?? null;

export const useConfirmAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acknowledge }) =>
      aiAssistantAPI.confirmAction(id, { acknowledge: acknowledge === true }).then((r) => r.data.data),
    onSuccess: (action) => {
      applyActionUpdate(queryClient, action);
      // `failed` ham: bajaruvchi yarim yo'lda to'xtagan bo'lishi mumkin va
      // ekranlar haqiqiy holatni ko'rsatishi kerak.
      invalidateOtherFeatures(queryClient);
    },
    onError: (error) => applyActionUpdate(queryClient, freshActionFromError(error)),
  });
};

export const useRejectAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => aiAssistantAPI.rejectAction(id).then((r) => r.data.data),
    onSuccess: (action) => applyActionUpdate(queryClient, action),
    onError: (error) => applyActionUpdate(queryClient, freshActionFromError(error)),
  });
};
