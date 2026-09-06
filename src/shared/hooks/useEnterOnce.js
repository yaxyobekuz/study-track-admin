import { useCallback, useState } from "react";

/**
 * KIRISH ANIMATSIYASI — BIR MARTA, KEYIN OLIB TASHLANADI.
 *
 * Nima uchun: `animate-fade-up` `both` fill-mode bilan e'lon qilingan
 * (kechikish paytida element ko'rinmasin). Lekin `both` animatsiya
 * tugagach ham keyframe'ning yakuniy `transform` ini elementda USHLAB
 * TURADI, va CSS'da animatsiya qiymati oddiy deklaratsiyalardan ustun —
 * ya'ni hover'dagi `-translate-y-0.5` (karta ko'tarilishi) HECH QACHON
 * ko'rinmasdi. Yechim: `animationend` da sinfni olib tashlash. Yakuniy
 * kadr = tabiiy holat (opacity 1, transform yo'q), shuning uchun sinf
 * olib tashlanganda bir piksel ham siljish bo'lmaydi.
 *
 * ⚠️ `e.target === e.currentTarget` — ichki elementlarning (tana fade'i,
 * progress chizig'i) `animationend` hodisasi yuqoriga ko'tariladi va
 * kartaning o'z animatsiyasi tugamay turib sinfni olib tashlab qo'yardi.
 *
 * `prefers-reduced-motion` da `motion-safe:` sinf o'chiq — hodisa kelmaydi,
 * `entered` false qoladi; hover ko'tarilishi ham `motion-safe:` — muammo yo'q.
 *
 * @param {string} enterClass  kirish sinfi (masalan `MOTION.enter`)
 * @returns {{ enterClass: string|false, onAnimationEnd: Function }}
 */
export function useEnterOnce(enterClass) {
  const [entered, setEntered] = useState(false);

  const onAnimationEnd = useCallback((event) => {
    if (event.target === event.currentTarget) setEntered(true);
  }, []);

  return { enterClass: entered ? false : enterClass, onAnimationEnd };
}

export default useEnterOnce;
