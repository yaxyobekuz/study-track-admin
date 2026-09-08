// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { SURFACE } from "../data/ledger.tokens";

/**
 * BO'LIM ZAMINI — kulrang sirt, layout chetigacha cho'zilgan.
 *
 * ⚠️ NIMA UCHUN UMUMAN KERAK: bu bo'limdagi kartalar CHEGARASIZ va faqat
 * soya bilan ajraladi. Ilova zamini esa deyarli oq (`--background:
 * 224 100% 98%`), ya'ni oq karta zaminga qo'shilib ketardi va soyaning
 * ma'nosi qolmasdi. 3-4% farq — kartaning qirrasi ko'rinishining yagona
 * sharti (`atlas.tokens.js` o'lchagan qiymat).
 *
 * ⚠️ CHETLAR LAYOUT PADDINGIGA AYNAN TENG. `DashboardLayout` Outlet'ni
 * `p-4 md:py-2` ichiga oladi: gorizontal har doim 16px, vertikal 16px
 * (md dan boshlab 8px). Boshqa qiymat qo'yilsa, zamin yo o'ngdan chiqib
 * gorizontal aylantirgich hosil qilardi, yo chetida oq chiziq qoldirardi.
 *
 * ⚠️ ALOHIDA KOMPONENT, LAYOUT ICHIDA EMAS. Sahifa IKKI joydan ochiladi:
 * o'z bo'limidan (`/lesson-hours/overview`) va bosh sahifadagi
 * dashboardlar qatoridan (`/lesson-load`). Ikkinchisida `LessonHoursLayout`
 * umuman ishtirok etmaydi, ya'ni zamin layoutda qolsa, bosh sahifadan
 * ochilgan ekran oq fonda "yassi" ko'rinardi.
 *
 * ⚠️ YUQORI CHET IXTIYORIY (`bleed`). Bosh sahifada zamin USTIDA tablar
 * qatori turadi va u zamindan TASHQARIDA: yuqoridan ham cho'zilsa, kulrang
 * sirt tablarning tagiga surilib, ular "havoda osilgan" bo'lib qolardi.
 * Bo'lim ichida esa tablar zaminning O'ZIDA, shuning uchun u yerda to'liq
 * cho'ziladi.
 *
 * @param {"all"|"bottom"} [bleed="all"] - qaysi chetlar layout padding'idan
 *   tashqariga chiqadi
 */
const LedgerGround = ({ bleed = "all", className, children }) => (
  <div
    className={cn(
      SURFACE.page,
      "min-h-full",
      // Gorizontal — har doim va har o'lchamda 16px (`p-4`)
      "-mx-4 px-4",
      // Vertikal — 16px, `md` dan boshlab 8px (`md:py-2`)
      bleed === "all"
        ? "-my-4 py-4 md:-my-2 md:py-2"
        : "-mb-4 pb-4 pt-4 md:-mb-2 md:pb-2 md:pt-3",
      className,
    )}
  >
    {children}
  </div>
);

export default LedgerGround;
