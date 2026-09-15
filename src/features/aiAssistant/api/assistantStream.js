// Lib
import { readSseFrames } from "../lib/sse";

// Data
import { COPY } from "../data/aiAssistant.data";

/**
 * CHAT OQIMI — `POST /ai-assistant/chat` (SSE).
 *
 * ⚠️ AUTH `shared/api/http.js` BILAN AYNAN BIR XIL: `authToken`,
 * `Authorization: Bearer`, `X-Client: admin`, 401 → token o'chiriladi va
 * `/login` ga o'tiladi. Axios bu yerda ishlatilmaydi — u javobni oqim
 * sifatida o'qiy olmaydi.
 *
 * ⚠️ OVOZLI XABARDA `Content-Type` QO'YILMAYDI. Brauzer `FormData` uchun
 * `boundary` ni o'zi yozadi; qo'lda yozilgan sarlavhada boundary bo'lmaydi
 * va server faylni ko'rmaydi.
 *
 * XATO TURLARI (`AssistantStreamError.kind`):
 *   - `http`         — oqim OCHILMASDAN oldingi JSON xato (400/404/409/429/503)
 *   - `network`      — ulanish umuman bo'lmadi yoki oqim o'rtasida uzildi
 *   - `unauthorized` — 401: sahifa allaqachon `/login` ga yo'naltirildi
 *   - `protocol`     — javob SSE emas (proksi xato sahifasi va h.k.)
 * `AbortError` (to'xtatish tugmasi) o'zgarmasdan otiladi — u xato emas.
 */

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4040").replace(/\/+$/, "");
const CLIENT = "admin";

export class AssistantStreamError extends Error {
  /**
   * @param {string} message
   * @param {{ kind: "http"|"network"|"unauthorized"|"protocol", status?: number, reason?: string|null, streamStarted?: boolean }} info
   */
  constructor(message, { kind, status = 0, reason = null, streamStarted = false }) {
    super(message);
    this.name = "AssistantStreamError";
    this.kind = kind;
    this.status = status;
    this.reason = reason;
    this.streamStarted = streamStarted;
  }
}

export const isAbortError = (error) => error?.name === "AbortError";

const buildRequest = ({ text, conversationId, voice }) => {
  const token = localStorage.getItem("authToken");
  const headers = {
    Accept: "text/event-stream",
    "X-Client": CLIENT,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (voice) {
    const form = new FormData();
    if (conversationId) form.append("conversationId", conversationId);
    form.append("durationMs", String(Math.round(voice.durationMs)));
    form.append("audio", voice.blob, voice.fileName);
    return { headers, body: form };
  }

  return {
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ text, ...(conversationId ? { conversationId } : {}) }),
  };
};

const readJsonError = async (response) => {
  try {
    const data = await response.json();
    return {
      message: typeof data?.message === "string" && data.message ? data.message : COPY.genericError,
      reason: data?.details?.reason ?? null,
    };
  } catch {
    return { message: COPY.genericError, reason: null };
  }
};

/**
 * @param {{
 *   text?: string,
 *   conversationId?: string|null,
 *   voice?: { blob: Blob, durationMs: number, fileName: string } | null,
 *   signal: AbortSignal,
 *   onEvent: (event: string, data: object) => void,
 * }} options
 * @returns {Promise<{ completed: boolean }>} `completed` — `done` hodisasi keldimi
 */
export async function streamAssistantChat({ text, conversationId, voice, signal, onEvent }) {
  const { headers, body } = buildRequest({ text, conversationId, voice });

  let response;
  try {
    response = await fetch(`${API_URL}/ai-assistant/chat`, { method: "POST", headers, body, signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AssistantStreamError(COPY.networkError, { kind: "network" });
  }

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    throw new AssistantStreamError(COPY.genericError, { kind: "unauthorized", status: 401 });
  }

  if (!response.ok) {
    const { message, reason } = await readJsonError(response);
    // Xato tanasini o'qish paytida "To'xtatish" bosilgan bo'lsa — bu xato
    // emas: egaga "Xatolik yuz berdi" toast'i chiqmasin.
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    throw new AssistantStreamError(message, { kind: "http", status: response.status, reason });
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream") || !response.body) {
    throw new AssistantStreamError(COPY.genericError, { kind: "protocol", status: response.status });
  }

  const frames = readSseFrames(response.body);
  let completed = false;

  for (;;) {
    let step;
    try {
      step = await frames.next();
    } catch (error) {
      if (isAbortError(error) || signal.aborted) throw new DOMException("Aborted", "AbortError");
      throw new AssistantStreamError(COPY.connectionLost, { kind: "network", streamStarted: true });
    }
    if (step.done) break;

    let data;
    try {
      data = JSON.parse(step.value.data);
    } catch {
      // Server har kadrni bir qatorli JSON qilib yozadi; buzilgan kadr
      // butun javobni to'xtatmasin — keyingi hodisalar mustaqil.
      continue;
    }

    try {
      onEvent(step.value.event, data);
    } catch (error) {
      // ⚠️ Ishlovchidagi xato OQIM XATOSI EMAS: u "aloqa uzildi" deb
      // yashirilmaydi. Oqim yopiladi (server turni to'xtatadi), xato esa
      // o'zgarmasdan yuqoriga chiqadi.
      await frames.return();
      throw error;
    }

    if (step.value.event === "done") {
      completed = true;
      await frames.return();
      break;
    }
  }

  return { completed };
}
