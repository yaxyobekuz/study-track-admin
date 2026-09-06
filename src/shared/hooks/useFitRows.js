// React
import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Konteynerga nechta qator sig'ishini O'LCHAB beradi.
 *
 * NIMA UCHUN KERAK:
 * Bir ekranli (scrollsiz) sahifada karta ichidagi ro'yxat uzunligini
 * TAXMIN QILIB BO'LMAYDI. Ikki noto'g'ri yo'l bor edi:
 *   1. karta ichiga `overflow-y-auto` — foydalanuvchi rad etdi
 *      ("karta ichida scroll dabdala bo'lib qolarkan");
 *   2. qat'iy qator soni (`slice(0, 6)`) — ekran balandligi boshqacha
 *      bo'lsa yo ma'lumot kesiladi, yo pastda bo'sh joy qoladi.
 *
 * Shuning uchun piksel taxmin qilinmaydi — O'LCHANADI. `ResizeObserver`
 * konteynerning haqiqiy balandligini kuzatadi va butun qator sonini
 * qaytaradi. Natijada:
 *   - sig'maydigan qator umuman chizilmaydi → MA'LUMOT KESILMAYDI;
 *   - hech qayerda scroll kerak bo'lmaydi;
 *   - katta ekranda ko'proq, kichigida kamroq qator — o'zi moslashadi.
 *
 * ⚠️ `ResizeObserver` `window.resize` dan kuchliroq: yonidagi karta
 * o'sganda oyna o'lchami o'zgarmaydi, lekin bu konteyner kichrayadi.
 *
 * ⚠️ Callback ichida DOM o'lchamiga TEGILMAYDI (faqat state yoziladi) —
 * aks holda "ResizeObserver loop completed with undelivered
 * notifications" xatosi chiqadi.
 *
 * @param {Object} options
 * @param {number} options.rowHeight - bitta qatorning to'liq balandligi (px, oraliq bilan)
 * @param {number} [options.headerHeight=0] - ro'yxat ustidagi qo'zg'almas qism (sarlavha, filtr) balandligi
 * @param {number} [options.min=1] - eng kam qator soni
 * @param {number} [options.max=Infinity] - eng ko'p qator soni; `ResizeObserver` bo'lmasa shu qaytadi
 * @returns {[Function, number]} `[ref, rowCount]` — `ref` o'lchanadigan konteynerga qo'yiladi
 */
const useFitRows = ({
  rowHeight,
  headerHeight = 0,
  min = 1,
  max = Infinity,
}) => {
  // Callback ref: element almashsa (shartli render) effekt qayta ishga tushadi
  const [node, setNode] = useState(null);

  // `ResizeObserver` yo'q muhitda (eski brauzer, jsdom testi) hech narsa
  // o'lchanmaydi — cheklovsiz `max` qaytadi va sahifa odatdagidek oqadi.
  const [rowCount, setRowCount] = useState(max);

  // Oxirgi ma'lum qiymat: konteyner balandligi 0 bo'lganda (hali
  // chizilmagan yoki `display: none`) qator soni 0 ga tushib, karta bir
  // kadr bo'sh ko'rinmasligi uchun kerak.
  const lastCountRef = useRef(max);

  const clamp = useCallback(
    (value) => {
      if (!Number.isFinite(value)) return min;
      return Math.min(Math.max(value, min), max);
    },
    [min, max]
  );

  // Birinchi bo'yashdan OLDIN o'lchanadi: `useEffect` bo'lsa bir kadr
  // noto'g'ri son bilan chizilib, ko'zga tashlanadigan "sakrash" bo'lardi.
  useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return;

    /**
     * Konteyner balandligidan butun qator sonini hisoblaydi va faqat SON
     * o'zgarganda state yozadi (har piksel uchun render bo'lmasin).
     * @param {number} height - konteynerning joriy balandligi (px)
     */
    const measure = (height) => {
      // Balandlik hali noma'lum — oxirgi ma'lum qiymat saqlanadi.
      if (!height || height <= 0) return;
      if (!Number.isFinite(rowHeight) || rowHeight <= 0) return;

      const next = clamp(Math.floor((height - headerHeight) / rowHeight));
      if (next === lastCountRef.current) return;

      lastCountRef.current = next;
      setRowCount(next);
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // `contentRect` — padding'siz ichki balandlik; `border-box` yozuvi
      // bo'lmagan brauzerlar uchun ham mavjud.
      measure(entry.contentRect.height);
    });

    observer.observe(node);

    // Kuzatuvchining birinchi xabari keyingi kadrda keladi — shuning uchun
    // dastlabki o'lchov qo'lda olinadi.
    measure(node.getBoundingClientRect().height);

    return () => observer.disconnect();
  }, [node, rowHeight, headerHeight, clamp]);

  return [setNode, rowCount];
};

export default useFitRows;
