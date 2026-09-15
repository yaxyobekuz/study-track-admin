// React
import { useCallback, useEffect, useSyncExternalStore } from "react";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import { AssistantStreamError, isAbortError, streamAssistantChat } from "../api/assistantStream";

// Queries
import { aiActionsListKey, aiAssistantKeys } from "../queries/aiAssistant.queries";
import { setConversationInCaches, upsertConversationMessages } from "../queries/aiAssistant.cache";

// Lib
import { LIVE_ASSISTANT_ID } from "../lib/thread";
import { IDLE_STATE, liveTurnStore } from "../lib/liveTurnStore";

// Data
import { COPY } from "../data/aiAssistant.data";

/**
 * JONLI SUHBAT TURI — SSE oqimi ustidagi holat mashinasi.
 *
 *   idle ──send──▶ streaming ──done/xato/to'xtatish──▶ idle
 *
 * ⚠️ BIR VAQTDA BITTA TUR. Server bir egaga ikkitagacha ruxsat beradi,
 * lekin ekranda ikkita parallel oqim "qaysi javob qaysi savolga" degan
 * chalkashlikni tug'dirardi. Boshqa suhbatda javob yozilayotganda
 * yuborish tugmasi bloklanadi (sabab yozib qo'yiladi).
 *
 * ⚠️ SAHIFADAN CHIQILSA OQIM TO'XTATILMAYDI VA YO'QOLMAYDI. Holat modul
 * darajasidagi omborda (`lib/liveTurnStore.js`): ega moliya ekraniga o'tib
 * qaytsa, javob yozilishda davom etayotgani ko'rinadi. Faqat manzilni
 * almashtirish (yangi suhbat ochilganda) o'rnatilgan sahifaga bog'liq.
 *
 * ⚠️ MATN BO'LAKLARI KADRGA BIR MARTA YOZILADI (`requestAnimationFrame`).
 * Model sekundiga o'nlab bo'lak yuboradi; har biriga holat yozish butun
 * markdown'ni har bo'lakda qayta chizardi.
 *
 * ⚠️ OQIMGACHA XATO (400/409/429/503) — toast va matn yozish maydoniga
 * QAYTARILADI. Egasi yozgan uzun savol tarmoq xatosi sababli yo'qolmasligi
 * kerak.
 */

/**
 * Tur davomida o'zgaruvchan, lekin ekranga chiqmaydigan qismlar.
 * `view` — hozir o'rnatilgan sahifa (yo'q bo'lsa `null`).
 */
const session = {
  controller: null,
  turnCounter: 0,
  pendingText: "",
  frame: 0,
  view: null,
};

const dispatch = liveTurnStore.dispatch;

const readToken = () => {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
};

/**
 * ⚠️ BOSHQA SESSIYANING TURI KO'RSATILMAYDI. Chiqish sahifani qayta
 * yuklamasdan ham bo'lishi mumkin (`useAuth().logout`) — keyin kirgan
 * foydalanuvchi oldingi egasining yozilayotgan javobini ko'rmasligi kerak.
 */
const getVisibleState = () => {
  const current = liveTurnStore.getState();
  return current.token && current.token !== readToken() ? IDLE_STATE : current;
};

const flushDelta = () => {
  if (session.frame) {
    cancelAnimationFrame(session.frame);
    session.frame = 0;
  }
  const text = session.pendingText;
  if (!text) return;
  session.pendingText = "";
  dispatch({ type: "delta", text });
};

/** MediaRecorder turi → server qabul qiladigan fayl nomi kengaytmasi. */
const voiceFileName = (mimeType) => {
  const base = String(mimeType || "").split(";")[0];
  if (base.includes("ogg")) return "voice.ogg";
  if (base.includes("mp4") || base.includes("m4a") || base.includes("aac")) return "voice.m4a";
  if (base.includes("mpeg")) return "voice.mp3";
  if (base.includes("wav")) return "voice.wav";
  return "voice.webm";
};

/** To'xtatilgan tur serverda saqlanib ulgurishi uchun qayta so'rov kechikishi. */
const SETTLE_REFETCH_MS = 1200;

/**
 * @param {{
 *   queryClient: import("@tanstack/react-query").QueryClient,
 *   player?: { prime: (key: string, blob: Blob) => void, alias: (from: string, to: string) => void },
 *   text?: string,
 *   voice?: { blob: Blob, durationMs: number } | null,
 *   conversationId?: string|null,
 * }} input
 * @returns {Promise<{ ok: boolean, restoreText?: string }>}
 */
