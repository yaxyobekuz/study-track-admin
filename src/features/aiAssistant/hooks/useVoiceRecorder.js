// React
import { useCallback, useEffect, useRef, useState } from "react";

// Data
import { MIN_VOICE_MS, VOICE_COPY } from "../data/aiAssistant.data";

/**
 * OVOZ YOZISH — MediaRecorder + jonli daraja chiziqlari.
 *
 * ⚠️ DARAJA CHIZIQLARI REACT HOLATIDA EMAS. Ular sekundiga ~60 marta
 * yangilanadi; har kadrda `setState` butun yozish maydonini qayta chizardi.
 * Chiziqlar konteyneri `barsRef` orqali ulanadi va `transform`
 * to'g'ridan-to'g'ri yoziladi. Holatda faqat soniya hisoblagichi (250ms).
 *
 * ⚠️ MIKROFON HAR YAKUNDA YOPILADI (yuborish, bekor qilish, xato, sahifadan
 * chiqish): trek to'xtatilmasa brauzer yorlig'ida qizil "mikrofon yoqilgan"
 * belgisi qolib ketadi — egasi uchun bu jiddiy ishonch masalasi.
 *
 * ⚠️ BLOB TURI PARAMETRSIZ (`audio/webm`, `;codecs=opus` siz). Server
 * turlarni aniq ro'yxat bilan tekshiradi.
 */

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export const LEVEL_BARS = 24;

/** Daraja namunasi oralig'i (ms) — chiziqlar shu tezlikda chapga suriladi. */
const SAMPLE_MS = 70;
const TICK_MS = 250;
/** Jimlikda ham chiziq ko'rinib tursin (nuqta emas, qisqa chiziq). */
const MIN_BAR = 0.12;
/**
 * Hajm chegarasidan OLDINROQ to'xtatiladi: oxirgi bo'lak kelguncha fayl
 * yana o'sadi va aniq chegarada to'xtatilgan yozuv baribir rad etilardi.
 */
const BYTES_SAFETY = 0.9;

/** Chiziqlarni tinch holatga qaytaradi. */
const resetBars = (container) => {
  if (!container) return;
  for (const bar of container.children) bar.style.transform = `scaleY(${MIN_BAR})`;
};

const pickMimeType = () => {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const mapStartError = (error) => {
  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return VOICE_COPY.permissionDenied;
    case "NotFoundError":
    case "OverconstrainedError":
      return VOICE_COPY.notFound;
    case "NotReadableError":
    case "AbortError":
      return VOICE_COPY.busy;
    default:
      return VOICE_COPY.failed;
  }
};

/**
 * @param {{
 *   maxSeconds: number,
 *   maxBytes: number,
 *   onRecorded: (blob: Blob, durationMs: number, meta: { reachedLimit: boolean }) => void,
 *   onError: (message: string) => void,
 * }} options
 */
