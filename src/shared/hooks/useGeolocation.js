// React
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * JOYLASHUVNI OLISH — BARCHA PANELLARDA BIR XIL.
 *
 * ⚠️ Fayl to'rt panelda AYNAN bir xil nusxa: admin, teacher, worker,
 * reception. Birida o'zgarsa — to'rttalasida o'zgaradi.
 *
 * ⚠️ NIMA UCHUN `watchPosition`, `getCurrentPosition` EMAS:
 * brauzer birinchi javobni odatda eng tez manbadan beradi (wifi/uyali
 * tarmoq) va uning aniqligi 500–3000 m bo'ladi. GPS chipi esa bir necha
 * soniyadan keyin ancha aniq natija beradi. Bitta o'qish bilan cheklansak,
 * ofisda o'tirgan xodim ham "aniqligi past" bo'lib qolardi.
 *
 * Shuning uchun kuzatuv ochiladi va:
 *   - aniqlik YAXSHI bo'lishi bilan (<= GOOD_ACCURACY) darhol yakunlanadi;
 *   - aks holda birinchi natijadan keyin IMPROVE_WAIT_MS gacha eng
 *     yaxshisi saqlanib boriladi;
 *   - hech narsa kelmasa, past aniqlik rejimida bir marta qayta so'raladi
 *     (ba'zi noutbuklarda yuqori aniqlik rejimi umuman javob bermaydi).
 *
 * ── RUXSAT OYNASI — "BIR QURILMADA ISHLAYDI, BOSHQASIDA YO'Q" ──────────
 *
 * ⚠️ AVTOMATIK SO'ROV FAQAT RUXSAT ALLAQACHON BERILGAN BO'LSA. Ilgari
 * joylashuv sahifa ochilishi bilan so'ralardi va YANGI qurilmada har
 * safar ruxsat oynasi chiqardi. Chrome oynani 3 marta yopgan yoki 4 marta
 * javobsiz qoldirgan saytni 7 kunga JIMGINA bloklaydi: sozlamada "So'rash"
 * turadi, lekin brauzer "ruxsat yo'q" deb javob beradi. Aynan shu sababli
 * bitta qurilmada GPS ishlab, ikkinchisida umuman aniqlanmay qolardi.
 * Endi ruxsat hali berilmagan bo'lsa, oyna faqat odam tugmani bosganda
 * chiqadi ("Aniqlash" yoki "Men keldim").
 *
 * ⚠️ KUTISH SOATI RUXSAT OYNASI OCHIQ TURGANDA YURMAYDI. Ilgari 10 soniya
 * sahifa ochilgan paytdan sanalardi: odam oynani o'qib turganida muddat
 * tugab, so'rov past aniqlik rejimiga tushardi va yangi qurilmadagi
 * birinchi qayd 1–3 km aniqlik bilan "ofisdan tashqarida" bo'lib qolardi.
 *
 * ⚠️ RUXSAT O'ZGARISHI KUZATILADI: odam sozlamadan ruxsat berib qaytsa,
 * joylashuv o'zi qayta aniqlanadi — sahifani yangilash shart emas.
 *
 * ⚠️ HECH QACHON XATO TASHLAMAYDI — `null` qaytaradi. Qayd etish
 * joylashuvsiz ham davom etishi kerak: server uni `missing` deb yozadi,
 * xodim esa davomatdan tashqarida qolib ketmaydi.
 */

/** Shundan yaxshi aniqlikni kutib o'tirmaymiz (metr). */
const GOOD_ACCURACY = 50;

/** Birinchi natijadan keyin yaxshirog'ini shu muddatgacha kutamiz (ms). */
const IMPROVE_WAIT_MS = 8000;

/** Ruxsat bor, lekin hech qanday javob kelmayapti — zaxiraga o'tish (ms). */
const MAX_WAIT_MS = 12000;

/** Ruxsat oynasi ochiq: odamga javob berish uchun vaqt (ms). */
const PROMPT_WAIT_MS = 45000;

/** Brauzerga beriladigan qattiq muddat (ms). */
const HARD_TIMEOUT_MS = 20000;

/** Past aniqlik rejimidagi zaxira urinish (ms). */
const FALLBACK_TIMEOUT_MS = 8000;

/**
 * Shuncha yangi VA aniq natija qayta so'ralmaydi (ms): sahifa ochilganda
 * olingan joylashuv tugma bosilganda yana 10 soniya kuttirmasligi kerak.
 */
const FRESH_FIX_MS = 15000;

/**
 * Ruxsat holati.
 *   unknown     — hali aniqlanmoqda
 *   granted     — berilgan (so'rov oynasiz o'tadi)
 *   prompt      — so'raladi (oyna chiqadi)
 *   denied      — rad etilgan yoki brauzer bloklagan
 *   unsupported — brauzer ruxsat holatini aytmaydi (eski Safari)
 */
export const GEO_PERMISSION = {
  UNKNOWN: "unknown",
  GRANTED: "granted",
  PROMPT: "prompt",
  DENIED: "denied",
  UNSUPPORTED: "unsupported",
};

const UNSUPPORTED_MESSAGE = "Bu brauzer joylashuvni aniqlay olmaydi";

const INSECURE_MESSAGE =
  "Sahifa xavfsiz ulanishda (HTTPS) ochilmagan — joylashuv faqat HTTPS'da ishlaydi";

/**
 * RAD ETILGANDA — QAYERDAN YOQISHNI AYTADI.
 *
 * ⚠️ Umumiy "ruxsat bering" matni yetmaydi: iPhone'da ruxsat brauzerda
 * emas, TIZIM sozlamasida o'chirilgan bo'ladi va odam brauzer ichidan
 * uni hech qachon topa olmaydi.
 */
const deniedMessage = () => {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent || "";

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "Joylashuvga ruxsat yo'q — Sozlamalar → Maxfiylik → Joylashuv xizmatlari: yoqing va brauzeringizga «Ishlatilayotganda» ruxsatini bering";
  }

  if (/Android/i.test(ua)) {
    return "Joylashuvga ruxsat yo'q — telefonda Joylashuv (GPS) yoqilganini tekshiring, so'ng manzil satridagi belgi → Ruxsatlar → Joylashuv → «Ruxsat berish»";
  }

  return "Joylashuvga ruxsat yo'q — manzil satridagi qulf belgisi → Joylashuv → «Ruxsat berish», so'ng qayta urinib ko'ring";
};

