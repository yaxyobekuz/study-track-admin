// Icons
import { AlertCircle, Inbox, Sparkles } from "lucide-react";

// Hooks
import useEnterOnce from "@/shared/hooks/useEnterOnce";

// Utils
import { cn } from "@/shared/utils/cn";

// Design tokens (faqat `dense` yo'li ishlatadi)
import {
  CATEGORY_DOT,
  MOTION,
  SURFACE,
  T,
  contentDelay,
} from "@/features/academicDashboard/data/dashboard.tokens";

/**
 * Dashboard blokining yagona qobig'i — sarlavha, izoh, amal va uch holat
 * (yuklanmoqda / xato / bo'sh).
 *
 * ⚠️ SHARED, chunki IKKI dashboard bor: moliya va ta'lim. Ular bir xil
 * ko'rinishi shart — foydalanuvchi ikkalasini bitta tizim deb o'qiydi.
 * Har biri o'z kartasini chizsa, birinchi kichik o'zgarishdayoq ikki
 * ekran bir-biridan ajralib ketardi.
 *
 * Har bir blok bir xil ramkada turishi kerak: dizaynda ular bir tekis
 * to'rga terilgan va har biri o'z "Yuklanmoqda..." ini chizsa, ekran
 * yuklanish paytida uzuq-yuluq ko'rinardi.
 *
 * ⚠️ `dense` — TA'LIM dashboardining BIR EKRANLI rejimi uchun. Moliya
 * dashboardi (18 ta karta) uni BERMAYDI va eski ko'rinishida qoladi.
 * Uchta farq shu bayroqqa bog'langan, chunki uchalasi ham faqat bir
 * ekranli rejimda ma'noga ega va moliya kartalarida ZARAR keltiradi:
 *   1. ixcham padding (`p-3.5` / `p-4 xs:p-5`) — moliya kartalari
 *      maketda kengroq nafas bilan chizilgan;
 *   2. bir qatorli sarlavha (`flex-nowrap` + `truncate`) — o'ralgan
 *      sarlavha o'lchanadigan maydondan 16-32px o'g'irlaydi va qo'shni
 *      kartada ko'rinib turgan qator bu kartada yo'qolardi; moliyada esa
 *      sarlavha ham, izoh ham ikki qatorga o'ralishi mumkin va u yerda
 *      hech nima o'lchanmaydi;
 *   3. pastki qismning HAR HOLATDA chizilishi — ta'limda `footer` bu
 *      HAVOLA (bo'sh oyda ham to'g'ri joyga olib boradi), moliyada esa u
 *      MA'LUMOTDAN hisoblangan yakuniy satr ("Jami qoldiq", "Beshtasi
 *      jami xarajatning N% i"): bo'sh yoki xato holatda u ma'nosiz nol
 *      yig'indini ko'rsatib qolardi.
 *
 * ⚠️ `dense` da KO'RINISH `dashboard.tokens.js` dan: sirt (`SURFACE.card`),
 * sarlavha (`T.cardTitle`), izoh (`T.cardHint`), toifa nuqtasi
 * (`CATEGORY_DOT[category]`) va harakat (`MOTION`). Bu yerda qo'lda yozilgan
 * tipografiya yo'q — aks holda to'qqizta karta bir-biridan ajralib ketardi.
 * Moliya yo'li (`dense=false`) tokenlarni ISHLATMAYDI va o'z eski
 * sinflarida qoladi.
 *
 * ⚠️ `variant="ai"` (yoki `category="ai"`) — AI tahlil kartasi. U UCHTA
 * belgi bilan ajraladi: gradient fon + violet chegara (`SURFACE.aiCard`),
 * yuqori chetdagi 2px shimmer chiziq (`SURFACE.aiTopBar`) va nuqta o'rniga
 * gradient ikonka + "AI" pill. Bittasi yetmasdi — fon juda och.
 *
 * ⚠️ XOREOGRAFIYA: karta `delay` ms da BO'SH kiradi (`MOTION.enter`), tana
 * esa `delay + 140` da to'ladi (`contentDelay`) — konteyner → kontent.
 * Kirish sinfi `animationend` da OLIB TASHLANADI (`useEnterOnce`): `both`
 * fill-mode'i transform'ni ushlab qolib, hover ko'tarilishini bloklardi.
 *
 * `height` berilsa ichki maydon qat'iy balandlikda bo'ladi (diagrammalar
 * uchun: `ResponsiveContainer` ota elementining balandligini talab qiladi).
 * Berilmasa — kontent o'zi qancha bo'lsa shuncha (jadvallar uchun).
 * ⚠️ `height` MOLIYA dashboardi uchun saqlanadi (`TrendCharts`); ta'lim
 * kartalari uni BERMAYDI — u yerda diagramma maydoni kartaning qoldiq
 * joyini `h-full` bilan to'ldiradi.
 *
 * ⚠️ KARTA ICHIDA SURILISH YO'Q — va endi bu STRUKTURAVIY kafolat:
 * ildizda ham, maydonda ham `overflow-hidden` turibdi, ya'ni
 * `overflow-y-auto` ni bu kartaga qo'shib bo'lmaydi. Ilgari ikki
 * urinish ham noto'g'ri edi: karta ichidagi surgichni foydalanuvchi rad
 * etdi ("dabdala bo'lib qolarkan"), qat'iy qator soni esa (`slice(0, 6)`)
 * boshqa balandlikdagi ekranda yo kesardi, yo bo'sh joy qoldirardi.
 * To'g'ri yechim kartada emas, ro'yxatda: `useFitRows` konteynerni
 * O'LCHAYDI va sig'maydigan qator UMUMAN chizilmaydi.
 *
 * ⚠️ `min-h-0` ILDIZDA ham bor: karta to'rning `stretch` qatorida yotadi
 * va flex/grid bolasining standart `min-height: auto` si uni kontentiga
 * qarab cho'zib, butun to'rni viewportdan chiqarib yuborardi.
 */
