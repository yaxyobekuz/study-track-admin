// React
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

/**
 * SAHIFA UCHUN YAGONA AUDIO PLEYER (ovozli xabarlar + javobni ovozda o'qish).
 *
 * ⚠️ BITTA `<audio>` ELEMENTI. Har klipda alohida element bo'lsa, ikkinchi
 * klip bosilganda birinchisi ham o'ynab turardi; bu yerda yangi ijro eskisini
 * o'zi to'xtatadi.
 *
 * ⚠️ HOLAT TASHQI OMBORDA (`useSyncExternalStore`), React holatida EMAS.
 * `timeupdate` sekundiga ~4 marta keladi: holat kontekstda bo'lsa, har
 * safar suhbatdagi HAMMA xabar qayta chizilardi. Bu yerda faqat ijro
 * etilayotgan klipga obuna bo'lgan komponent yangilanadi — qolganlari bir
 * xil `IDLE` obyektini oladi va chizilmaydi.
 *
 * ⚠️ BLOB URL LAR KESHDA, SAHIFA YOPILGANDA BO'SHATILADI (`destroy`).
 * Audio TanStack keshiga qo'yilmaydi: `URL.createObjectURL` qo'lda
 * bo'shatilishi shart va buni kesh tozalovchisi bilmaydi.
 *
 * ⚠️ BRAUZER RUXSATI (autoplay). Ovozda o'qish serverda bir necha soniya
 * tayyorlanadi va shu orada bosishning "foydalanuvchi harakati" muddati
 * tugab, `play()` rad etilishi mumkin (ayniqsa Safari). Shu sababli bosish
 * paytida element jim klip bilan DARHOL "ochiladi", tayyor audio keyin
 * shu elementda ijro etiladi.
 */

export const IDLE_PLAYBACK = Object.freeze({ key: null, status: "idle", currentTime: 0, duration: 0 });

/** 0,05 soniyalik jim WAV (8 kHz, 8-bit) — elementni bosish paytida ochish uchun. */
const createSilentWavUrl = () => {
  const samples = 400;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const writeText = (offset, text) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeText(36, "data");
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i += 1) view.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
};

export class PlaybackError extends Error {
  /** @param {"blocked"|"failed"|"load"} kind */
  constructor(kind, cause) {
    super(kind);
    this.name = "PlaybackError";
    this.kind = kind;
    this.cause = cause;
  }
}

/**
 * @returns {{
 *   subscribe: (listener: () => void) => () => void,
 *   getSnapshot: () => typeof IDLE_PLAYBACK,
 *   toggle: (key: string, load: (signal: AbortSignal) => Promise<Blob>, options?: { durationMs?: number }) => Promise<void>,
 *   stop: () => void,
 *   seek: (ratio: number) => void,
 *   prime: (key: string, blob: Blob) => void,
 *   alias: (from: string, to: string) => void,
 *   destroy: () => void,
 * }}
 */
