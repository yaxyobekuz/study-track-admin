// React
import { useEffect, useRef, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  AlertTriangle,
  Check,
  Info,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import Can from "@/shared/components/guards/Can";
import CardLink from "./CardLink";

// Hooks
import useFitRows from "@/shared/hooks/useFitRows";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import {
  academicQueries,
  useRefreshInsights,
} from "../queries/academicDashboard.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz, formatTimeUz } from "@/shared/utils/date.utils";

// Data
import { linkLabel } from "../data/academicDashboard.data";
import { MOTION, T, TONE, contentDelay } from "../data/dashboard.tokens";

/**
 * Xulosaning "ohangi" → ikonka va rangli doira.
 *
 * ⚠️ Server FAQAT `tone` yuboradi (`positive` / `warning` / `info` /
 * `tip`), matnni esa TAYYOR holda beradi. Frontend bu yerda hech narsa
 * yig'maydi va raqam formatlamaydi: jumla serverda tug'iladi
 * (qoidalar — `helpers/academicFacts.js`, model — `academicInsight.service.js`),
 * shuning uchun u bazasiz sinovda tekshiriladi va ikki panelda ikki xil
 * bo'lib qolmaydi.
 *
 * Ikonka `size-5` doira ichida (`bg-*-50`, ikonka `-500`): rangli doira
 * qatorni matndan ajratadi va qaysi ohang ekanini rangdan ham, shakldan
 * ham aytadi.
 */
const TONES = {
  positive: { icon: TrendingUp, className: "bg-emerald-50 text-emerald-500" },
  warning: { icon: AlertTriangle, className: "bg-amber-50 text-amber-500" },
  info: { icon: Info, className: "bg-blue-50 text-blue-500" },
  tip: { icon: Sparkles, className: "bg-violet-50 text-violet-500" },
};

/** Noma'lum ohang kelsa qator YO'QOLMAYDI — neytral ko'rinishda chiziladi. */
const FALLBACK_TONE = { icon: Info, className: "bg-slate-50 text-slate-400" };

/**
 * Vazifaning shoshilinchligi → NUQTA (`MOTION.priorityDot`).
 *
 * ⚠️ Rang YAGONA belgi emas: yonida `owner · muddat` satri turadi.
 * Faqat rangga tayangan holat rangni ajratmaydigan foydalanuvchi uchun
 * "uch xil bir xil qator" bo'lib qolardi. `high` nuqtasi NAFAS OLADI
 * (breathe) — diqqat belgisi; hammasi harakat qilsa, hech biri ajralib
 * turmasdi.
 */
const PRIORITY_FALLBACK = MOTION.priorityDot.low;

/**
 * KARTAGA CHIQADIGAN QATORLAR SONINING YUQORI CHEGARASI.
 *
 * Server oltitagacha xulosa (`MAX_AI_INSIGHTS`) va beshtagacha vazifa
 * (`MAX_ACTIONS`) yuborishi mumkin. Kartada esa IKKITADAN oshmaydi:
 * dashboardning ma'nosi bir qarashda o'qiladigan xulosada, o'n bir qator
 * matn esa qo'shni kartalarni siqib, ekranni "maqola"ga aylantirardi.
 *
 * ⚠️ Tartib SERVERDA hal qilingan va u MUHIMLIK bo'yicha: xulosalar
 * ogohlantirishdan boshlanadi (`warning` → `positive` → `info` → `tip`),
 * vazifalar esa `priority` bo'yicha saralangan. Shuning uchun bu yerda
 * QAYTA SARALASH YO'Q — birinchi ikkitasi allaqachon eng muhimlari.
 * Ikki joyda saralash bo'lsa, ular bir kun kelib bir-biriga zid tartib
 * berardi.
 *
 * ⚠️ `useFitRows` ga `max` sifatida ham shu qiymat beriladi va u
 * MA'LUMOTDAN HISOBLANMAYDI: hook `max` ni dastlabki qiymat sifatida
 * ishlatadi, ya'ni `ResizeObserver` yo'q muhitda (jsdom testi, juda eski
 * brauzer) aynan shu qaytadi. Ma'lumot kelgunicha ro'yxat bo'sh bo'lgani
 * uchun hisoblangan `max` u yerda abadiy birga yopishib qolardi.
 */
const INSIGHT_LIMIT = 2;
const ACTION_LIMIT = 2;

/**
 * Qatorning QAT'IY balandligi (px) — `h-[34px]` / `fitscreen:h-[31px]`
 * sinflari bilan BIR VAQTDA o'zgaradi.
 *
 * 31px = 12.5px matnning `leading-[15px]` dagi IKKI qatori (30px) + 1px
 * havo. Shuning uchun `fitscreen` da ustki `pt-*` OLIB TASHLANADI (`pt-0`):
 * u qolganda ikkinchi qator qat'iy balandlikdan chiqib, `overflow-hidden`
 * ostida qirqilardi. ⚠️ Matn `T.tableCell` (12.5px) — `leading-snug`
 * bilan ikki qator 34.4px bo'lib 31 ga SIG'MASDI, shuning uchun qator
 * balandligi bu yerda QAT'IY `leading-[15px]` bilan beriladi (o'lchov
 * qatori, tipografiya emas).
 *
 * ⚠️ NIMA UCHUN 31, 32 EMAS — O'LCHANGAN (Chrome, 1280×960, yon panel
 * ochiq): kartaning o'lchanadigan maydoni 147.2px. Ikki ro'yxat uni teng
 * bo'lishadi, o'rtada 20px bo'lim yorlig'i: (147.2 − 20) / 2 = 63.6px
 * har biriga. 32px da `floor(63.6 / 32) = 1` — ya'ni chegarada 1 + 1
 * qator; 31px da `floor(63.6 / 31) = 2` — 2 + 2 (zaxira 1.6px). Vazifa
 * qatori ham sig'adi: sarlavha `leading-[16px]` 16 + "kim · muddat"
 * `leading-[13px]` 13 = 29 ≤ 31.
 *
 * ⚠️ O'lchov konstantasi IKKALA rejim uchun 31: oddiy oqimda qator 34px
 * bo'lgani bilan hisob barqaror qoladi (`floor(2 × 34 / 31) = 2`), chunki
 * `max` baribir IKKITA.
 *
 * Qatorlar orasiga oraliq (`gap` / `space-y`) QO'SHILMAYDI: bir ekranli
 * bo'lmagan ekranda konteyner balandligi kontentning o'zidan kelib
 * chiqadi va `floor(n × 34 / 34) = n` barqaror nuqta bo'ladi. Oraliq
 * qo'shilsa bu hisob `n − 1` beradi va ro'yxat har renderda bittaga
 * qisqarib "so'nib" borardi.
 */
const ROW_H = 31;

/**
 * Matn kim yozgani — HALOL yorliq, `TONE.*.chip` ko'rinishida.
 *
 * ⚠️ Chip balandligi `py-0` + `leading-[12px]` bilan QAT'IY 12px: izoh
 * satrining o'z qator qutisi `fitscreen` da 12px (10px × `leading-3`).
 * Chip undan baland bo'lsa sarlavha bloki 1-2px o'sib, o'lchanadigan
 * maydondan o'sha pikselni olib qo'yardi — ikkinchi vazifa qatori
 * yo'qolardi. Tokendagi `py-0.5` shu sababli ustidan yoziladi.
 *
 * `ai` — violet (kartaning o'z rangi), `rules` — neytral slate. Violet
 * uchun tokenda chip yo'q — neytral chip ustiga FAQAT rang yoziladi.
 */
const SOURCE_BADGE_LAYOUT = "shrink-0 py-0 leading-[12px]";
const SOURCE_BADGES = {
  ai: {
    label: "AI tahlil",
    className: cn(
      TONE.neutral.chip,
      SOURCE_BADGE_LAYOUT,
      "bg-violet-50 text-violet-700 ring-violet-200/60",
    ),
  },
  rules: {
    label: "qoidalar",
    className: cn(TONE.neutral.chip, SOURCE_BADGE_LAYOUT),
  },
};

/** Muvaffaqiyat belgisi (✓) tugmada qancha turadi (ms). */
const SUCCESS_FLASH_MS = 1500;

/**
 * HAFTALIK TAHLIL VA ISH REJASI.
 *
 * ⚠️ Bu karta `overview` dan OZIQLANMAYDI — o'z so'rovi bor
 * (`GET /education/insights`). Sabab: tahlil HAFTALIK va uning oyi
 * serverda hal qilinadi, dashboard sarlavhasidagi oy tanlagichi esa
 * ixtiyoriy oyni ko'rsatishi mumkin. Ikkalasini bitta so'rovga bog'lash
 * "2025-yil yanvarni ochsam, bu hafta qilinadigan ishlar o'zgarib
 * ketdi" degan holatga olib kelardi.
 *
 * ⚠️ MANBA YASHIRILMAYDI. Sarlavha ostidagi satr matnni kim yozganini
 * aytadi: `ai` — model, `rules` — server qoidalari. Qoidalar matnini
 * "AI tahlil" deb ko'rsatish foydalanuvchini aldash bo'lardi, ayniqsa
 * kalit sozlanmagan yoki model javobi validatsiyadan o'tmagan holatda
 * (server bu ikkalasida ham jimgina qoidalarga tushadi).
 *
 * ⚠️ UMUMIY XULOSA (`summary`) KARTA TANASIDA EMAS, sarlavha ostidagi
 * IZOH SATRIDA (bir qator, `truncate`, to'liq matni `title` da). Sabab:
 * u ikki-uch jumlalik matn va ta'kidli blok bo'lib turganda kartaning
 * yarmini egallab, xulosalar bilan vazifalarni siqib chiqarardi. Izoh
 * satri esa allaqachon mavjud va u yerda QO'SHIMCHA joy talab qilmaydi.
 *
 * ⚠️ `data` / `isLoading` / `isError` proplari ATAYLAB QABUL QILINMAYDI:
 * sahifa barcha kartalarga `{...state}` ni tarqatadi va agar ular bu
 * yerda ham olinsa, karta o'z so'rovi bilan `overview` orasida ikkiga
 * bo'linardi. Karta sahifadan MA'LUMOT olmaydi — faqat `delay`
 * (kirish kechikishi, ms): bu xoreografiya, ma'lumot emas.
 *
 * KO'RINISH: `variant="ai"` — `DashboardCard` gradient sirt, shimmer
 * chiziq, gradient Sparkles ikonkasi va "AI" pill'ini O'ZI chizadi. Bu
 * yerda ular TAKRORLANMAYDI (ikki Sparkles, ikki chiziq bo'lib qolardi).
 */
export const InsightsCard = ({ delay = 0 }) => {
  const { can } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    ...academicQueries.insights(),
    // Sahifa ruxsatsiz foydalanuvchiga ham to'rni chizadi (kartalar bo'sh
    // holatda qoladi) — so'rovni yuborib 403 olishning ma'nosi yo'q.
    enabled: can("education.view"),
  });

  const refresh = useRefreshInsights();

  // Yangilash muvaffaqiyatli tugaganda tugmada qisqa ✓ ko'rinadi.
  // Taymer ref'da — komponent yechilganda tozalanadi (yechilgan
  // komponentga setState yo'q).
  const [justRefreshed, setJustRefreshed] = useState(false);
  const flashTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(flashTimerRef.current), []);

  const allInsights = data?.insights ?? [];
  const allActions = data?.actions ?? [];

  // ⚠️ QATOR SONI TAXMIN QILINMAYDI — O'LCHANADI. Ikki ro'yxat bo'sh joyni
  // teng bo'lishadi (`flex-1`), `useFitRows` esa har biriga nechta qator
  // SIG'ISHINI hisoblaydi: kichik kartada bittadan, kattasida ikkitadan.
  // `max` tufayli IKKITADAN OSHMAYDI — bo'sh joy ko'p bo'lsa ham karta
  // "matn devori"ga aylanmaydi.
  //
  // ⚠️ `min: 0` — ATAYLAB. `min: 1` o'lchovni BEKOR QILARDI: 29.5px joy
  // qolganda ham 34px lik qator chizilib, uning pasti kesilardi. Endi
  // qoida istisnosiz: sig'magan qator chizilmaydi, sig'magan bo'lim esa
  // (yorlig'i bilan birga) umuman ochilmaydi.
  //
  // ⚠️ Bo'lim yorliqlari o'lchanadigan konteynerlardan TASHQARIDA va
  // `shrink-0`: ular qator sonidan QAT'IY NAZAR chiziladi. Shu sababli
  // `headerHeight` ham kerak emas va — muhimi — o'lchov halqasi barqaror
  // qoladi. Yorliq o'lchanadigan konteynerga kiritilsa, bir ekranli
  // BO'LMAGAN ekranda (konteyner balandligi kontentdan kelib chiqadigan
  // holat) hisob `n − 1` berib, ro'yxat har renderda bittaga qisqarib
  // "so'nib" borardi.
  const [insightsRef, insightRows] = useFitRows({
    rowHeight: ROW_H,
    min: 0,
    max: INSIGHT_LIMIT,
  });

  const [actionsRef, actionRows] = useFitRows({
    rowHeight: ROW_H,
    min: 0,
    max: ACTION_LIMIT,
  });

  const insights = allInsights.slice(0, insightRows);
  const actions = allActions.slice(0, actionRows);

  // Server sanani TAYYOR yorliq bilan beradi (`utc: true` bilan
  // formatlangan `@db.Date`). Yorliq kelmasa — mahalliy formatlovchi;
  // yangi formatlovchi YOZILMAYDI (`dates.md` §5).
  const weekLabel =
    data?.weekStartLabel || formatDateUz(data?.weekStart, { fallback: "" });
  // Manba matndan NISHONGA ko'chdi (izoh satrining boshida turadi);
  // noma'lum manba kelsa nishon chizilmaydi — yolg'on yorliq yo'q.
  const sourceBadge = SOURCE_BADGES[data?.source] ?? null;

  // ⚠️ TAHLIL QILINGAN OY OCHIQ YOZILADI. Tahlil HAFTALIK va uning oyi
  // cron QAYSI KUNI ishlaganiga qarab hal qilinadi: dushanba oyning
  // oxirgi kunlariga to'g'ri kelsa (yiliga ~5 marta), butun keyingi hafta
  // davomida bu blok O'TGAN oyning raqamlarini ko'rsatadi — sarlavhadagi
  // oy tanlagichi esa joriy oyni. Yorliqsiz bu "dashboardda ikki xil
  // raqam" bo'lib ko'rinardi; yorliq bilan bu tushunarli holat.
  const meta = data
    ? [data.monthLabel, weekLabel && `${weekLabel} dan`]
        .filter(Boolean)
        .join(" · ")
    : "";

  // Izoh satri: meta + umumiy xulosa. Matn BIR QATOR (`truncate`), to'liq
  // ko'rinishi `title` da — matn yo'qolmaydi, lekin kartani ham cho'zmaydi.
  const hintText = [meta, data?.summary].filter(Boolean).join(" — ");

  // Sovish muddati: tugma o'chiriladi, lekin JOYIDA qoladi — qachondan
  // yangilash mumkinligi tooltipda turadi.
  const cooldown = data ? data.canRefresh === false : false;
  const isRefreshing = refresh.isPending;
  const refreshDisabled = isRefreshing || cooldown;

  // Ko'rinmayotgan yozuvlar soni — havolada (`linkLabel`, yagona qoida:
  // son har doim YASHIRILGANLAR soni, jami emas).
  const hiddenRows =
    allInsights.length + allActions.length - insights.length - actions.length;

  // Tana BITTA fade-up bilan kartadan keyin kiradi (xoreografiya:
  // konteyner → kontent). Qatorlar alohida animatsiya qilinmaydi.
  const bodyDelay = contentDelay(delay);

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => {
        toast.success("Haftalik tahlil yangilandi");
        setJustRefreshed(true);
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(
          () => setJustRefreshed(false),
          SUCCESS_FLASH_MS,
        );
      },
      // ⚠️ Serverning O'Z SABABI ko'rsatiladi ("Tahlil yaqinda
      // yangilangan…" — 429). Umumiy "Xatolik yuz berdi" foydalanuvchini
      // tugmani qayta-qayta bosishga majburlardi.
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Tahlilni yangilab bo'lmadi",
        ),
    });
  };

  return (
    <DashboardCard
      variant="ai"
      title="AI tahlil va tavsiyalar"
      delay={delay}
      // Izoh satri BIR QATOR: `DashboardCard` uni `<p>` ichida chizadi,
      // shuning uchun `truncate` shu yerdagi ichki span'ga qo'yiladi.
      // Manba nishoni matndan OLDIN va `shrink-0` — uzun xulosa uni
      // siqib chiqarmaydi, matn esa nishondan keyin qisqaradi.
      hint={
        hintText || sourceBadge ? (
          <span className="flex min-w-0 items-center gap-1.5">
            {sourceBadge && (
              <span className={sourceBadge.className}>{sourceBadge.label}</span>
            )}
            {hintText && (
              <span className="min-w-0 truncate" title={hintText}>
                {hintText}
              </span>
            )}
          </span>
        ) : (
          ""
        )
      }
      action={
        <Can do="education.plan">
          {/* Tugma `T.link` ko'rinishida (karta havolasi bilan bitta
              oila); o'chirilgan holatda rang och, hover yo'q. */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshDisabled}
            title={
              cooldown && data?.nextRefreshAt
                ? `Yangilash ${formatTimeUz(data.nextRefreshAt)} dan keyin mumkin`
                : "Tahlilni qayta shakllantirish"
            }
            className={cn(
              T.link,
              "shrink-0",
              refreshDisabled &&
                "cursor-not-allowed text-slate-300 hover:bg-slate-50 hover:text-slate-300",
            )}
          >
            {/* Muvaffaqiyatda qisqa ✓ (faqat opacity bilan kiradi — zoom
                yo'q); matn o'zgarmaydi — tugma kengligi sakramaydi */}
            {justRefreshed ? (
              <Check className="size-3.5 shrink-0 text-emerald-500 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" />
            ) : (
              <RefreshCw
                className={cn(
                  "size-3.5 shrink-0",
                  isRefreshing && "animate-spin",
                )}
              />
            )}
            Yangilash
          </button>
        </Can>
      }
      isLoading={isLoading}
      isError={isError}
      // Bo'sh — IKKALASI ham bo'sh bo'lganda. Faqat xulosa yoki faqat
      // vazifa qolgan holat normal: qoidalar ba'zi kesimlarda jim turadi.
      isEmpty={allInsights.length === 0 && allActions.length === 0}
      emptyText="Bu hafta uchun tahlil hali tayyorlanmagan"
      dense
      // ⚠️ Karta tanasi flex ustun va `overflow-hidden`: ichida surilish
      // STRUKTURAVIY IMKONSIZ bo'lishi kerak. `mt-3` — `DashboardCard`
      // dagi `mt-4` ning ixcham varianti (twMerge ustun keladi).
      bodyClassName="mt-3 fitscreen:mt-2 flex min-h-0 flex-col overflow-hidden"
      // ⚠️ Boshqa kartalar kabi PASTKI HAVOLA bilan: to'rda bu karta
      // qo'shnilari bilan bir qatorda turadi va havolasiz qoldirilsa,
      // qatorning pastki chizig'i buzilardi.
      // ⚠️ Havola nomi HAR DOIM bir xil — maketdagi "Tavsiyalar arxivi".
      // Ilgari u kesilmagan holatda "Batafsil statistika" ga almashardi:
      // manzil bitta bo'la turib, foydalanuvchi ikki xil nom ko'rib, ikki
      // xil sahifa bor deb o'ylardi.
      footer={
        <CardLink to="/statistics">
          {linkLabel("Tavsiyalar arxivi", hiddenRows)}
        </CardLink>
      }
    >
      {/* Kirish: tana BITTA `fade-up`, kartadan 140ms keyin. `fade-up`
          faqat transform/opacity — `useFitRows` o'lchovi o'zgarmaydi. */}
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden",
          MOTION.enter,
        )}
        style={{ animationDelay: `${bodyDelay}ms` }}
      >
        {/* ── Xulosalar ─────────────────────────────────────────────── */}
        {allInsights.length > 0 && (
          // O'LCHANADIGAN konteyner. `overflow-y-auto` bu yerda ham,
          // kartaning hech qayerida ham YO'Q.
          <div ref={insightsRef} className="min-h-0 flex-1 overflow-hidden">
            {insights.map((row) => {
              const tone = TONES[row.tone] ?? FALLBACK_TONE;
              const Icon = tone.icon;

              return (
                // Balandlik o'zgarmaydi: 34/31px (`ROW_H` izohi).
                <div
                  key={row.id}
                  className="flex h-[34px] items-start gap-2 pt-0.5 fitscreen:h-[31px] fitscreen:pt-0"
                >
                  {/* Ikonka rangli doira ichida: `size-5` doira, `size-3`
                      ikonka. `mt-0.5` — doira matnning ikki qatori
                      orasiga (30px) markazlashadi. */}
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                      tone.className,
                    )}
                  >
                    <Icon className="size-3" />
                  </span>
                  {/* ⚠️ `line-clamp-2` — uzun matn qatorni cho'zib, qat'iy
                      balandlikni yorib chiqmasligi uchun. To'liq matn
                      `title` da qoladi. `leading-[15px]` — o'lchov qatori
                      (31 = 2 × 15 + 1), `ROW_H` izohiga qarang. */}
                  <p
                    className={cn(T.tableCell, "line-clamp-2 leading-[15px]")}
                    title={row.text}
                  >
                    {row.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Haftalik ish rejasi ───────────────────────────────────── */}
        {allActions.length > 0 && (
          <>
            {/* Bo'lim belgisi: chap/o'ng ingichka chiziq + yorliq
                (`T.sectionLabel` / `T.sectionRule`).
                ⚠️ `fitscreen` da bo'lim 20px: `mt-1` 4 + `pt-[5px]` 5 +
                11 satr — aynan shu 12px (32 → 20) ikkala ro'yxatga
                bittadan qator qo'shadi: 2 xulosa + 2 vazifa. Ilgari 1px
                `border-t` bor edi — chiziq endi yorliqning ikki yonida,
                uning 1px i `pt` ga o'tdi; jami o'zgarmadi. */}
            <div
              className={cn(
                "flex shrink-0 items-center gap-2",
                // Ajratuvchi oraliq FAQAT ustida xulosa bo'lganda: yolg'iz
                // qolgan ro'yxat ustida u nimanidir ajratmasdi.
                allInsights.length > 0
                  ? "mt-1.5 pt-1.5 fitscreen:mt-1 fitscreen:pt-[5px]"
                  : "pb-1 fitscreen:pb-0",
              )}
            >
              <span className={T.sectionRule} />
              <p
                className={cn(
                  T.sectionLabel,
                  "shrink-0 fitscreen:leading-[11px]",
                )}
              >
                Shu hafta qilinadigan ishlar
              </p>
              <span className={T.sectionRule} />
            </div>

            {/* O'LCHANADIGAN konteyner: balandligi ICHIDAGIDAN qat'iy
                nazar qoldiq joyga teng (`flex-1` + `min-h-0`) */}
            <div
              ref={actionsRef}
              className="mt-1 min-h-0 flex-1 overflow-hidden fitscreen:mt-0"
            >
              {actions.map((row) => (
                <div
                  key={row.id}
                  className="flex h-[34px] items-start gap-2 pt-1 fitscreen:h-[31px] fitscreen:pt-0"
                >
                  {/* Nuqta sarlavhaning BIRINCHI QATORIGA (16px)
                      tenglashtiriladi: `mt-[5px]` + 6px nuqta → markaz 8px. */}
                  <span
                    className={cn(
                      "mt-[5px] shrink-0",
                      MOTION.priorityDot[row.priority] ?? PRIORITY_FALLBACK,
                    )}
                  />
                  <div className="min-w-0">
                    {/* ⚠️ Sarlavha BIR QATOR (`truncate`): ostida "kim ·
                        muddat" satri turadi va ikkalasi birgalikda qat'iy
                        31px ga sig'ishi kerak (16 + 13 = 29). To'liq
                        matn `title` da. */}
                    <p
                      className={cn(T.tableName, "truncate leading-[16px]")}
                      title={row.title}
                    >
                      {row.title}
                    </p>
                    <p className={cn(T.valueMeta, "truncate leading-[13px]")}>
                      {[row.owner, row.dueLabel].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default InsightsCard;