/** Brauzer xato kodi → o'zbekcha, HARAKATGA CHORLOVCHI xabar. */
const errorMessageFor = (error) => {
  switch (error?.code) {
    case 1:
      return deniedMessage();
    case 2:
      return "Joylashuv aniqlanmadi — qurilmada Joylashuv (GPS) va internet yoqilganini tekshiring";
    case 3:
      return "Joylashuv aniqlanmadi (vaqt tugadi) — ochiqroq joyda qayta urinib ko'ring";
    default:
      return "Joylashuv aniqlanmadi — qayta urinib ko'ring";
  }
};

const toPayload = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  accuracy: position.coords.accuracy,
});

/** Ikki o'lchovdan aniqrog'i. */
const better = (current, next) =>
  !current || next.accuracy < current.accuracy ? next : current;

/**
 * @param {object} [options]
 * @param {boolean} [options.auto=false] - ruxsat berilgan bo'lsa o'zi aniqlasinmi
 *   (sahifa ochilganda, ruxsat berilganda va sahifaga qaytilganda)
 * @returns {{
 *   coords: {lat: number, lng: number, accuracy: number}|null,
 *   accuracy: number|null,
 *   error: string|null,
 *   loading: boolean,
 *   permission: string,
 *   request: () => Promise<{lat: number, lng: number, accuracy: number}|null>,
 * }}
 */
