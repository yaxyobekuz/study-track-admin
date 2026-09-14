// React
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * JOYLASHUVNI OLISH — BARCHA PANELLARDA BIR XIL.
 *
 * ⚠️ NIMA UCHUN `watchPosition`, `getCurrentPosition` EMAS:
 * brauzer birinchi javobni odatda eng tez manbadan beradi (wifi/uyali
 * tarmoq) va uning aniqligi 500–3000 m bo'ladi. GPS chipi esa bir necha
 * soniyadan keyin ancha aniq natija beradi. Bitta o'qish bilan cheklansak,
 * ofisda o'tirgan xodim ham "aniqligi past" bo'lib qolardi — "GPS
 * ishlamayapti" degan shikoyatning asosiy sababi aynan shu edi.
 *
 * Shuning uchun kuzatuv ochiladi va:
 *   - aniqlik YAXSHI bo'lishi bilan (<= GOOD_ACCURACY) darhol yakunlanadi;
 *   - aks holda MAX_WAIT_MS gacha eng yaxshi natija saqlanib boriladi;
 *   - u ham bo'lmasa, past aniqlik rejimida bir marta qayta so'raladi
 *     (ba'zi noutbuklarda yuqori aniqlik rejimi umuman javob bermaydi).
 *
 * ⚠️ HECH QACHON XATO TASHLAMAYDI — `null` qaytaradi. Qayd etish
 * joylashuvsiz ham davom etishi kerak: server uni `missing` deb yozadi,
 * xodim esa davomatdan tashqarida qolib ketmaydi.
 */

/** Shundan yaxshi aniqlikni kutib o'tirmaymiz (metr). */
const GOOD_ACCURACY = 50;

/** Eng yaxshi natijani shu muddatgacha kutamiz (ms). */
const MAX_WAIT_MS = 10000;

/** Brauzerga beriladigan qattiq muddat (ms). */
const HARD_TIMEOUT_MS = 20000;

/** Past aniqlik rejimidagi zaxira urinish (ms). */
const FALLBACK_TIMEOUT_MS = 8000;

/** Brauzer xato kodi → o'zbekcha, HARAKATGA CHORLOVCHI xabar. */
const ERROR_MESSAGES = {
  1: "Joylashuvga ruxsat berilmagan — brauzer sozlamasidan ruxsat bering",
  2: "Joylashuv aniqlanmadi — GPS yoki internetni tekshiring",
  3: "Joylashuv aniqlanmadi (vaqt tugadi) — qayta urinib ko'ring",
};

const UNSUPPORTED =
  "Bu brauzer joylashuvni aniqlay olmaydi (yoki sahifa HTTPS emas)";

const toPayload = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  accuracy: position.coords.accuracy,
});

/**
 * @returns {{
 *   coords: {lat: number, lng: number, accuracy: number}|null,
 *   accuracy: number|null,
 *   error: string|null,
 *   loading: boolean,
 *   request: () => Promise<{lat: number, lng: number, accuracy: number}|null>,
 * }}
 */
const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Javob kech kelsa komponent allaqachon yopilgan bo'lishi mumkin.
  const alive = useRef(true);
  // Bir vaqtda ikkita so'rov ochilmasin: karta ochilishida ham, tugma
  // bosilganda ham chaqiriladi — ikkalasi bitta natijani kutadi.
  const inFlight = useRef(null);
  // Ochiq kuzatuvni tashqaridan to'xtatish uchun.
  const abort = useRef(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // ⚠️ Kuzatuv MAJBURAN yopiladi: `watchPosition` komponent
      // yo'qolgani bilan o'zi to'xtamaydi va sahifa ochiq turgan
      // muddat davomida GPS'ni so'rab, batareyani yeb turardi.
      abort.current?.();
    };
  }, []);

  const request = useCallback(() => {
    if (inFlight.current) return inFlight.current;

    const promise = new Promise((resolve) => {
      if (!navigator?.geolocation) {
        if (alive.current) setError(UNSUPPORTED);
        return resolve(null);
      }

      let best = null;
      let watchId = null;
      let waitTimer = null;
      let settled = false;

      const cleanup = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (waitTimer) clearTimeout(waitTimer);
        watchId = null;
        waitTimer = null;
      };

      /** Yakunlash — faqat bir marta ishlaydi. */
      const settle = (payload, errorMessage) => {
        if (settled) return;
        settled = true;
        cleanup();
        abort.current = null;

        if (alive.current) {
          setCoords(payload);
          setError(payload ? null : errorMessage || null);
          setLoading(false);
        }
        resolve(payload);
      };

      /**
       * Zaxira urinish: past aniqlik rejimi va keshdan foydalanish.
       * Yuqori aniqlik rejimi javob bermagan qurilmalarda odatda shu
       * ishlaydi — hech bo'lmasa taxminiy joylashuv yoziladi.
       */
      const fallback = (errorMessage) => {
        navigator.geolocation.getCurrentPosition(
          (position) => settle(toPayload(position)),
          (err) =>
            settle(
              null,
              ERROR_MESSAGES[err?.code] || errorMessage || "Joylashuv aniqlanmadi",
            ),
          {
            enableHighAccuracy: false,
            timeout: FALLBACK_TIMEOUT_MS,
            maximumAge: 60000,
          },
        );
      };

      if (alive.current) setLoading(true);
      abort.current = () => settle(best);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const payload = toPayload(position);

          // Har javobda eng aniq natijani saqlab boramiz.
          if (!best || payload.accuracy < best.accuracy) best = payload;
          if (alive.current) setCoords(best);

          if (best.accuracy <= GOOD_ACCURACY) settle(best);
        },
        (err) => {
          // Kuzatuv davomida bitta natija olingan bo'lsa, xato uni
          // bekor qilmaydi — bor narsa yo'qdan yaxshi.
          if (best) return settle(best);
          cleanup();
          fallback(ERROR_MESSAGES[err?.code]);
        },
        {
          enableHighAccuracy: true,
          timeout: HARD_TIMEOUT_MS,
          maximumAge: 0,
        },
      );

      waitTimer = setTimeout(() => {
        if (best) return settle(best);
        cleanup();
        fallback();
      }, MAX_WAIT_MS);
    }).finally(() => {
      inFlight.current = null;
    });

    inFlight.current = promise;
    return promise;
  }, []);

  return {
    coords,
    accuracy: coords?.accuracy ?? null,
    error,
    loading,
    request,
  };
};

export default useGeolocation;