async function runTurn({ queryClient, player, text = "", voice = null, conversationId = null }) {
  const token = readToken();

  if (session.controller) {
    // Oldingi tur BOSHQA sessiyaniki (qayta yuklamasdan chiqilgan) — u
    // to'xtatiladi; o'zinikida esa ikkinchi tur boshlanmaydi.
    if (liveTurnStore.getState().token === token) {
      toast.info(COPY.turnInProgress);
      return { ok: false, restoreText: text };
    }
    session.controller.abort();
    session.controller = null;
  }

  const controller = new AbortController();
  session.controller = controller;
  const turnId = (session.turnCounter += 1);
  const localUserId = `local-user-${turnId}`;
  const localAudioKey = `voice:${localUserId}`;
  const isCurrent = () => session.controller === controller;

  let activeConversationId = conversationId;
  let userConfirmed = false;
  let finalReceived = false;
  let proposed = false;
  let errorEvent = null;

  if (activeConversationId) {
    // Ochiq turgan eski so'rov oqim yozgan keshni ustidan yozmasin.
    queryClient.cancelQueries({ queryKey: aiAssistantKeys.detail(activeConversationId) });
  }
  if (voice) player?.prime(localAudioKey, voice.blob);

  session.pendingText = "";
  dispatch({
    type: "start",
    token,
    live: {
      turnId,
      conversationId: activeConversationId,
      final: null,
      userMessage: {
        id: localUserId,
        conversationId: activeConversationId,
        role: "user",
        content: text,
        inputMode: voice ? "voice" : "text",
        hasAudio: Boolean(voice),
        audioDurationMs: voice ? Math.round(voice.durationMs) : null,
        steps: [],
        status: "complete",
        errorMessage: null,
        timeLabel: null,
        actions: [],
        isPending: true,
      },
      assistant: {
        id: LIVE_ASSISTANT_ID,
        conversationId: activeConversationId,
        role: "assistant",
        content: "",
        inputMode: "text",
        hasAudio: false,
        steps: [],
        actions: [],
        status: "streaming",
        errorMessage: null,
        phaseLabel: voice ? COPY.transcribing : COPY.thinking,
        timeLabel: null,
        isLive: true,
      },
    },
  });

  const onEvent = (event, data) => {
    // Boshqa sessiya tomonidan to'xtatilgan tur omborga yozmaydi.
    if (!isCurrent()) return;
    if (event !== "delta") flushDelta();

    switch (event) {
      case "status":
        if (data?.label) dispatch({ type: "status", label: data.label });
        break;

      case "conversation": {
        const conversation = data?.conversation;
        if (!conversation?.id) break;
        const isNew = !activeConversationId;
        activeConversationId = conversation.id;
        setConversationInCaches(queryClient, conversation);
        dispatch({ type: "conversation", conversationId: conversation.id });
        if (isNew) {
          queryClient.invalidateQueries({ queryKey: aiAssistantKeys.lists() });
          // Manzil faqat "Yangi suhbat" ochiq turgan bo'lsa almashadi. Ega shu
          // orada boshqa suhbatga yoki boshqa bo'limga o'tgan bo'lsa, u yerdan
          // tortib olinmaydi — yangi suhbat ro'yxatda paydo bo'ladi.
          const view = session.view;
          if (view && !view.routeId) view.onCreated?.(conversation.id);
        }
        break;
      }

      case "user_message": {
        const message = data?.message;
        if (!message?.id) break;
        userConfirmed = true;
        if (voice) player?.alias(localAudioKey, `voice:${message.id}`);
        upsertConversationMessages(queryClient, message.conversationId, [message]);
        dispatch({ type: "user_message", message });
        break;
      }

      case "tool_start":
      case "tool_end":
        if (data?.step?.id) dispatch({ type: "step", step: data.step });
        break;

      case "delta":
        if (typeof data?.text === "string" && data.text) {
          session.pendingText += data.text;
          if (!session.frame) {
            session.frame = requestAnimationFrame(() => {
              session.frame = 0;
              flushDelta();
            });
          }
        }
        break;

      case "action":
        if (data?.action?.id) {
          proposed = true;
          dispatch({ type: "action", action: data.action });
        }
        break;

      case "assistant_message": {
        const message = data?.message;
        if (!message?.id) break;
        finalReceived = true;
        if (message.actions?.length) proposed = true;
        upsertConversationMessages(queryClient, message.conversationId, [message]);
        dispatch({ type: "final", message });
        break;
      }

      case "error":
        errorEvent = {
          code: data?.code || "internal",
          message: data?.message || COPY.genericError,
        };
        if (userConfirmed) dispatch({ type: "fail", status: "error", message: errorEvent.message });
        break;

      default:
        break;
    }
  };

  let result = { ok: true };
  let refetchLater = false;

  try {
    const { completed } = await streamAssistantChat({
      text,
      conversationId: activeConversationId,
      voice: voice ? { blob: voice.blob, durationMs: voice.durationMs, fileName: voiceFileName(voice.blob.type) } : null,
      signal: controller.signal,
      onEvent,
    });
    if (isCurrent()) flushDelta();

    if (!isCurrent()) {
      // Boshqa sessiya to'xtatgan — holat unga tegishli emas.
    } else if (errorEvent && !userConfirmed) {
      toast.error(errorEvent.message);
      dispatch({ type: "clear" });
      result = { ok: false, restoreText: text };
    } else if (!completed && !finalReceived && !errorEvent) {
      dispatch({ type: "fail", status: "interrupted", message: COPY.connectionLost });
      refetchLater = true;
    }
  } catch (error) {
    if (!isCurrent()) {
      result = { ok: false };
    } else {
      flushDelta();

      if (isAbortError(error)) {
        if (!userConfirmed) {
          dispatch({ type: "clear" });
          result = { ok: false, restoreText: text };
        } else if (!finalReceived) {
          dispatch({ type: "fail", status: "interrupted", message: null });
        }
        refetchLater = true;
      } else if (error instanceof AssistantStreamError) {
        if (error.kind === "unauthorized") {
          dispatch({ type: "clear" });
          result = { ok: false };
        } else if (!userConfirmed) {
          toast.error(error.message);
          dispatch({ type: "clear" });
          result = { ok: false, restoreText: text };
        } else if (!finalReceived) {
          dispatch({ type: "fail", status: "interrupted", message: COPY.connectionLost });
          refetchLater = true;
        }
      } else {
        // Ishlovchidagi kutilmagan xato — oqim yopilgan, tur yakunlanmagan.
        toast.error(COPY.genericError);
        if (!userConfirmed) {
          dispatch({ type: "clear" });
          result = { ok: false, restoreText: text };
        } else if (!finalReceived) {
          dispatch({ type: "fail", status: "error", message: COPY.genericError });
        }
        refetchLater = true;
      }
    }
  } finally {
    if (isCurrent()) {
      session.controller = null;
      dispatch({ type: "settle" });
    }

    const settledId = activeConversationId;
    const syncWithServer = () => {
      if (settledId) queryClient.invalidateQueries({ queryKey: aiAssistantKeys.detail(settledId) });
      queryClient.invalidateQueries({ queryKey: aiAssistantKeys.lists() });
      if (proposed) queryClient.invalidateQueries({ queryKey: aiActionsListKey });
    };
    syncWithServer();
    if (refetchLater && settledId) setTimeout(syncWithServer, SETTLE_REFETCH_MS);
  }

  return result;
}

