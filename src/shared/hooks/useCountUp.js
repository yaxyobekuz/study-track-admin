import { useEffect, useRef, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const isNumeric = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Sonni yakuniy qiymatga qadar "sanab" beradi (count-up).
 *
 * Nima uchun `requestAnimationFrame`: `setInterval` kadr chastotasiga
 * bog'lanmaydi va tab yashiringanda ham ishlayveradi; rAF esa brauzer
 * chizishga tayyor bo'lganda chaqiriladi va animatsiya TUGAGACH tsikl
 * to'xtaydi — fon tasmasida cheksiz JS tsikli qolmaydi (RAM/CPU talabi).
 *
 * Nima uchun `prefers-reduced-motion`: bu foydalanuvchining tizim
 * darajasidagi tanlovi (vestibulyar buzilish, zaif qurilma). Bunday holda
 * yakuniy son DARHOL ko'rsatiladi — ma'lumot yo'qolmaydi, faqat harakat.
 *
 * `target` o'zgarsa animatsiya JORIY qiymatdan yangisiga o'tadi (0 dan
 * emas) — filtr almashganda raqam "yo'qolib qayta tug'ilmaydi".
 * Formatlash chaqiruvchida (mavjud formatlovchilar bilan).
 *
 * @param {number|null|undefined} target  yakuniy qiymat
 * @param {object}  [options]
 * @param {number}  [options.duration=900]  ms
 * @param {number}  [options.decimals=0]    ko'rsatiladigan kasr xonalari
 * @param {boolean} [options.enabled=true]  false → darhol target
 * @returns {number|null} joriy qiymat; `null`/`NaN` target → `null` ("—" chiziladi)
 */
export function useCountUp(target, { duration = 900, decimals = 0, enabled = true } = {}) {
  const valid = isNumeric(target);
  const instant = !enabled || duration <= 0 || prefersReducedMotion();

  // Faqat ANIMATSIYALANGAN qiymat state'da; yaroqsiz/darhol holatlar render
  // vaqtida hisoblanadi — effect ichida sinxron setState yo'q.
  const [animated, setAnimated] = useState(() => (valid && !instant ? 0 : null));
  // Oxirgi ko'rsatilgan qiymat — yangi target shu yerdan boshlanadi.
  const currentRef = useRef(valid ? (instant ? target : 0) : 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!valid || instant) {
      if (valid) currentRef.current = target;
      return undefined;
    }

    const from = isNumeric(currentRef.current) ? currentRef.current : 0;
    const delta = target - from;
    if (delta === 0) return undefined;

    const factor = 10 ** decimals;
    const start = performance.now();

    const tick = (now) => {
      // ⚠️ Pastdan ham chegaralanadi: rAF `now` — KADR vaqti, u effect
      // ichidagi `performance.now()` dan OLDINROQ bo'lishi mumkin. Manfiy
      // `t` ease-out'da manfiy qiymat beradi va birinchi kadrda "-68"
      // kabi son yaltirab o'tardi (headless Chrome'da ko'rindi).
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - (1 - t) ** 3; // ease-out cubic
      const next = t >= 1 ? target : Math.round((from + delta * eased) * factor) / factor;
      currentRef.current = next;
      setAnimated(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null; // tsikl TO'XTADI
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [target, valid, instant, duration, decimals]);

  if (!valid) return null;
  if (instant) return target;
  return isNumeric(animated) ? animated : 0;
}

export default useCountUp;
