// React
import { useEffect, useRef, useState } from "react";

/**
 * RAQAMNING SANALIB CHIQISHI — noldan haqiqiy qiymatgacha.
 *
 * ⚠️ NIMA UCHUN KERAK. Blok `rise` bilan kirganda ichidagi raqam
 * allaqachon yakuniy holatda turadi va harakat "quti uchdi, raqam
 * turibdi" bo'lib ko'rinadi. Sanoq esa ko'zni raqamning O'ZIGA olib
 * keladi — bu dashboardning asosiy mazmuni.
 *
 * ⚠️ `prefers-reduced-motion` da sanoq UMUMAN ishlamaydi: qiymat darhol
 * yakuniy holatda turadi. Bu CSS `motion-safe:` bilan bir xil qoida,
 * faqat JS tomonida.
 *
 * ⚠️ `requestAnimationFrame`, `setInterval` EMAS: interval kadrga
 * tushmay qolganda raqam sakraydi. Har kadrda o'tgan VAQT o'lchanadi,
 * kadr soni emas — sekin qurilmada sanoq baribir bir xil davom etadi.
 *
 * ⚠️ HOLAT NISHONI BILAN BIRGA saqlanadi (`{ target, value }`) va
 * qaytarishda solishtiriladi. Ikki sabab bor:
 *   1. Effekt TANASIDA `setState` chaqirilmaydi — yangi ma'lumot
 *      kelganda eski sanoq qiymati "eskirgan" deb render paytida
 *      chetlab o'tiladi, effekt esa faqat yangi animatsiyani boshlaydi.
 *   2. Yangi qiymat kelgan LAHZADA ekranda eski raqam ko'rinib
 *      qolmaydi: `target` mos kelmasa, darhol yangisi qaytariladi.
 *
 * @param {number} target - yakuniy qiymat
 * @param {object} [options]
 * @param {number} [options.duration=1100] - davomiylik (ms)
 * @param {number} [options.delay=0] - boshlanish kechikishi (ms)
 * @param {number} [options.decimals=0] - kasr xonalar
 * @returns {number}
 */
const useCountUp = (target, { duration = 1100, delay = 0, decimals = 0 } = {}) => {
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0;

  const [state, setState] = useState({ target: safeTarget, value: safeTarget });
  const frameRef = useRef(0);
  const timerRef = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sanashga arziydigan narsa yo'q — qiymat renderda o'zi to'g'ri
    // chiqadi (`state.target !== safeTarget` sharti), effekt esa
    // hech narsa yozmaydi
    if (reduced || safeTarget === 0) return undefined;

    const factor = 10 ** decimals;
    // Kirish egri chizig'i — `ease-out-quint` bilan bir xil his
    const ease = (t) => 1 - (1 - t) ** 5;

    const run = () => {
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setState({
          target: safeTarget,
          value: Math.round(safeTarget * ease(progress) * factor) / factor,
        });
        if (progress < 1) frameRef.current = requestAnimationFrame(step);
      };

      setState({ target: safeTarget, value: 0 });
      frameRef.current = requestAnimationFrame(step);
    };

    timerRef.current = window.setTimeout(run, delay);

    return () => {
      window.clearTimeout(timerRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [safeTarget, duration, delay, decimals]);

  return state.target === safeTarget ? state.value : safeTarget;
};

export default useCountUp;
