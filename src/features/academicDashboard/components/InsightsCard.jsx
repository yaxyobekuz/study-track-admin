// React
import { useEffect, useRef, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { Check, RefreshCw } from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import Can from "@/shared/components/guards/Can";
import CardLink from "./CardLink";

// Hooks
import useModal from "@/shared/hooks/useModal";
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
import {
  FALLBACK_ICON,
  TONE_ICON,
  linkLabel,
} from "../data/academicDashboard.data";
import {
  AI_ROW,
  AI_TONE,
  MOTION,
  T,
  TONE,
  contentDelay,
} from "../data/dashboard.tokens";

/**
 * Vazifaning shoshilinchligi → PLITKANING CHAP RELSI
 * (`MOTION.priorityRail`).
 *
 * ⚠️ Ilgari bu sarlavha yonidagi 6px NUQTA edi. Nuqta matn bilan bitta
 * oqimda turgani uchun qator "ro'yxat elementi" emas, oddiy abzas bo'lib
 * o'qilardi. Rels esa plitkaning butun balandligini egallaydi: u bir
 * vaqtning o'zida qator QAYERDA BOSHLANIB QAYERDA TUGASHINI ko'rsatadi
 * va ustuvorlikni aytadi.
 *
 * ⚠️ Rang YAGONA belgi emas: yonida `owner · muddat` satri turadi.
 * Faqat rangga tayangan holat rangni ajratmaydigan foydalanuvchi uchun
 * "uch xil bir xil qator" bo'lib qolardi. `high` relsi NAFAS OLADI
 * (breathe) — diqqat belgisi; hammasi harakat qilsa, hech biri ajralib
 * turmasdi.
 */
const PRIORITY_FALLBACK = MOTION.priorityRail.low;

/**
 * KARTAGA CHIQADIGAN YOZUVLAR SONI — HAR RO'YXATDAN BITTADAN.
 *
 * Server oltitagacha xulosa (`MAX_AI_INSIGHTS`) va beshtagacha vazifa
 * (`MAX_ACTIONS`) yuborishi mumkin. Kartada esa ENG MUHIM BITTASI
 * ko'rinadi: qolganlari "Tavsiyalar arxivi (yana N ta)" havolasi ortida.
 *
 * ⚠️ NIMA UCHUN BITTADAN, IKKITADAN EMAS. Karta balandligi qat'iy
 * (`fitscreen.data.js`), ya'ni yozuvlar soni va HAR BIR YOZUVGA
 * beriladigan joy bir-birining hisobiga o'sadi. Ikkitadan bo'lganda har
 * bir plitkaga 32px tegib, jumla ikki qatorda kesilardi — dashboard
 * "yarim o'qilgan matn" ko'rsatardi. Bittadan bo'lganda plitka ~65px
 * bo'ladi: xulosa uch qatorda, vazifa sarlavhasi ikki qatorda to'liq
 * chiqadi. Bir qarashda o'qiladigan BITTA to'g'ri jumla — yarmi kesilgan
 * ikkitadan yaxshi.
 *
 * ⚠️ Tartib SERVERDA hal qilingan va u MUHIMLIK bo'yicha: xulosalar
 * ogohlantirishdan boshlanadi (`warning` → `positive` → `info` → `tip`),
 * vazifalar esa `priority` bo'yicha saralangan. Shuning uchun bu yerda
 * QAYTA SARALASH YO'Q — birinchisi allaqachon eng muhimi. Ikki joyda
 * saralash bo'lsa, ular bir kun kelib bir-biriga zid tartib berardi.
 *
 * ⚠️ `useFitRows` bu kartada ENDI ISHLATILMAYDI. U "qoldiq joyga nechta
 * QAT'IY balandlikdagi qator sig'adi" degan savolga javob berardi; bu
 * yerda javob endi doim BITTA, ya'ni o'lchanadigan narsaning o'zi yo'q.
 * Uning o'rniga plitkaning O'ZI qoldiq joyni to'ldiradi (`flex-1`):
 * karta balandligi qanday bo'lmasin, ostida bo'sh joy ham qolmaydi,
 * kesilgan yozuv ham chiqmaydi. (Hook boshqa kartalarda — jadvallar va
 * yon kartalarda — avvalgidek ishlaydi.)
 */
const INSIGHT_LIMIT = 1;
const ACTION_LIMIT = 1;

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
 * ⚠️ Server FAQAT `tone` / `priority` yuboradi, MATNNI esa TAYYOR holda
 * beradi. Frontend bu yerda hech narsa yig'maydi va raqam formatlamaydi:
 * jumla serverda tug'iladi (qoidalar — `helpers/academicFacts.js`, model
 * — `academicInsight.service.js`), shuning uchun u bazasiz sinovda
 * tekshiriladi va ikki panelda ikki xil bo'lib qolmaydi. Ohang IKONKASI
 * `academicDashboard.data.js` da (`TONE_ICON`), RANGI
 * `dashboard.tokens.js` da (`AI_TONE`) — "Tavsiyalar arxivi" oynasi
 * (`InsightsModal`) ham AYNAN shu manbadan oladi.
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
  const { openModal } = useModal();

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

  // ⚠️ QATOR SONI O'LCHANMAYDI — u DOIM BITTA (`INSIGHT_LIMIT` izohi).
  // Ikki ro'yxat bo'sh joyni teng bo'lishadi (`flex-1`) va plitkaning
  // O'ZI o'sha joyni to'ldiradi: karta balandligi qanday bo'lmasin,
  // ostida bo'sh joy ham qolmaydi, kesilgan yozuv ham chiqmaydi.
  const insights = allInsights.slice(0, INSIGHT_LIMIT);
  const actions = allActions.slice(0, ACTION_LIMIT);

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
          {/* Tugma `T.linkAi` ko'rinishida — `T.link` ning violet
              varianti (karta havolasi bilan bitta oila, lekin kartaning
              o'z rangida: neytral slate tugma gradient sirt ustida
              "boshqa ekrandan kelib qolgandek" ko'rinardi).
              O'chirilgan holatda rang och, hover yo'q. */}
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
              T.linkAi,
              "shrink-0",
              refreshDisabled &&
                "cursor-not-allowed bg-violet-50/50 text-violet-300 ring-violet-100 hover:bg-violet-50/50 hover:text-violet-300",
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
      //
      // ⚠️ HAVOLA "TAVSIYALAR ARXIVI" OYNASINI ochadi (`InsightsModal`).
      // Ilgari u `/statistics` ga — O'QUVCHILAR REYTINGI sahifasiga —
      // olib borardi: nomi tavsiyalarni va'da qilib, butunlay boshqa
      // ekran ochilardi. Manzil xato ekani ko'rinmasdi, chunki u sahifa
      // ham "statistika" edi.
      //
      // ⚠️ Havola nomi HAR DOIM bir xil. Ilgari u kesilmagan holatda
      // "Batafsil statistika" ga almashardi: manzil bitta bo'la turib,
      // foydalanuvchi ikki xil nom ko'rib, ikki xil sahifa bor deb
      // o'ylardi.
      //
      // ⚠️ Havola HAR DOIM bosiladi — `disabled` QO'YILMAYDI: `CardLink`
      // ning o'chirilgan holati "ruxsatingiz yo'q" deb tooltip ko'rsatadi
      // va u yuklanish paytida YOLG'ON bo'lardi. Yuklanish / xato / bo'sh
      // holatni oynaning O'ZI chizadi.
      footer={
        <CardLink onClick={() => openModal("academicInsights")}>
          {linkLabel("Tavsiyalar arxivi", hiddenRows)}
        </CardLink>
      }
    >
      {/* Kirish: tana BITTA `fade-up`, kartadan 140ms keyin. `fade-up`
          faqat transform/opacity — layout'ga tegmaydi. */}
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden",
          MOTION.enter,
        )}
        style={{ animationDelay: `${bodyDelay}ms` }}
      >
        {/* ── Xulosa (eng muhim BITTASI) ────────────────────────────── */}
        {insights.length > 0 && (
          // ⚠️ PLITKANING O'ZI `flex-1`: u qoldiq joyni to'ldiradi.
          // Ilgari bu yerda qat'iy balandlikdagi qatorlarni saqlaydigan
          // O'LCHANADIGAN konteyner turardi; endi o'lchanadigan narsa
          // yo'q (`INSIGHT_LIMIT` izohi), shuning uchun qatlam ham yo'q.
          // `overflow-y-auto` bu yerda ham, kartaning hech qayerida ham
          // YO'Q.
          <div className="relative min-h-0 flex-1">
            {(() => {
              const row = insights[0];
              const tone = AI_TONE[row.tone] ?? AI_TONE.neutral;
              const Icon = TONE_ICON[row.tone] ?? FALLBACK_ICON;

              return (
                <>
                  {/* PLITKA SIRTI — oqimdan tashqarida. `inset-y-*` bilan
                      ichkariga surilgan 2px/1px bo'lim yorlig'i bilan
                      orasidagi havoni beradi. Chegara ohang rangida. */}
                  <span
                    aria-hidden
                    className={cn(
                      AI_ROW.tile,
                      "inset-y-0.5 fitscreen:inset-y-px",
                      tone.ring,
                    )}
                  />

                  <div className="relative flex h-full items-center gap-2.5 overflow-hidden px-2.5 py-2 fitscreen:gap-2 fitscreen:px-2 fitscreen:py-1.5">
                    {/* To'ldirilgan rangli doira, ichida oq belgi: qator
                        QAYERDAN boshlanishini ko'rsatadigan lange. Ilgari
                        doira `bg-*-50` edi va oq plitkada ko'rinmasdi. */}
                    <span
                      className={cn(
                        AI_ROW.icon,
                        "size-7 fitscreen:size-6",
                        tone.icon,
                      )}
                    >
                      <Icon className="size-3.5 fitscreen:size-3" />
                    </span>

                    {/* ⚠️ `line-clamp-3` — plitka balandligi qat'iy emas,
                        lekin CHEKLANGAN (`flex-1`): uch qatordan uzun
                        matn uni yorib chiqmasligi kerak. Hisob (fitscreen,
                        plitka ~64px): 3 × `leading-[15px]` = 45 + `py-1.5`
                        12 = 57 ≤ 64 ✓. To'liq matn `title` da qoladi. */}
                    <p
                      className={cn(
                        T.tableCell,
                        "min-w-0 line-clamp-3 leading-[17px] fitscreen:leading-[15px]",
                      )}
                      title={row.text}
                    >
                      {row.text}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Haftalik ish rejasi ───────────────────────────────────── */}
        {actions.length > 0 && (
          <>
            {/* Bo'lim belgisi: chap/o'ng ingichka chiziq + yorliq
                (`T.sectionLabel` / `T.sectionRule`). `shrink-0` — u ikki
                plitka orasida qat'iy turadi, plitkalar esa qoldiq joyni
                teng bo'lishadi. */}
            <div
              className={cn(
                "flex shrink-0 items-center gap-2",
                // Ajratuvchi oraliq FAQAT ustida xulosa bo'lganda: yolg'iz
                // qolgan plitka ustida u nimanidir ajratmasdi.
                insights.length > 0
                  ? "my-1.5 fitscreen:my-1"
                  : "mb-1.5 fitscreen:mb-1",
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

            {/* Vazifa plitkasi — xulosa bilan bir xil qoidada: qoldiq
                joyni to'ldiradi (`flex-1` + `min-h-0`). */}
            <div className="relative min-h-0 flex-1">
              {(() => {
                const row = actions[0];

                return (
                  <>
                    {/* Neytral chegara: ohang bu ro'yxatda yo'q,
                        ustuvorlikni RELS aytadi. Rels plitkaning ICHIDA
                        (`AI_ROW.rail` izohi: `overflow-hidden` uni
                        yumaloq burchakka moslab kesadi). */}
                    <span
                      aria-hidden
                      className={cn(
                        AI_ROW.tile,
                        AI_ROW.taskRing,
                        "inset-y-0.5 fitscreen:inset-y-px",
                      )}
                    >
                      {/* USTUVORLIK RELSI — chap chekka, butun balandlik
                          bo'ylab (`MOTION.priorityRail`). `high` nafas
                          oladi. */}
                      <span
                        className={cn(
                          AI_ROW.rail,
                          MOTION.priorityRail[row.priority] ??
                            PRIORITY_FALLBACK,
                        )}
                      />
                    </span>

                    <div className="relative flex h-full min-w-0 flex-col justify-center overflow-hidden pl-3 pr-2.5 py-2 fitscreen:pl-2.5 fitscreen:pr-2 fitscreen:py-1.5">
                      {/* ⚠️ Sarlavha IKKI QATOR (`line-clamp-2`), ostida
                          "kim · muddat". Hisob (fitscreen, plitka ~64px):
                          2 × 15 + 13 + `py-1.5` 12 = 55 ≤ 64 ✓. To'liq
                          matn `title` da. */}
                      <p
                        className={cn(
                          T.tableName,
                          "line-clamp-2 leading-[17px] fitscreen:leading-[15px]",
                        )}
                        title={row.title}
                      >
                        {row.title}
                      </p>
                      <p
                        className={cn(
                          T.valueMeta,
                          "mt-0.5 truncate leading-[14px] fitscreen:mt-0 fitscreen:leading-[13px]",
                        )}
                      >
                        {[row.owner, row.dueLabel].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default InsightsCard;