export const createAudioPlayer = () => {
  const listeners = new Set();
  const urls = new Map();
  let snapshot = IDLE_PLAYBACK;
  let audio = null;
  let activeUrl = null;
  let silentUrl = null;
  let hintDuration = 0;
  let request = 0;
  let loadController = null;

  const emit = (next) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const patch = (values) => emit({ ...snapshot, ...values });

  const isActive = () => Boolean(audio && activeUrl && audio.src === activeUrl);

  const resolveDuration = () => {
    // MediaRecorder yozgan webm faylda davomiylik yozilmaydi (`Infinity`) —
    // bunday holda server saqlagan davomiylik ishlatiladi.
    const real = audio?.duration;
    return Number.isFinite(real) && real > 0 ? real : hintDuration;
  };

  const ensureAudio = () => {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("timeupdate", () => {
      if (isActive()) patch({ currentTime: audio.currentTime, duration: resolveDuration() });
    });
    audio.addEventListener("durationchange", () => {
      if (isActive()) patch({ duration: resolveDuration() });
    });
    audio.addEventListener("playing", () => {
      if (isActive()) patch({ status: "playing", duration: resolveDuration() });
    });
    audio.addEventListener("pause", () => {
      if (isActive() && !audio.ended && snapshot.status === "playing") patch({ status: "paused" });
    });
    audio.addEventListener("ended", () => {
      if (isActive()) patch({ status: "idle", currentTime: 0 });
    });
    audio.addEventListener("error", () => {
      if (isActive()) emit(IDLE_PLAYBACK);
    });
    return audio;
  };

  const unlock = (element) => {
    if (!silentUrl) silentUrl = createSilentWavUrl();
    element.src = silentUrl;
    element.play().catch(() => {});
  };

  const stop = () => {
    request += 1;
    // Tayyorlanayotgan ovoz (pullik TTS) so'rovi ham bekor qilinadi.
    loadController?.abort();
    loadController = null;
    if (audio) {
      audio.pause();
      activeUrl = null;
    }
    emit(IDLE_PLAYBACK);
  };

  const toggle = async (key, load, { durationMs = 0 } = {}) => {
    const element = ensureAudio();

    if (snapshot.key === key) {
      if (snapshot.status === "playing") {
        element.pause();
        return;
      }
      if (snapshot.status === "paused") {
        try {
          await element.play();
        } catch (error) {
          throw new PlaybackError("blocked", error);
        }
        return;
      }
      if (snapshot.status === "loading") {
        stop();
        return;
      }
    }

    loadController?.abort();
    loadController = null;
    request += 1;
    const token = request;
    element.pause();
    activeUrl = null;
    hintDuration = durationMs > 0 ? durationMs / 1000 : 0;
    emit({ key, status: "loading", currentTime: 0, duration: hintDuration });

    let url = urls.get(key);
    if (!url) {
      unlock(element);
      const controller = new AbortController();
      loadController = controller;
      let blob;
      try {
        blob = await load(controller.signal);
      } catch (error) {
        // Bekor qilingan (boshqa klip bosildi / to'xtatildi) — xato emas.
        if (token !== request) return;
        loadController = null;
        emit(IDLE_PLAYBACK);
        throw new PlaybackError("load", error);
      }
      if (loadController === controller) loadController = null;
      url = urls.get(key) ?? URL.createObjectURL(blob);
      urls.set(key, url);
      if (token !== request) return;
    }

    activeUrl = url;
    element.src = url;
    try {
      await element.play();
    } catch (error) {
      if (token !== request) return;
      activeUrl = null;
      emit(IDLE_PLAYBACK);
      throw new PlaybackError(error?.name === "NotAllowedError" ? "blocked" : "failed", error);
    }
  };

  const seek = (ratio) => {
    if (!isActive()) return;
    const duration = resolveDuration();
    if (!duration) return;
    const time = Math.min(duration, Math.max(0, ratio * duration));
    audio.currentTime = time;
    patch({ currentTime: time });
  };

  const prime = (key, blob) => {
    if (!urls.has(key)) urls.set(key, URL.createObjectURL(blob));
  };

  const alias = (from, to) => {
    const url = urls.get(from);
    if (url && !urls.has(to)) urls.set(to, url);
  };

  const destroy = () => {
    stop();
    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }
    new Set(urls.values()).forEach((url) => URL.revokeObjectURL(url));
    urls.clear();
    if (silentUrl) URL.revokeObjectURL(silentUrl);
    silentUrl = null;
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    toggle,
    stop,
    seek,
    prime,
    alias,
    destroy,
  };
};

export const AudioPlaybackContext = createContext(null);

/**
 * Sahifa darajasida pleyer yaratadi va chiqishda bo'shatadi.
 * @returns {ReturnType<typeof createAudioPlayer>}
 */
export const useAudioPlayerInstance = () => {
  const [player] = useState(createAudioPlayer);
  useEffect(() => () => player.destroy(), [player]);
  return player;
};

/** Kontekstdagi pleyer (Provider ichida). */
export const useAudioPlayer = () => {
  const player = useContext(AudioPlaybackContext);
  if (!player) throw new Error("useAudioPlayer AudioPlaybackContext ichida ishlatilishi kerak");
  return player;
};

/**
 * Bitta klipning ijro holati. Boshqa klip o'ynayotganda doim `IDLE_PLAYBACK`
 * (bir xil obyekt) qaytadi — komponent qayta chizilmaydi.
 * @param {string|null} key
 */
export const usePlayback = (key) => {
  const player = useAudioPlayer();
  const getSnapshot = useCallback(() => {
    const snapshot = player.getSnapshot();
    return key && snapshot.key === key ? snapshot : IDLE_PLAYBACK;
  }, [player, key]);
  return useSyncExternalStore(player.subscribe, getSnapshot, getSnapshot);
};
