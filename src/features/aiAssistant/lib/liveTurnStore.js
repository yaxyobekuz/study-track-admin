/**
 * JONLI TUR OMBORI — sahifadan TASHQARIDA yashaydi (modul darajasida).
 *
 * ⚠️ NEGA REACT HOLATIDA EMAS. Uzun tahlil bir necha daqiqa davom etadi va
 * pullik; ega shu orada moliya ekraniga o'tib raqamni tekshirishi mumkin.
 * Holat sahifa komponentida bo'lganida sahifadan chiqish oqimni "ko'rinmas"
 * qilib qo'yardi: qaytib kelganda savol javobsiz, "yozilmoqda" belgisi yo'q,
 * yuborish tugmasi ochiq — bosilsa server 409 qaytarardi. Bu yerda tur
 * sahifa qayta o'rnatilganda ham davom etib ko'rinadi.
 *
 * ⚠️ SOF MA'LUMOT. Oqim, kesh va toast bu faylda yo'q (`useAssistantChat`
 * da) — ombor faqat holat va uning o'tishlarini biladi, shuning uchun uni
 * amal mutatsiyalari ham xavfsiz import qiladi (aylanma import yo'q).
 *
 *   idle ──start──▶ streaming ──settle──▶ idle
 */

export const IDLE_STATE = Object.freeze({ phase: "idle", live: null, token: null });

let state = IDLE_STATE;
const listeners = new Set();

const upsertById = (list, item) => {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
};

const patchAssistant = (current, patch) => {
  if (!current.live?.assistant) return current;
  return {
    ...current,
    live: { ...current.live, assistant: { ...current.live.assistant, ...patch(current.live.assistant) } },
  };
};

/** Faqat MAVJUD amalni almashtiradi — boshqa turdagi amal jonli javobga qo'shilmaydi. */
const replaceExisting = (message, action) => {
  if (!message?.actions?.some((item) => item.id === action.id)) return message;
  return { ...message, actions: message.actions.map((item) => (item.id === action.id ? action : item)) };
};

function reducer(current, action) {
  switch (action.type) {
    case "start":
      return { phase: "streaming", live: action.live, token: action.token };

    case "conversation":
      if (!current.live) return current;
      return { ...current, live: { ...current.live, conversationId: action.conversationId } };

    case "user_message":
      if (!current.live) return current;
      return {
        ...current,
        live: {
          ...current.live,
          userMessage: action.message,
          assistant: current.live.assistant
            ? { ...current.live.assistant, conversationId: action.message.conversationId }
            : current.live.assistant,
        },
      };

    case "status":
      return patchAssistant(current, () => ({ phaseLabel: action.label }));

    case "step":
      return patchAssistant(current, (assistant) => ({ steps: upsertById(assistant.steps, action.step) }));

    case "delta":
      return patchAssistant(current, (assistant) => ({ content: assistant.content + action.text }));

    case "action":
      return patchAssistant(current, (assistant) => ({ actions: upsertById(assistant.actions, action.action) }));

    case "action_update": {
      if (!current.live) return current;
      const assistant = replaceExisting(current.live.assistant, action.action);
      const final = replaceExisting(current.live.final, action.action);
      if (assistant === current.live.assistant && final === current.live.final) return current;
      return { ...current, live: { ...current.live, assistant, final } };
    }

    case "final":
      if (!current.live) return current;
      return { ...current, live: { ...current.live, final: action.message } };

    case "fail":
      return patchAssistant(current, (assistant) => ({
        status: action.status,
        errorMessage: action.message,
        steps: assistant.steps.map((step) =>
          step.status === "running" ? { ...step, status: "error", error: null } : step,
        ),
      }));

    case "clear":
      return { ...current, live: null };

    case "settle":
      // Yakuniy xabar kelgan bo'lsa jonli nusxa endi ko'rsatilmaydi; aks holda
      // hali "yozilmoqda" turgan javob to'xtatilgan deb belgilanadi.
      if (current.live?.final || current.live?.assistant?.status !== "streaming") {
        return { ...current, phase: "idle" };
      }
      return {
        ...current,
        phase: "idle",
        live: { ...current.live, assistant: { ...current.live.assistant, status: "interrupted" } },
      };

    default:
      return current;
  }
}

export const liveTurnStore = {
  getState: () => state,

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  dispatch: (action) => {
    const next = reducer(state, action);
    if (next === state) return;
    state = next;
    listeners.forEach((listener) => listener());
  },
};

/**
 * Tasdiq/rad natijasini jonli javobdagi kartaga ham yozadi.
 *
 * ⚠️ NEGA KESHNING O'ZI YETMAYDI: to'xtatilgan yoki uzilgan turda yordamchi
 * xabari serverda keyinroq saqlanadi va shu orada ekranda JONLI nusxa
 * turadi. Karta tasdiqlangach faqat kesh yangilansa, jonli nusxa "Tasdiq
 * kutilmoqda" bo'lib qolar, ikkinchi bosish esa 409 "qaror allaqachon
 * qabul qilingan" olardi.
 */
export const patchLiveAction = (action) => {
  if (action?.id) liveTurnStore.dispatch({ type: "action_update", action });
};