/**
 * @param {{
 *   routeConversationId: string|null,
 *   onConversationCreated?: (id: string) => void,
 *   player?: { prime: (key: string, blob: Blob) => void, alias: (from: string, to: string) => void },
 * }} options
 */
export const useAssistantChat = ({ routeConversationId, onConversationCreated, player }) => {
  const queryClient = useQueryClient();
  const state = useSyncExternalStore(liveTurnStore.subscribe, getVisibleState, getVisibleState);

  // Sahifa o'zini ro'yxatdan o'tkazadi: yangi suhbat ochilganda manzilni
  // faqat HOZIR O'RNATILGAN sahifa almashtiradi.
  useEffect(() => {
    const view = { routeId: routeConversationId, onCreated: onConversationCreated };
    session.view = view;
    return () => {
      if (session.view === view) session.view = null;
    };
  }, [routeConversationId, onConversationCreated]);

  /** Matnli xabar. @returns {Promise<{ ok: boolean, restoreText?: string }>} */
  const send = useCallback(
    (text, conversationId) => runTurn({ queryClient, player, text, conversationId }),
    [queryClient, player],
  );

  /** Ovozli xabar. */
  const sendVoice = useCallback(
    (blob, durationMs, conversationId) => runTurn({ queryClient, player, voice: { blob, durationMs }, conversationId }),
    [queryClient, player],
  );

  /** "To'xtatish" — oqim uziladi, server yozilgan qismni `interrupted` saqlaydi. */
  const stop = useCallback(() => session.controller?.abort(), []);

  const isStreaming = state.phase === "streaming";

  return {
    live: state.live,
    isStreaming,
    streamingConversationId: isStreaming ? (state.live?.conversationId ?? null) : null,
    send,
    sendVoice,
    stop,
  };
};

export default useAssistantChat;