const useGeolocation = ({ auto = false } = {}) => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(GEO_PERMISSION.UNKNOWN);

  // Javob kech kelsa komponent allaqachon yopilgan bo'lishi mumkin.
  const alive = useRef(true);
  // Bir vaqtda ikkita so'rov ochilmasin: sahifa ochilishida ham, tugma
  // bosilganda ham chaqiriladi — ikkalasi bitta natijani kutadi.
  const inFlight = useRef(null);
  // Ochiq so'rovni tashqaridan boshqarish: to'xtatish va ruxsat o'zgarishi.
  const active = useRef(null);
  // Oxirgi muvaffaqiyatli natija va uning vaqti.
  const lastFix = useRef(null);
  // Ruxsat holati so'rov ichida ham kerak (state yopilgan qiymat bo'lardi).
  const permissionRef = useRef(GEO_PERMISSION.UNKNOWN);

  const request = useCallback(() => {
    const fix = lastFix.current;
    if (
      fix &&
      Date.now() - fix.at <= FRESH_FIX_MS &&
      fix.payload.accuracy <= GOOD_ACCURACY
    ) {
      return Promise.resolve(fix.payload);
    }

    if (inFlight.current) return inFlight.current;

    let finished = false;

    const promise = new Promise((resolve) => {
      let best = null;
      let watchId = null;
      let capTimer = null;
      let improveTimer = null;
      let fallbackTimer = null;

      const geo = typeof navigator === "undefined" ? null : navigator.geolocation;

      const cleanup = () => {
        if (watchId !== null) geo?.clearWatch(watchId);
        clearTimeout(capTimer);
        clearTimeout(improveTimer);
        clearTimeout(fallbackTimer);
        watchId = null;
        capTimer = null;
        improveTimer = null;
        fallbackTimer = null;
      };

      /** Yakunlash — faqat bir marta ishlaydi. */
      const settle = (payload, errorMessage) => {
        if (finished) return;
        finished = true;
        cleanup();

        // ⚠️ SINXRON bo'shatiladi, `.finally()` da EMAS: komponent yopilib
        // darhol qayta ochilganda (React StrictMode, tez navigatsiya)
        // yangi so'rov eski, allaqachon `null` bilan tugagan va'dani
        // qaytarib olardi va joylashuv umuman so'ralmay qolardi.
        inFlight.current = null;
        active.current = null;

        if (payload) lastFix.current = { payload, at: Date.now() };

        if (alive.current) {
          setCoords(payload);
          setError(payload ? null : errorMessage || errorMessageFor(null));
          setLoading(false);
        }
        resolve(payload);
      };

      if (!geo) return settle(null, UNSUPPORTED_MESSAGE);
      if (typeof window !== "undefined" && window.isSecureContext === false) {
        return settle(null, INSECURE_MESSAGE);
      }

      /**
       * Zaxira urinish: past aniqlik rejimi va qisqa keshdan foydalanish.
       * Yuqori aniqlik rejimi javob bermagan qurilmalarda odatda shu
       * ishlaydi — hech bo'lmasa taxminiy joylashuv yoziladi.
       */
      const fallback = () => {
        if (finished) return;
        cleanup();

        // ⚠️ QO'SHIMCHA QAT'IY SOAT: Firefox'da ruxsat oynasi "Hozir emas"
        // bilan yopilsa brauzer HECH QAYSI callback'ni chaqirmaydi va
        // tugma abadiy "Men keldim..." holatida qotib qolardi.
        fallbackTimer = setTimeout(
          () => settle(best, errorMessageFor({ code: 3 })),
          FALLBACK_TIMEOUT_MS + 2000,
        );

        geo.getCurrentPosition(
          (position) => settle(better(best, toPayload(position))),
          (err) => settle(best, errorMessageFor(err)),
          {
            enableHighAccuracy: false,
            timeout: FALLBACK_TIMEOUT_MS,
            maximumAge: 60000,
          },
        );
      };

      /** Umumiy kutish soatini (qayta) qo'yadi. */
      const armCap = (ms) => {
        clearTimeout(capTimer);
        capTimer = setTimeout(() => (best ? settle(best) : fallback()), ms);
      };

      active.current = {
        abort: () => settle(best),
        onPermission: (state) => {
          // Rad etildi — kutishning ma'nosi yo'q
          if (state === GEO_PERMISSION.DENIED && !best) {
            settle(null, deniedMessage());
          }
          if (watchId === null) return;
          // Odam oynada "Ruxsat berish" ni bosdi — soat endi sanaladi
          if (state === GEO_PERMISSION.GRANTED) armCap(MAX_WAIT_MS);
          // Holat so'rov boshlangandan keyin aniqlandi va oyna ochiq
          if (state === GEO_PERMISSION.PROMPT) armCap(PROMPT_WAIT_MS);
        },
      };

      if (alive.current) {
        setLoading(true);
        setError(null);
      }

      watchId = geo.watchPosition(
        (position) => {
          best = better(best, toPayload(position));
          if (alive.current) setCoords(best);

          if (best.accuracy <= GOOD_ACCURACY) return settle(best);

          // Birinchi natija keldi — yaxshirog'ini cheklangan vaqt kutamiz
          if (improveTimer === null) {
            improveTimer = setTimeout(() => settle(best), IMPROVE_WAIT_MS);
          }
        },
        (err) => {
          // Kuzatuv davomida bitta natija olingan bo'lsa, xato uni
          // bekor qilmaydi — bor narsa yo'qdan yaxshi.
          if (best) return settle(best);

          // ⚠️ Rad etilganda zaxira urinish YO'Q: u ham aynan shu javobni
          // olardi va odam faqat 8 soniya ortiqcha kutardi.
          if (err?.code === 1) return settle(null, deniedMessage());

          fallback();
        },
        {
          enableHighAccuracy: true,
          timeout: HARD_TIMEOUT_MS,
          maximumAge: 0,
        },
      );

      if (!finished) {
        armCap(
          permissionRef.current === GEO_PERMISSION.PROMPT ? PROMPT_WAIT_MS : MAX_WAIT_MS,
        );
      }
    });

    // Sinxron tugagan so'rov (brauzer qo'llamaydi) keshga yozilmaydi —
    // aks holda keyingi har bir so'rov o'sha `null` ni qaytarardi.
    if (!finished) inFlight.current = promise;
    return promise;
  }, []);

  // ── Ruxsat holati va uning o'zgarishi ─────────────────────────────
  useEffect(() => {
    alive.current = true;
    // ⚠️ Effektning O'Z bayrog'i, `alive` emas: StrictMode'da effekt
    // yopilib darhol qayta ochiladi va `alive` yana `true` bo'ladi —
    // kech kelgan birinchi javob yopilgan effektga tinglovchi ulab qo'yardi.
    let cancelled = false;
    let status = null;

    const apply = (state) => {
      if (cancelled) return;
      permissionRef.current = state;
      setPermission(state);
      active.current?.onPermission(state);
    };

    try {
      if (!navigator?.permissions?.query) {
        apply(GEO_PERMISSION.UNSUPPORTED);
      } else {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((result) => {
            if (cancelled) return;
            status = result;
            status.onchange = () => apply(result.state);
            apply(result.state);
          })
          .catch(() => apply(GEO_PERMISSION.UNSUPPORTED));
      }
    } catch {
      apply(GEO_PERMISSION.UNSUPPORTED);
    }

    return () => {
      cancelled = true;
      alive.current = false;
      if (status) status.onchange = null;
      // ⚠️ Kuzatuv MAJBURAN yopiladi: `watchPosition` komponent
      // yo'qolgani bilan o'zi to'xtamaydi va sahifa ochiq turgan
      // muddat davomida GPS'ni so'rab, batareyani yeb turardi.
      active.current?.abort();
    };
  }, []);

  // ── Avtomatik aniqlash ───────────────────────────────────────────
  // ⚠️ Faqat ruxsat BERILGAN yoki brauzer holatni aytmaydigan bo'lsa
  // (eski Safari — u yerda avvalgidek so'raladi). `prompt` da oyna faqat
  // odam tugmani bosganda chiqadi (fayl sarlavhasidagi sabab).
  useEffect(() => {
    if (!auto) return;
    if (permission === GEO_PERMISSION.GRANTED || permission === GEO_PERMISSION.UNSUPPORTED) {
      request();
    }
  }, [auto, permission, request]);

  // Sahifaga qaytilganda (sozlamadan GPS yoqib kelgan) — yangilab olamiz.
  // Yangi va aniq natija bo'lsa `request` darhol qaytadi, GPS yoqilmaydi.
  useEffect(() => {
    if (!auto) return undefined;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (permissionRef.current === GEO_PERMISSION.GRANTED) request();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [auto, request]);

  return {
    coords,
    accuracy: coords?.accuracy ?? null,
    error,
    loading,
    permission,
    request,
  };
};

export default useGeolocation;
