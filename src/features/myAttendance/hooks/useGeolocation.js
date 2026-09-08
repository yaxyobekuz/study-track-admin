// React
import { useCallback, useEffect, useRef, useState } from "react";

/** Brauzer xato kodi → o'zbekcha, HARAKATGA CHORLOVCHI xabar. */
const ERROR_MESSAGES = {
  1: "Joylashuvga ruxsat berilmagan — brauzer sozlamasidan ruxsat bering",
  2: "Joylashuv aniqlanmadi — GPS yoki internetni tekshiring",
  3: "Joylashuv aniqlanmadi (vaqt tugadi) — qayta urinib ko'ring",
};

const UNSUPPORTED =
  "Bu brauzer joylashuvni aniqlay olmaydi (yoki sahifa HTTPS emas)";

/**
 * Geolokatsiyani bir martalik so'rash.
 *
 * ⚠️ QAYD ETISH JOYLASHUVSIZ HAM DAVOM ETADI. Server `lat`/`lng` kelmasa
 * shunchaki geo-tekshiruvni o'tkazib yuboradi (`attendance.service.js`),
 * ya'ni GPS o'chiq telefon xodimni davomatdan butunlay chetlab qo'ymaydi.
 * Shuning uchun `request()` xato TASHLAMAYDI — `null` qaytaradi va sababi
 * `error` da ko'rinib turadi.
 *
 * @returns {{accuracy: number|null, error: string|null, request: () => Promise<object|null>}}
 */
const useGeolocation = () => {
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  // Javob kech kelsa (timeout 15s) komponent allaqachon yopilgan bo'lishi
  // mumkin — o'chgan komponentga yozmaymiz.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const request = useCallback(
    () =>
      new Promise((resolve) => {
        if (!navigator?.geolocation) {
          if (alive.current) setError(UNSUPPORTED);
          return resolve(null);
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy: acc } = position.coords;

            if (alive.current) {
              setAccuracy(acc);
              setError(null);
            }

            resolve({ lat: latitude, lng: longitude, accuracy: acc });
          },
          (err) => {
            if (alive.current) {
              setAccuracy(null);
              setError(ERROR_MESSAGES[err?.code] || "Joylashuv aniqlanmadi");
            }
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
        );
      }),
    [],
  );

  return { accuracy, error, request };
};

export default useGeolocation;
