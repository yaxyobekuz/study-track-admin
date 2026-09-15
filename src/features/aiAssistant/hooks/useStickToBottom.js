// React
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SUHBAT PASTGA "YOPISHIB" TURADI — egasi yuqoriga surmaguncha.
 *
 * ⚠️ CSS `scroll-smooth` ISHLATILMAYDI. Oqim paytida har kadrda pastga
 * suriladi; silliq animatsiya bilan har surish oldingisini kechiktirib,
 * "pastdami?" o'lchovi animatsiya o'rtasida "yo'q" deb qaytardi va yopishish
 * o'z-o'zidan uzilib qolardi. Silliq surish faqat "Pastga" tugmasida.
 *
 * ⚠️ O'LCHAM `ResizeObserver` BILAN, xabarlar soni bilan emas: jadval,
 * ochilgan qadamlar ro'yxati yoki amal kartasi ham balandlikni o'zgartiradi
 * va ularning hech biri "yangi xabar" emas.
 *
 * ⚠️ "YUQORIGA SURDI" faqat foydalanuvchi surishidan aniqlanadi (`scrollTop`
 * kamaydi). Kontent o'sishi `scroll` hodisasini chiqarmaydi, dasturiy
 * pastga surish esa `scrollTop` ni faqat oshiradi — ikkalasi yopishishni
 * uzmaydi.
 *
 * ⚠️ BO'SH/YUKLANAYOTGAN OYNADA YOPISHMAYDI (`enabled: false`) va boshiga
 * qaytadi. Aks holda tor ekranda "Yangi suhbat" takliflari pastga surilib,
 * sarlavha va izoh ko'rinmay qolardi (yoki oldingi suhbatning surilgan
 * joyi saqlanib qolardi).
 *
 * @param {unknown} resetKey - o'zgarganda (boshqa suhbat) yana pastga yopishadi
 * @param {boolean} [enabled=true] - xabarlar ro'yxati ko'rsatilmoqdami
 */
const useStickToBottom = (resetKey, enabled = true) => {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const stickRef = useRef(true);
  const lastTopRef = useRef(0);
  const [showJump, setShowJump] = useState(false);

  const measure = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return 0;
    return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
  }, []);

  const updateJump = useCallback(() => {
    const far = measure() > 160;
    setShowJump((prev) => (prev === far ? prev : far));
  }, [measure]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return undefined;

    stickRef.current = true;
    if (!enabled) {
      scroller.scrollTop = 0;
      lastTopRef.current = 0;
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (stickRef.current) scroller.scrollTop = scroller.scrollHeight;
      lastTopRef.current = scroller.scrollTop;
      updateJump();
    });
    observer.observe(content);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [resetKey, enabled, updateJump]);

  const onScroll = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const top = scroller.scrollTop;
    const movedUp = top < lastTopRef.current - 1;
    lastTopRef.current = top;

    if (!enabled) return;
    const distance = measure();
    if (distance <= 40) stickRef.current = true;
    else if (movedUp) stickRef.current = false;
    updateJump();
  }, [enabled, measure, updateJump]);

  /** "Pastga" tugmasi — silliq. */
  const jumpToBottom = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    stickRef.current = true;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, []);

  /** Xabar yuborilganda — darhol pastga va yana yopishadi. */
  const stickToBottom = useCallback(() => {
    const scroller = scrollRef.current;
    stickRef.current = true;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, []);

  return { scrollRef, contentRef, onScroll, showJump, jumpToBottom, stickToBottom };
};

export default useStickToBottom;