const DashboardCard = ({
  title,
  hint,
  action,
  footer,
  isLoading,
  isError,
  isEmpty,
  emptyText = "Bu oy uchun ma'lumot yo'q",
  height,
  dense = false,
  category,
  variant = "default",
  delay = 0,
  bodyClassName = "",
  className = "",
  children,
}) => {
  const state = isLoading ? "loading" : isError ? "error" : isEmpty ? "empty" : "ready";
  const isAi = variant === "ai" || category === "ai";

  // Karta va tana — ikkalasi bir marta kiradi, keyin sinf olib tashlanadi
  const card = useEnterOnce(MOTION.enter);
  const body = useEnterOnce(MOTION.enter);

  return (
    <div
      className={cn(
        "flex flex-col",
        // ⚠️ `dense` da sirt TOKENDAN (ring + ikki qatlamli soya + hover
        // ko'tarilish). Moliya (`dense=false`): `ring` — soyasiz chegara,
        // 18 ta karta yonma-yon turganda soya ekranni "iflos" qilardi.
        dense
          ? isAi
            ? SURFACE.aiCard
            : SURFACE.card
          : "rounded-2xl bg-white ring-1 ring-gray-100",
        // ⚠️ `dense` da padding YAGONA (`p-3.5`), ekran kengligiga qarab
        // o'smaydi: `p-4 xs:p-5` uch qatorda faqat padding uchun 36px
        // yeb qo'yardi — o'sha 36px bir ekranli rejimda har kartaga
        // bittadan qo'shimcha qator degani. MOLIYA kartalari `dense`
        // bermaydi va o'z maketidagi kengroq padding'da qoladi.
        //
        // ⚠️ `fitscreen:p-3` — RAMKA XARAJATI faqat bir ekranli rejimda
        // qisqaradi (28 → 24). Butun ramka `fitscreen` da: 24 padding +
        // 28 sarlavha + 8 sarlavha ostidagi bo'shliq + 1 chiziq + 30 havola
        // = 91px (`fitscreen.data.js`). Ixchamlashtirish `dense` ga emas,
        // EKRANGA bog'langan: `dense` kichik ekranda ham yoqiq turadi va u
        // yerda sahifa baribir suriladi — ro'yxatdan piksel yulishning
        // ma'nosi yo'q, faqat karta siqilgan ko'rinardi.
        dense ? "p-3.5 fitscreen:p-3" : "p-4 xs:p-5",
        // Bir ekranli rejimning ikki tayanchi: kesilgan kontent
        // ko'rinmaydi (surgich ham paydo bo'lmaydi) va karta o'z
        // kontentiga qarab cho'zilmaydi.
        // ⚠️ FAQAT `dense` da. Moliya kartalarida qulflangan balandlik
        // yo'q, ya'ni bu yerdagi `overflow-hidden` hech narsani
        // qutqarmaydi — lekin diagramma tultipining kartaning chekkasiga
        // chiqqan qismini qirqib qo'yishi mumkin edi.
        dense && "relative min-h-0 overflow-hidden",
        // Kirish — faqat `dense` (moliya kartalari o'z oqimida qoladi)
        dense && card.enterClass,
        className,
      )}
      style={dense ? { animationDelay: `${delay}ms` } : undefined}
      onAnimationEnd={dense ? card.onAnimationEnd : undefined}
    >
      {/* AI kartasi yuqori chetidagi shimmer chiziq — `absolute`, layout'ga
          tegmaydi; karta `overflow-hidden` bo'lgani uchun burchaklar
          o'z-o'zidan yumaloq kesiladi. */}
      {dense && isAi && <span aria-hidden className={SURFACE.aiTopBar} />}

      {/* `shrink-0` — sarlavha qatori HECH QACHON qisqarmaydi; qisqarsa
          matn ikki qatorga o'ralib, aksincha, o'sib ketardi.

          ⚠️ `dense` da qator O'RALMAYDI (`flex-nowrap`). O'lchangan
          holat: `flex-wrap` bilan yonidagi amal (oy yorlig'i, "Yangilash"
          tugmasi) o'z qatoriga tushib, sarlavha bloki 32px o'rniga
          48-64px bo'lib qolardi — ya'ni o'lchanadigan maydondan bir-ikki
          QATOR o'g'irlanardi va bitta to'r qatoridagi ikki diagramma
          boshqa-boshqa balandlikda chizilardi.

          ⚠️ `dense` da sarlavha bloki OSTIDA CHIZIQ (`SURFACE.cardHeader`:
          `border-b pb-2`) — tana undan keyin boshlanadi. Bu +1px: ramka
          90 → 91 (`fitscreen.data.js`). Tana esa endi o'z `mt` ini
          BERMAYDI — bo'shliqni sarlavhaning `pb-2` si beradi. */}
      <div
        className={cn(
          "flex shrink-0 justify-between gap-2",
          dense ? cn("flex-nowrap", SURFACE.cardHeader, "items-start") : "flex-wrap items-start",
        )}
      >
        <div className={cn("flex min-w-0", dense && "gap-2", isAi ? "items-center" : "items-start")}>
          {/* Toifa belgisi: 6px nuqta (`CATEGORY_DOT`) — sarlavha
              chizig'ining o'rtasiga (`mt-[5px]`: 16px qator, 6px nuqta).
              AI: nuqta o'rniga gradient ikonka kvadratchasi. */}
          {dense &&
            (isAi ? (
              <span className={SURFACE.aiIconBox}>
                <Sparkles className={SURFACE.aiIcon} />
              </span>
            ) : (
              category && (
                <span
                  aria-hidden
                  className={cn(SURFACE.categoryDot, "mt-[5px]", CATEGORY_DOT[category])}
                />
              )
            ))}

          <div className="min-w-0">
            {/* `leading-tight` — sarlavha bir qatorlik matn, standart
                `leading-normal` esa unga 4px havo qo'shib, o'lchanadigan
                maydondan o'sha 4px ni olib qo'yardi (uch qatorda 12px).

                ⚠️ `dense` da sarlavha BIR QATOR: to'liq matni `title` da.
                Uzun sarlavhani ikki qatorga o'rash bir ekranli rejimda
                kartaning ro'yxatidan qator yeb qo'yardi. Sarlavha qisqarib
                qolmasligi uchun uzun nomlarning izohli qismi `hint` ga
                ko'chirilgan — ya'ni bu yerda kesilish odatda umuman
                yuzaga kelmaydi. */}
            <h3
              title={dense && typeof title === "string" ? title : undefined}
              className={cn(
                dense
                  ? cn(T.cardTitle, "flex items-center gap-1.5")
                  : "text-[13px] font-semibold uppercase tracking-wide text-gray-800",
                // ⚠️ `leading-tight` O'LCHAMDAN KEYIN: twMerge `text-[12.5px]`
                // ni qator balandligi bilan ziddiyatli deb, undan OLDIN
                // kelgan `leading-*` ni o'chiradi — 15.6px o'rniga 18.75px
                // bo'lib, sarlavha bloki 3px o'sardi (o'lchangan).
                "leading-tight",
              )}
            >
              <span className={cn(dense && "min-w-0 truncate")}>{title}</span>
              {dense && isAi && <span className={SURFACE.aiPill}>AI</span>}
            </h3>
            {/* ⚠️ `dense` da izoh BIR QATOR (`truncate`), to'liq matni
                `title` da. Ikkinchi qatorga o'ralgan izoh kartaning
                sarlavha qismini o'stirib, o'lchanadigan maydonni
                qisqartirardi — natijada qo'shni kartada ko'rinib turgan
                qator bu kartada yo'qolardi. MOLIYA kartalarida esa hech
                nima o'lchanmaydi va u yerdagi uzun izohlar (masalan
                "Ustun — kirim va chiqim, chiziq — oy oxiridagi kassa
                qoldig'i") avvalgidek ikki qatorga o'raladi. */}
            {/* ⚠️ `fitscreen` da izoh 10px, `leading-3` (12px qator) va
                sarlavhaga YOPISHADI (`mt-0`): sarlavha bloki shu bilan
                32px dan 28px ga tushadi (16.25 sarlavha + 12 izoh). 10px —
                butun dashboardda o'qilishning quyi chegarasi (kartalar
                ichidagi yorliqlar ham shunda), undan past TUSHIRILMAYDI. */}
            {hint && (
              <p
                title={typeof hint === "string" ? hint : undefined}
                className={cn(
                  "normal-case",
                  dense
                    ? cn(
                        T.cardHint,
                        "mt-0.5 truncate leading-tight fitscreen:mt-0 fitscreen:text-[10px] fitscreen:leading-3",
                      )
                    : "mt-1 text-[11px] font-normal leading-snug text-gray-400",
                )}
              >
                {hint}
              </p>
            )}
          </div>
        </div>
        {/* `shrink-0` — `flex-nowrap` da amal sarlavha uchun qisqarmaydi:
            qisqarsa "Yangilash" tugmasi ikki qatorga o'ralib ketardi */}
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div
        className={cn(
          // `dense` da tananing o'z `mt` i yo'q (pastga qarang); moliyada
          // sarlavha bilan maydon orasi `mt-4`.
          dense ? "mt-0" : "mt-4",
          "flex-1",
          // ⚠️ FAQAT `dense` da:
          //   `min-h-0` — to'rdagi qator qo'shni kartaga qarab
          //   cho'zilganda aynan shu yo'qolsa, maydon kontentiga qarab
          //   o'sib, kartani yorib chiqardi;
          //   `overflow-hidden` (`overflow-y-auto` EMAS) — bu karta
          //   ichida VERTIKAL surgich paydo bo'lishi strukturaviy
          //   imkonsiz bo'lsin. Moliya kartalari `bodyClassName` bilan
          //   `overflow-x-auto` beradi va o'z jadvallarini avvalgidek
          //   gorizontal suradi — ular bu qatorga umuman tegmaydi.
          dense && "min-h-0 overflow-hidden",
          // Kontent kartadan KEYIN to'ladi (`contentDelay`)
          dense && body.enterClass,
          bodyClassName,
          // ⚠️ `dense` da tana margin'i STRUKTURAVIY NOL — `bodyClassName`
          // dan KEYIN turadi, twMerge shuning uchun uni ustun qo'yadi.
          // Bo'shliqni sarlavha blokining `pb-2` si beradi
          // (`SURFACE.cardHeader`), ustiga 1px chiziq: ramka 91px
          // (`fitscreen.data.js`). Karta `bodyClassName` bilan
          // `mt-3 fitscreen:mt-2` bersa, bo'shliq IKKI MARTA olinib,
          // ramka 99px bo'lardi va AI tahlil kartasi (144px talab)
          // chegarada qatorini yo'qotardi — shu yerda bosiladi, har
          // kartada alohida eslab qolinmaydi.
          dense && "mt-0 fitscreen:mt-0",
        )}
        style={{
          ...(height ? { height } : null),
          ...(dense ? { animationDelay: `${contentDelay(delay)}ms` } : null),
        }}
        onAnimationEnd={dense ? body.onAnimationEnd : undefined}
      >
        {state === "loading" && (
          <div className="flex h-full min-h-24 items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {state === "error" && (
          <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-gray-400">
            <AlertCircle className="size-6" />
            <p className="text-sm">Ma'lumotni yuklab bo'lmadi</p>
          </div>
        )}

        {state === "empty" && (
          <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-gray-400">
            <Inbox className="size-6" />
            <p className="text-sm">{emptyText}</p>
          </div>
        )}

        {state === "ready" && children}
      </div>

      {/* ⚠️ `dense` da pastki havola HAR HOLATDA chiziladi — `ready` da
          emas. Ta'lim dashboardida to'qqizta karta uch ustunli to'rga
          terilgan va ularning pastki havolalari BITTA SATRDA turadi: bir
          kartaning bo'sh yoki xato holati o'z havolasini yo'qotsa, o'sha
          satr buzilib, karta qo'shnisidan pastroq tugardi. Yuklanish
          paytida esa hamma havola birdan yo'qolib, keyin qaytib — ekran
          sakrardi. Havola KARTAGA tegishli, kartadagi raqamga emas:
          "batafsil" qadami ma'lumot bo'sh bo'lganda ham to'g'ri joyga
          olib boradi.

          ⚠️ `dense` BO'LMAGANDA esa faqat `ready` da — chunki MOLIYA
          kartalarining pastki qismi havola emas, MA'LUMOTDAN hisoblangan
          yakuniy satr. Xarajat yozilmagan oyda "Bu oyda xarajat
          yozilmagan" plashi ostida "Beshtasi jami xarajatning 0% i — 0"
          degan satr paydo bo'lardi. */}
      {/* ⚠️ `mt-auto` — havola KARTA TAGIGA yopishadi. To'rdagi uch karta
          bir xil balandlikda (grid `stretch`) va qisqa kartada bo'sh joy
          qoladi: `mt-auto` bo'lmasa o'sha kartaning havolasi o'rtada
          osilib qolib, qatorning pastki chizig'i buzilardi. Maydon
          `flex-1` bilan cho'zilgan holatda bu qoida hech narsani
          o'zgartirmaydi — bo'sh joyning o'zi qolmaydi.
          O'ram HAR DOIM chiziladi: `mt-auto` ni havolaning o'ziga
          qo'yib bo'lmaydi — u yerda allaqachon `mt-4` turibdi. */}
      {footer && (dense || state === "ready") && (
        <div className="mt-auto shrink-0">{footer}</div>
      )}
    </div>
  );
};

export default DashboardCard;
