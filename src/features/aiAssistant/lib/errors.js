// Data
import { COPY } from "../data/aiAssistant.data";

/**
 * Server xatosidan egaga ko'rsatiladigan matn.
 *
 * ⚠️ BLOB JAVOB. Audio so'rovlari `responseType: "blob"` bilan ketadi va
 * server xatosi (`{ success:false, message }`) ham Blob bo'lib keladi —
 * `error.response.data.message` u yerda `undefined`. Shu sababli funksiya
 * asinxron: Blob bo'lsa matni o'qib JSON sifatida ochiladi.
 *
 * @param {unknown} error - axios xatosi
 * @param {string} fallback
 * @returns {Promise<string>}
 */
export const readErrorMessage = async (error, fallback) => {
  const data = error?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (typeof parsed?.message === "string" && parsed.message) return parsed.message;
    } catch {
      return fallback;
    }
    return fallback;
  }
  return getErrorMessage(error, fallback);
};

/**
 * Sinxron variant (JSON javoblar uchun).
 * @param {unknown} error
 * @param {string} fallback
 * @returns {string}
 */
export const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message) return message;
  if (error?.code === "ERR_NETWORK") return COPY.networkError;
  return fallback;
};

/** 409/400 javobidagi mashina o'qiydigan sabab (`details.reason`). */
export const getErrorReason = (error) => error?.response?.data?.details?.reason ?? null;
