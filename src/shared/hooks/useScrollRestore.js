// React
import { useCallback, useEffect } from "react";

// Router
import { useLocation, useNavigationType } from "react-router-dom";

const storageKeyOf = (locationKey) => `scroll:${locationKey}`;

/**
 * Ro'yxatdan ichkariga kirib, "orqaga" bilan qaytilganda sahifani O'SHA
 * joyiga (scroll) qaytaradi.
 *
 * Brauzerning o'z tiklashi SPA'da ishonchsiz: u `popstate` paytida ishlaydi,
 * sahifa esa hali chizilmagan — balandlik yetmay, joy tepaga "qisilib"
 * qoladi. Shuning uchun joy ma'lumot tayyor bo'lgach (`ready`) qo'yiladi.
 *
 * Kalit — tarix yozuvining `location.key` i: joy aynan o'sha yozuvga
 * qaytilganda tiklanadi, menyudan yangidan ochilganda esa sahifa tepadan
 * boshlanadi.
 *
 * @param {boolean} ready - sahifa to'liq chizildimi (ma'lumot yuklandimi)
 * @returns {() => void} ichkariga o'tishdan OLDIN chaqiriladi
 *
 * @example
 * const saveScroll = useScrollRestore(Boolean(data));
 * onClick={() => { saveScroll(); navigate(path); }}
 */
const useScrollRestore = (ready) => {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (!ready || navigationType !== "POP") return;

    let saved = null;
    try {
      saved = sessionStorage.getItem(storageKeyOf(key));
    } catch {
      return;
    }
    if (saved == null) return;

    const frame = requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
    return () => cancelAnimationFrame(frame);
  }, [ready, navigationType, key]);

  return useCallback(() => {
    try {
      sessionStorage.setItem(storageKeyOf(key), String(window.scrollY));
    } catch {
      // Saqlab bo'lmasa (maxfiy oyna) — qaytishda sahifa tepadan ochiladi
    }
  }, [key]);
};

export default useScrollRestore;
