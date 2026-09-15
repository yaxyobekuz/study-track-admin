// Queries
import { aiActionsListKey, aiAssistantKeys } from "./aiAssistant.queries";

/**
 * AI YORDAMCHI — KESHNI QO'LDA YANGILASH (bitta joyda).
 *
 * ⚠️ NEGA `invalidateQueries` YETARLI EMAS: oqim paytida suhbat ekranda
 * turadi va har yangi hodisada qayta so'rov yuborish sahifani miltillatib,
 * serverni keraksiz yuklardi. Shu sababli hodisa kelishi bilan kesh shu
 * yerda yangilanadi, tur tugagach esa bir marta server bilan solishtiriladi.
 *
 * Hamma funksiya o'zgarmas (immutable) yangilaydi — TanStack eski obyekt
 * bilan solishtirib qayta chizadi.
 */

const upsertById = (list, item) => {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
};

/**
 * Suhbat keshiga xabar(lar) qo'shadi yoki almashtiradi. Kesh bo'lmasa —
 * `conversation` berilgan taqdirdagina yaratiladi.
 */
export const upsertConversationMessages = (queryClient, conversationId, messages, conversation) => {
  queryClient.setQueryData(aiAssistantKeys.detail(conversationId), (old) => {
    if (!old && !conversation) return old;
    let list = old?.messages ?? [];
    for (const message of messages) list = upsertById(list, message);
    return { conversation: conversation ?? old.conversation, messages: list };
  });
};

/** Suhbat sarlavhasi/metama'lumotini detal va ro'yxat keshlarida almashtiradi. */
export const setConversationInCaches = (queryClient, conversation) => {
  queryClient.setQueryData(aiAssistantKeys.detail(conversation.id), (old) =>
    old ? { ...old, conversation } : { conversation, messages: [] },
  );
  queryClient.setQueriesData({ queryKey: aiAssistantKeys.lists() }, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: (page.data ?? []).map((item) => (item.id === conversation.id ? conversation : item)),
      })),
    };
  });
};

/** O'chirilgan suhbatni ro'yxatlardan darhol olib tashlaydi. */
export const removeConversationFromCaches = (queryClient, conversationId) => {
  queryClient.setQueriesData({ queryKey: aiAssistantKeys.lists() }, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: (page.data ?? []).filter((item) => item.id !== conversationId),
      })),
    };
  });
  queryClient.removeQueries({ queryKey: aiAssistantKeys.detail(conversationId), exact: true });
};

/**
 * Serverdan kelgan yangi amal holatini hamma joyga yozadi: suhbat
 * xabaridagi karta va amallar tarixi sahifalari.
 *
 * ⚠️ `conversationTitle` faqat ro'yxat javobida bor — almashtirishda
 * eskisi saqlanadi, aks holda jadvaldagi "Suhbat" ustuni bo'shab qolardi.
 *
 * @returns {boolean} suhbat keshidagi karta topilib almashtirildimi
 */
export const replaceActionInCaches = (queryClient, action) => {
  if (!action?.id) return false;
  let replacedInThread = false;

  queryClient.setQueryData(aiAssistantKeys.detail(action.conversationId), (old) => {
    if (!old?.messages) return old;
    let touched = false;
    const messages = old.messages.map((message) => {
      if (!message.actions?.some((item) => item.id === action.id)) return message;
      touched = true;
      return {
        ...message,
        actions: message.actions.map((item) => (item.id === action.id ? action : item)),
      };
    });
    replacedInThread = touched;
    return touched ? { ...old, messages } : old;
  });

  queryClient.setQueriesData({ queryKey: aiActionsListKey }, (old) => {
    if (!old?.data) return old;
    return {
      ...old,
      data: old.data.map((item) =>
        item.id === action.id ? { ...action, conversationTitle: item.conversationTitle } : item,
      ),
    };
  });

  return replacedInThread;
};