export const useVoiceRecorder = ({ maxSeconds, maxBytes, onRecorded, onError }) => {
  const [status, setStatus] = useState("idle"); // idle | requesting | recording
  const [elapsedMs, setElapsedMs] = useState(0);

  const sessionRef = useRef(null);
  const barsRef = useRef(null);
  const callbacksRef = useRef({ onRecorded, onError, maxSeconds, maxBytes });

  useEffect(() => {
    callbacksRef.current = { onRecorded, onError, maxSeconds, maxBytes };
  });

  /** Hamma resursni bo'shatadi. Takroriy chaqiruv xavfsiz. */
  const teardown = useCallback((session) => {
    if (!session || session.closed) return;
    session.closed = true;
    cancelAnimationFrame(session.frame);
    clearInterval(session.ticker);
    session.stream?.getTracks().forEach((track) => track.stop());
    if (session.audioContext && session.audioContext.state !== "closed") {
      session.audioContext.close().catch(() => {});
    }
    if (sessionRef.current === session) sessionRef.current = null;
  }, []);

  /** Yozishni tugatadi. `send: false` — natija tashlanadi. */
  const finish = useCallback(
    (send, reason = "manual") => {
      const session = sessionRef.current;
      if (!session || session.finishing) return;
      session.finishing = true;
      session.send = send;
      session.reason = reason;
      session.durationMs = performance.now() - session.startedAt;

      if (session.recorder && session.recorder.state !== "inactive") {
        session.recorder.stop();
      } else {
        teardown(session);
        setStatus("idle");
        setElapsedMs(0);
      }
    },
    [teardown],
  );

  const start = useCallback(async () => {
    if (sessionRef.current) return;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      callbacksRef.current.onError(window.isSecureContext ? VOICE_COPY.unsupported : VOICE_COPY.insecure);
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      callbacksRef.current.onError(VOICE_COPY.unsupported);
      return;
    }

    const session = { closed: false, finishing: false, chunks: [], bytes: 0, levels: new Array(LEVEL_BARS).fill(0) };
    sessionRef.current = session;
    setStatus("requesting");
    setElapsedMs(0);

    try {
      session.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (error) {
      teardown(session);
      setStatus("idle");
      callbacksRef.current.onError(mapStartError(error));
      return;
    }

    // Ruxsat oynasi ochiq turganda bekor qilingan yoki sahifa yopilgan.
    if (session.closed || session.finishing) {
      session.stream.getTracks().forEach((track) => track.stop());
      teardown(session);
      setStatus("idle");
      return;
    }

    let recorder;
    try {
      const mimeType = pickMimeType();
      recorder = new MediaRecorder(session.stream, mimeType ? { mimeType } : undefined);
    } catch (error) {
      teardown(session);
      setStatus("idle");
      callbacksRef.current.onError(mapStartError(error));
      return;
    }
    session.recorder = recorder;

    recorder.addEventListener("dataavailable", (event) => {
      if (!event.data?.size) return;
      session.chunks.push(event.data);
      session.bytes += event.data.size;
      if (session.bytes >= callbacksRef.current.maxBytes * BYTES_SAFETY && !session.finishing) {
        finish(true, "limit");
      }
    });

    recorder.addEventListener("stop", () => {
      const { send, durationMs, reason, chunks } = session;
      const type = (recorder.mimeType || chunks[0]?.type || "audio/webm").split(";")[0];
      teardown(session);
      setStatus("idle");
      setElapsedMs(0);
      resetBars(barsRef.current);

      if (!send) return;
      if (durationMs < MIN_VOICE_MS) {
        callbacksRef.current.onError(VOICE_COPY.tooShort);
        return;
      }
      const blob = new Blob(chunks, { type });
      if (!blob.size) {
        callbacksRef.current.onError(VOICE_COPY.failed);
        return;
      }
      if (blob.size > callbacksRef.current.maxBytes) {
        callbacksRef.current.onError(VOICE_COPY.tooLarge);
        return;
      }
      const maxMs = callbacksRef.current.maxSeconds * 1000;
      callbacksRef.current.onRecorded(blob, Math.min(durationMs, maxMs), { reachedLimit: reason === "limit" });
    });

    recorder.addEventListener("error", () => {
      teardown(session);
      setStatus("idle");
      setElapsedMs(0);
      callbacksRef.current.onError(VOICE_COPY.failed);
    });

    // Daraja tahlilchisi — ixtiyoriy: ishlamasa ham yozish davom etadi.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        session.audioContext = new AudioContextClass();
        const source = session.audioContext.createMediaStreamSource(session.stream);
        session.analyser = session.audioContext.createAnalyser();
        session.analyser.fftSize = 1024;
        source.connect(session.analyser);
        session.samples = new Uint8Array(session.analyser.fftSize);
        // `await getUserMedia` dan keyin yaratilgan kontekst Chrome'da
        // "suspended" bo'lib qolishi mumkin — chiziqlar qotib turardi.
        if (session.audioContext.state === "suspended") session.audioContext.resume().catch(() => {});
      }
    } catch {
      session.analyser = null;
    }

    session.startedAt = performance.now();
    session.lastSample = 0;
    try {
      recorder.start(TICK_MS);
    } catch (error) {
      // ⚠️ `start` o'zi ham otishi mumkin (kodek qo'llanmaydi, trek tugagan).
      // Ushlanmasa mikrofon yoqilgancha, tugma esa "ulanmoqda" da qolardi.
      teardown(session);
      setStatus("idle");
      callbacksRef.current.onError(mapStartError(error));
      return;
    }
    setStatus("recording");

    session.ticker = setInterval(() => {
      const elapsed = performance.now() - session.startedAt;
      setElapsedMs(elapsed);
      if (elapsed >= callbacksRef.current.maxSeconds * 1000) finish(true, "limit");
    }, TICK_MS);

    const draw = (now) => {
      if (session.closed) return;
      if (session.analyser && now - session.lastSample >= SAMPLE_MS) {
        session.lastSample = now;
        session.analyser.getByteTimeDomainData(session.samples);
        let sum = 0;
        for (const sample of session.samples) {
          const centered = (sample - 128) / 128;
          sum += centered * centered;
        }
        const rms = Math.sqrt(sum / session.samples.length);
        // Nutq RMS odatda 0.02–0.3 oralig'ida — ko'rinadigan shkalaga cho'ziladi.
        const level = Math.min(1, rms * 4.5);
        session.levels.shift();
        session.levels.push(level);

        const container = barsRef.current;
        if (container) {
          const bars = container.children;
          for (let i = 0; i < bars.length; i += 1) {
            bars[i].style.transform = `scaleY(${Math.max(MIN_BAR, session.levels[i] ?? 0)})`;
          }
        }
      }
      session.frame = requestAnimationFrame(draw);
    };
    session.frame = requestAnimationFrame(draw);
  }, [finish, teardown]);

  const stop = useCallback(() => finish(true), [finish]);
  const cancel = useCallback(() => finish(false), [finish]);

  // Sahifadan chiqish — yozuv tashlanadi, mikrofon yopiladi.
  useEffect(
    () => () => {
      const session = sessionRef.current;
      if (!session) return;
      session.send = false;
      session.finishing = true;
      if (session.recorder && session.recorder.state !== "inactive") session.recorder.stop();
      teardown(session);
    },
    [teardown],
  );

  return {
    status,
    isActive: status !== "idle",
    elapsedMs,
    start,
    stop,
    cancel,
    /** Daraja chiziqlari konteyneri (`LEVEL_BARS` ta bola element). */
    barsRef,
  };
};

export default useVoiceRecorder;
