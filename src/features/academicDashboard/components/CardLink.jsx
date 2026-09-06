// React Router
import { Link } from "react-router-dom";

// Icons
import { ArrowRight } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Design tokens
import { T } from "../data/dashboard.tokens";

/**
 * Kartaning PASTKI HAVOLASI — "batafsil" qadamining yagona ko'rinishi.
 *
 * ⚠️ Dashboardda to'qqizta karta bor va har birining tagida shu
 * element turadi. Har karta o'z tugmasini yozsa, birinchi kichik
 * o'zgarishdayoq ular bir-biridan ajralib ketardi (aynan `DashboardCard`
 * shared bo'lgani bilan bir sabab).
 *
 * ⚠️ `to` BERILSA — `Link`, `onClick` berilsa — `button`. Ikkalasi ham
 * bo'lmasa element UMUMAN chizilmaydi: hech qayerga olib bormaydigan
 * "havola" — bezak, va bu kodbazada bezak taqiqlangan.
 *
 * ⚠️ `disabled` — RUXSATI YO'Q foydalanuvchi uchun. Bu holatda element
 * o'chiriladi, lekin JOYIDA QOLADI: kartalar to'rda yonma-yon turadi va
 * havolasi olib tashlangan karta qo'shnisidan ~40px past tugab, butun
 * qatorning pastki chizig'ini buzardi. Ayni paytda foydalanuvchi bu
 * qadam MAVJUD ekanini, faqat unga ruxsati yo'qligini ko'radi — havola
 * jimgina yo'qolib qolsa, u bunday bo'lim borligini ham bilmasdi.
 */
/**
 * ⚠️ IKKI O'LCHAM BOR, LEKIN BITTA EKRANDA FAQAT BITTASI: oddiy oqimda
 * `mt-3` + `py-1.5` + `text-xs` (40px), bir ekranli rejimda esa
 * `mt-2` + `py-1` + 11px matn (30px). Farq EKRANGA bog'langan, kartaga
 * emas — shuning uchun bitta ekranda ikki xil tugma hosil bo'lmaydi:
 * `fitscreen` da to'qqizala havola bir vaqtda kichrayadi.
 *
 * Nima uchun umuman kichrayadi: havola to'qqizala kartaning tagida
 * turadi va uning har 4px i bir ekranli rejimda ro'yxatdan o'g'irlangan
 * 4px. 40 → 30 degani har kartada +10px ma'lumot maydoni.
 *
 * ⚠️ QUYI CHEGARA — 11px va `py-1`. Bu BOSILADIGAN element: matni
 * `text-[10px]` ga tushirilmaydi (yorliqlar chegarasi bosiladigan
 * elementga o'tmaydi) va nishon maydoni bundan kichraytirilmaydi.
 * `leading-[14px]` — `text-xs` dan meros qolgan 16px qator qutisini
 * ikonka o'lchamiga (14px) tenglashtiradi, ya'ni ortiqcha 2px yo'qoladi;
 * ikonka esa `size-3` ga tushib, tugma balandligini 30px da ushlab
 * turadi.
 *
 * Rang/vazn/hover — `T.link` (tokendan). O'LCHAMLAR shu yerda, chunki
 * ular `useFitRows` hisobiga bog'liq (30px): token `px-2 py-1 text-[11px]`
 * beradi, `BASE` uni oddiy oqimda `py-1.5 text-xs` ga, `fitscreen` da
 * yana 11px/`py-1` ga qaytaradi — twMerge'da keyingisi yutadi. `ring-1`
 * box-shadow — balandlikka qo'shilmaydi.
 */
const BASE = [
  "mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs",
  "fitscreen:mt-2 fitscreen:py-1 fitscreen:text-[11px] fitscreen:leading-[14px]",
].join(" ");

/**
 * `group` — hover'da strelka 2px o'ngga siljiydi (`T.linkArrow`): "bu
 * yerga bosilsa o'tiladi" degan ishorani matnsiz beradi. Transform —
 * layout'ga tegmaydi, `useFitRows` o'lchovi o'zgarmaydi. O'chirilgan
 * havolada `group` YO'Q — bosilmaydigan element harakat qilmasligi kerak.
 */
const STYLE = cn(T.link, BASE, "group");

const DISABLED_STYLE = cn(
  T.link,
  BASE,
  "cursor-not-allowed bg-slate-50/60 text-slate-300 ring-slate-100 hover:bg-slate-50/60 hover:text-slate-300",
);

const ARROW = cn(T.linkArrow, "size-3.5 shrink-0 fitscreen:size-3");

export const CardLink = ({ to, onClick, disabled, children, className }) => {
  if (disabled) {
    return (
      <span
        title="Bu bo'limni ko'rish uchun ruxsatingiz yo'q"
        className={cn(DISABLED_STYLE, className)}
      >
        {children}
        <ArrowRight className="size-3.5 shrink-0 fitscreen:size-3" />
      </span>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cn(STYLE, className)}>
        {children}
        <ArrowRight className={ARROW} />
      </Link>
    );
  }

  if (!onClick) return null;

  return (
    <button type="button" onClick={onClick} className={cn(STYLE, className)}>
      {children}
      <ArrowRight className={ARROW} />
    </button>
  );
};

export default CardLink;
