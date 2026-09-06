// React
import { useEffect, useState } from "react";

// Icons
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Clock,
  Inbox,
  Medal,
  Minus,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import { CardLink } from "./CardLink";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";
import useFitRows from "@/shared/hooks/useFitRows";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import {
  LEVEL_COLORS,
  formatByUnit,
  formatChange,
  linkLabel,
  trendTone,
} from "../data/academicDashboard.data";
import { MOTION, T, TONE, contentDelay } from "../data/dashboard.tokens";

/**
 * KARTA TANASINING QOBIG'I.
 *
 * ⚠️ `flex` + `min-h-0` + `overflow-hidden` — UCHALASI ham majburiy.
 * Bir ekranli rejimda karta to'r katagiga qulflanadi va ichidagi ro'yxat
 * o'z balandligini o'zi hal qilsa, karta yorilib chiqardi. `min-h-0`
 * flex bolasining standart `min-height: auto` sini bekor qiladi —
 * zanjirning BITTA bo'g'inida tushib qolsa, butun to'r toshib ketadi.
 *
 * `mt-3 fitscreen:mt-2` — `DashboardCard` dagi oraliqning AYNAN o'zi
 * (twMerge bu yerdagini ustun qo'yadi): sarlavha bilan tana orasidagi
 * masofa bir ekranli rejimda 12 dan 8px ga tushadi. ⚠️ JUFTLIK
 * BUZILMAYDI — faqat `mt-3` yozilsa, bu ikki karta qo'shnilaridan 4px
 * pastroq boshlanib, ularning oxirgi qatorini yeb qo'yardi.
 */
const BODY = "mt-3 fitscreen:mt-2 flex min-h-0 flex-col overflow-hidden";

/**
 * Plitkalar orasidagi KIRISH QADAMI (ms) — "stagger".
 *
 * Xoreografiya: karta bo'sh kirib (`delay`), `DELAY.content` dan keyin
 * plitkalar 60ms qadam bilan ko'tariladi va sanay boshlaydi. To'rttasi
 * bir vaqtda paydo bo'lsa bitta "blok" bo'lib ko'rinadi, ketma-ket kelsa
 * ko'z ularni alohida o'qiydi. 60ms — to'rt plitkada jami 180ms.
 */
const TILE_STEP_MS = 60;

/**
 * Tizim darajasidagi "kam harakat" tanlovi.
 *
 * ⚠️ `useCountUp` buni o'zi tekshiradi, lekin eksport qilmaydi (shared
 * hook — bu vazifada unga tegilmaydi). Bu yerda u faqat kechikish uchun
 * kerak: harakat o'chiq bo'lsa kechikish ham o'chadi — yakuniy son
 * darhol ko'rinadi, kechikish davomida "0" turib qolmaydi.
 */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Kechiktirilgan count-up: plitka ko'tarilgan paytda sanay boshlaydi.
 *
 * Nima uchun `target` ni 0 ga qo'yish orqali: `useCountUp` ning
 * `enabled=false` holati DARHOL yakuniy sonni ko'rsatadi (bu reduced-
 * motion uchun), ya'ni u bilan "kutib turish" bo'lmaydi. Kechikish
 * paytida nishon 0 — plitka baribir ko'rinmas (`fade-up` ning `both`
 * fill'i), kechikish tugagach nishon haqiqiy qiymatga o'tadi va hook 0
 * dan sanaydi. Keyingi ma'lumot o'zgarishida (oy almashsa) joriy
 * qiymatdan yangisiga o'tadi — hookning o'z qoidasi.
 *
 * Bitta `setTimeout`, tugagach tozalanadi — fon tsikli yo'q.
 */
const useDelayedCount = (value, delayMs, { decimals = 0 } = {}) => {
  const delay = prefersReducedMotion() ? 0 : delayMs;
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const target = value == null || value === "" ? null : Number(value);
  return useCountUp(started ? target : 0, { decimals });
};

/**
 * O'zgarish yo'nalishi → TON tokeni. `trendTone` yo'nalishni beradi
 * (bu kartalarda `inverse` yo'q: o'sish har doim ijobiy), rang esa
 * `dashboard.tokens` dan — KPI kartalari bilan bitta shkala.
 */
const DELTA_TONE = {
  up: TONE.positive.text,
  down: TONE.negative.text,
  flat: TONE.neutral.text,
};

/**
 * Plitka ostidagi o'zgarish yozuvi.
 *
 * ⚠️ `change === null` (o'tgan oy nol edi) — qator UMUMAN chizilmaydi:
 * noldan o'sishning foizi yo'q va uni "+100%" deb ko'rsatish soxta bo'lardi.
 *
 * Harakat YO'Q: nishon plitka bilan birga kiradi. Ilgari u count-up
 * tugagach "sakrardi" (`bounce-once`) — bu bachkana o'qilardi.
 */
const MiniDelta = ({
  change,
  changeUnit = "percent",
  title,
  compact = false,
}) => {
  if (change == null) return null;

  const tone = trendTone(change);
  const Icon =
    tone.direction === "up"
      ? ArrowUp
      : tone.direction === "down"
        ? ArrowDown
        : Minus;

  return (
    <span
      title={title}
      className={cn(
        // `whitespace-nowrap` — "+4.8 p.p." bo'shliqdan o'ralib qatorni
        // o'stirmasin (KPI kartasidagi bilan bir xil sabab)
        "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[10px]",
        // ⚠️ `leading-none` — qator qutisi matn o'lchamiga teng (10px):
        // nishon plitkaning YUQORI qatorida ikonka doirasi bilan yonma-yon
        // turadi va o'z balandligi bilan qatorni o'stirmasligi kerak.
        // Matnning O'ZI 10px da qoladi — bu quyi chegara.
        "leading-none",
        DELTA_TONE[tone.direction] ?? TONE.neutral.text,
      )}
    >
      {/* ⚠️ `compact` (olimpiada plitkasi): xl..2xl oralig'ida (yon panel
          ochiq, karta ~325px, plitka ichi ~57px) doira 24 + oraliq 4 +
          strelka 10 + "-25%" 22 = 60px SIG'MAYDI — O'LCHANGAN, 3px
          kesilardi. Strelka yashirinadi: yo'nalishni ishora (+/−) va rang
          allaqachon aytadi. 2xl dan keng ekranda plitka ~120px — strelka
          qaytadi. xl dan tor ekranda to'r bir ustunli, plitka keng.
          (`max-2xl:` varianti bu loyihada YO'Q: `fitscreen` ekrani `raw`
          bilan berilgan va Tailwind bunda `max-*` ni chiqarmaydi — shuning
          uchun `xl:hidden 2xl:inline` juftligi.) */}
      <Icon
        className={cn(
          "size-3 shrink-0 fitscreen:size-2.5",
          compact && "xl:hidden 2xl:inline",
        )}
      />
      {formatChange(change, changeUnit)}
    </span>
  );
};

/**
 * "So'nggi yutuqlar" ro'yxatining SERVER chegarasi.
 *
 * ⚠️ Server ham AYNAN shuncha yuboradi (`RECENT_ACHIEVEMENT_LIMIT`).
 * Bu yerda u ikki ish qiladi: (1) chegara serverda oshirilsa karta jimgina
 * o'sib ketmaydi, (2) `useFitRows` ga QAT'IY `max` bo'lib beriladi.
 *
 * ⚠️ `max` ma'lumotdan HISOBLANMAYDI (`recent.length` emas): `useFitRows`
 * `max` ni dastlabki qiymat sifatida ham ishlatadi va `ResizeObserver`
 * yo'q muhitda (jsdom testi, juda eski brauzer) AYNAN shu qaytadi.
 * Ma'lumot kelgunicha `recent.length` nol bo'lgani uchun bunday muhitda
 * ro'yxat abadiy bitta qatorda qolib ketardi.
 */
const RECENT_LIMIT = 4;

/**
 * "So'nggi yutuqlar" qatorining QAT'IY balandligi (px).
 *
 * ⚠️ Bu son bilan `h-[28px]` sinfi BIR VAQTDA o'zgaradi va qatorlar
 * orasiga oraliq (`gap` / `space-y`) QO'SHILMAYDI. Sabab o'lchov
 * halqasida: bir ekranli bo'lmagan ekranda konteyner balandligi
 * kontentning O'ZIDAN kelib chiqadi, ya'ni `floor(n × 28 / 28) = n` —
 * barqaror nuqta. Qatorlar orasiga 4px oraliq qo'shilsa hisob
 * `floor((28n + 4(n−1)) / 32) = n − 1` beradi va ro'yxat har renderda
 * bittaga qisqarib, minimalgacha "so'nib" borardi.
 *
 * ⚠️ Kirish animatsiyasi (`fade-up`) FAQAT `transform`/`opacity` —
 * qator qutisi 28px da qoladi va o'lchovga ta'sir qilmaydi.
 */
const RECENT_ROW_H = 28;

/**
 * "So'nggi yutuqlar" bo'limining QO'ZG'ALMAS qismi (px) — bir ekranli
 * rejimdagi IXCHAM AJRATUVCHI: oraliq (4) + `pt-[5px]` (5) +
 * yorliq satri (11) = 20.
 *
 * ⚠️ Bu son O'LCHOVGA qo'shiladi, ya'ni bo'limning yorlig'i ham joy
 * talab qiladi deb hisoblanadi. Aks holda "bitta qator sig'adi" degan
 * javob yorliq bilan birga 48px talab qilib, oxirgi qatorni yarim
 * kesardi.
 *
 * ⚠️ Son bilan `fitscreen:` sinflari BIR VAQTDA o'zgaradi (quyida,
 * ajratuvchi markupida). Ilgari bu qiymat 38 edi — bo'lim yorlig'i
 * bo'sh joyning uchdan birini yeb, chegaradagi ekranda ro'yxatga birorta
 * qator ham qolmasdi.
 *
 * ⚠️ Oddiy oqimda (fitscreen tashqarisida) ajratuvchi kengroq (~38px),
 * lekin o'lchov u yerda ham BARQAROR: konteyner balandligi kontentdan
 * kelib chiqadi, ya'ni `floor((38 + 28n − 20) / 28) = n`.
 */
const RECENT_HEAD_H = 20;

/**
 * Plitka RANG TONLARI — daraja / ko'rsatkich bo'yicha.
 *
 * ⚠️ Sinflar TO'LIQ SATR sifatida yotadi (`bg-${color}-50` shaklida
 * yig'ilmaydi): Tailwind JIT manbani matn sifatida skanerlaydi va
 * yig'ilgan nomni ko'rmaydi — rang jimgina yo'qolardi.
 *
 * Uch qatlam: plitka foni + ramka (`card`, hover'da ramka to'qlashadi),
 * ikonka doirasi (`icon`), yorliq rangi (`label` — yorliqning O'LCHAMI va
 * VAZNI `T.label` dan, bu yerda faqat rang). Fon `-50`, ramka `-200/70`
 * → hover `-300`, doira `-100` + ikonka `-600`, yorliq `-700` — hamma
 * tonda bir xil nisbat, shuning uchun to'rt rangli plitka bitta oila
 * bo'lib ko'rinadi.
 */
const TONES = {
  slate: {
    card: "bg-slate-50 ring-slate-200/70 hover:ring-slate-300",
    icon: "bg-slate-100 text-slate-600",
    label: "text-slate-700",
  },
  amber: {
    card: "bg-amber-50 ring-amber-200/70 hover:ring-amber-300",
    icon: "bg-amber-100 text-amber-600",
    label: "text-amber-700",
  },
  sky: {
    card: "bg-sky-50 ring-sky-200/70 hover:ring-sky-300",
    icon: "bg-sky-100 text-sky-600",
    label: "text-sky-700",
  },
  emerald: {
    card: "bg-emerald-50 ring-emerald-200/70 hover:ring-emerald-300",
    icon: "bg-emerald-100 text-emerald-600",
    label: "text-emerald-700",
  },
  blue: {
    card: "bg-blue-50 ring-blue-200/70 hover:ring-blue-300",
    icon: "bg-blue-100 text-blue-600",
    label: "text-blue-700",
  },
  violet: {
    card: "bg-violet-50 ring-violet-200/70 hover:ring-violet-300",
    icon: "bg-violet-100 text-violet-600",
    label: "text-violet-700",
  },
  cyan: {
    card: "bg-cyan-50 ring-cyan-200/70 hover:ring-cyan-300",
    icon: "bg-cyan-100 text-cyan-600",
    label: "text-cyan-700",
  },
};

/**
 * Plitkaning UMUMIY qobig'i (olimpiada va to'garak — bitta uslub).
 *
 * `T.tile` — sirt, ring va hover (2px ko'tarilish + ring to'qlashadi,
 * 200ms out-quint); tonning `card` sinfi uning oq fonini va ring
 * rangini ustidan yozadi (twMerge — keyingisi yutadi).
 *
 * Kirish animatsiyasi TASHQI o'ramda, hover ICHKI kartada — ATAYLAB
 * ikki element. `fade-up` `both` fill bilan e'lon qilingan: u tugagach
 * ham `transform` ni ushlab turadi va animatsiya oddiy uslubdan ustun
 * bo'lgani uchun o'sha elementdagi `hover:-translate-y-0.5` HECH QACHON
 * ishlamasdi. O'ram animatsiyani, karta hover'ni oladi.
 */
const TILE_SHELL = cn(T.tile, "relative flex h-full min-w-0");

/**
 * Olimpiada plitkalarining tartibi, ikonkasi va rangi.
 *
 * ⚠️ `level` — server `achievements.levels` dagi kalit. Yorliq ham
 * SERVERDAN olinadi (`row.label`): daraja nomlari
 * `achievement.service.js` da yagona joyda yotadi va bu yerda nusxalansa,
 * ular bir kun kelib ikki xil bo'lardi. `level: null` — "Jami" plitkasi.
 *
 * Ranglar daraja "og'irligi" bo'yicha: xalqaro — oltin (amber),
 * respublika — sky, viloyat — emerald, jami — neytral slate.
 * ⚠️ Bu `LEVEL_COLORS` (ro'yxatdagi medal rangi) bilan bir xil EMAS va
 * bo'lishi shart ham emas: u yerda oltita daraja bitta shkalada, bu
 * yerda esa to'rtta plitka — maket rangi.
 */
const ACHIEVEMENT_TILES = [
  {
    level: null,
    icon: Trophy,
    tone: TONES.slate,
    label: "Jami",
    title: "Jami yutuqlar",
  },
  { level: "international", icon: Medal, tone: TONES.amber },
  { level: "republic", icon: Award, tone: TONES.sky },
  { level: "region", icon: Star, tone: TONES.emerald },
];

/**
 * O'rin nishoni: 1-o'rin oltin, 2-o'rin kumush, 3-o'rin bronza,
 * ishtirokchi — neytral. Kalitlar serverning `place` qiymati.
 *
 * Shakl va vazn `TONE.*.chip` dan (bitta chip tizimi); bronza uchun
 * tokenda rang yo'q — neytral chip ustiga FAQAT rang yoziladi.
 */
const PLACE_CHIP = {
  first: TONE.warning.chip,
  second: TONE.neutral.chip,
  third: cn(
    TONE.neutral.chip,
    "bg-orange-50 text-orange-700 ring-orange-200/60",
  ),
  participant: TONE.neutral.chip,
};

/**
 * Olimpiada plitkasi: ikonka doirasi (+ o'zgarish) → KATTA son → yorliq.
 *
 * ⚠️ FAQAT olimpiada kartasida — u yerda bitta qatorda TO'RT plitka
 * turadi va ular `shrink-0`, ya'ni har doim to'liq ko'rinadi.
 *
 * BALANDLIK (o'lchov jadvali uchun): bir ekranli rejimda
 *   `p-1.5` 12 + doira 24 + `mt-1` 4 + son 24 + `mt-0.5` 2 + yorliq 10
 *   = 76px. Oddiy oqimda 16 + 32 + 6 + 24 + 4 + 12 = 94.
 * Chegarada (1280×960, ixcham ramka bilan maydon ≥145px) ro'yxatga
 * 145 − 76 = 69px qoladi: ajratuvchi 20 + 1 qator 28 — bitta yutuq
 * ko'rinadi, kattaroq ekranda ko'proq.
 *
 * ⚠️ Son `T.valueTile` (2xl) — plitkaning butun ma'nosi shu raqam va u
 * `fitscreen` da ham KICHRAYMAYDI: yutilgan joy doira (32 → 24) va
 * oraliqlardan olinadi, raqamdan emas.
 *
 * ⚠️ O'zgarish nishoni doira bilan BIR QATORDA (o'ng tomonda), sonning
 * ostida emas: alohida qator plitkani 12px o'stirib, chegaradagi
 * ekranda ro'yxatning yagona qatorini yeb qo'yardi.
 *
 * `delay` — plitkaning kirish kechikishi (ms): karta + kontent + qadam.
 */
const AchievementTile = ({
  icon: Icon,
  tone,
  value,
  label,
  title,
  change,
  changeTitle,
  delay,
}) => {
  const counted = useDelayedCount(value, delay);

  return (
    <div
      className={cn("min-w-0", MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(TILE_SHELL, "flex-col p-2 fitscreen:p-1.5", tone.card)}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full fitscreen:size-6",
              tone.icon,
            )}
          >
            <Icon className="size-4 fitscreen:size-3.5" />
          </span>
          <MiniDelta change={change} title={changeTitle} compact />
        </div>

        <p
          className={cn(T.value, T.valueTile, "mt-1.5 truncate fitscreen:mt-1")}
        >
          {formatByUnit(counted, "count")}
        </p>

        {/* ⚠️ Yorliq BIR QATOR, to'liq matni `title` da: tor kartada (yon
            panel ochiq, 1280px) o'ralgan yorliq plitkani 12px o'stirardi.
            `leading-[12px]` / `fitscreen:leading-none` — O'LCHOV qatori
            (76/94px hisobida), tipografiya `T.label` dan. */}
        <p
          className={cn(
            T.label,
            "mt-1 truncate leading-[12px] fitscreen:mt-0.5 fitscreen:leading-none",
            tone.label,
          )}
          title={title}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

/**
 * To'garak kartasining plitkasi — IKONKA CHAPDA, matn o'ngda.
 *
 * ⚠️ Vertikal (markazlashtirilgan) shakl bu kartada ISHLAMAYDI va bu
 * o'lchangan: 2×2 to'rda bir qatorga chegarada ~68px tegadi (maydon
 * 145 − 8 oraliq, ikkiga), vertikal plitka esa (doira 32 + son 24 +
 * yorliq 12 + taqqoslash satri 12 + oraliqlar) 90px dan oshardi.
 *
 * YOTIQ SHAKL BALANDLIGI: bir ekranli rejimda `py-1.5` 12 + yorliq 12 +
 * `mt-0.5` 2 + son 24 + `mt-0.5` 2 + taqqoslash 12 = 64px; oddiy oqimda
 * `p-2` bilan 68. Ikkalasi ham 68.5px qatorga sig'adi — zaxira 4.5px.
 * Plitkaga qator qo'shilsa yoki matn o'ralishiga yo'l qo'yilsa, o'lchov
 * qaytadan tekshirilishi shart. Yorliq va taqqoslash satrlarining
 * `leading-[12px]` i AYNAN shu hisobning qismi.
 *
 * Yorliq va o'zgarish nishoni BIR QATORDA (yorliq `truncate`, nishon
 * `shrink-0`): son yonida turganda tor kartada "16.0%" + "+1.2 p.p."
 * sig'may, son kesilardi — son esa plitkaning ma'nosi.
 */
const ClubTile = ({
  icon: Icon,
  tone,
  value,
  unit,
  label,
  compare,
  compareTitle,
  change,
  changeUnit,
  delay,
}) => {
  // Foizli ko'rsatkich ("16.4%") sanashda ham kasrini yo'qotmaydi
  const counted = useDelayedCount(value, delay, {
    decimals: unit === "percent" ? 1 : 0,
  });

  return (
    <div
      className={cn("min-h-0 min-w-0", MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          TILE_SHELL,
          "items-center gap-2 p-2 fitscreen:px-2 fitscreen:py-1.5",
          tone.card,
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full fitscreen:size-7",
            tone.icon,
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-1">
            <p
              className={cn(
                T.label,
                "min-w-0 truncate leading-[12px]",
                tone.label,
              )}
              title={label}
            >
              {label}
            </p>
            <MiniDelta change={change} changeUnit={changeUnit} />
          </div>

          <p className={cn(T.value, T.valueTile, "mt-0.5 truncate")}>
            {formatByUnit(counted, unit)}
          </p>

          {/* Taqqoslash satri BIR QATOR: to'liq matni `title` da
              (o'ralgan satr plitkani 12px o'stirardi) */}
          <p
            className={cn(T.valueMeta, "mt-0.5 truncate leading-[12px]")}
            title={compareTitle ?? compare}
          >
            {compare}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * OLIMPIADA VA MUSOBAQALAR.
 *
 * ⚠️ Sanoq YUTUQ QATORLARI bo'yicha, o'quvchilar bo'yicha emas: bir
 * o'quvchi bir oyda ikkita olimpiadada g'olib bo'lsa, ikkalasi ham
 * ko'rinishi kerak.
 *
 * ⚠️ Plitkalarda FAQAT to'rt ko'rsatkich turadi (jami + xalqaro +
 * respublika + viloyat): maketdagi qator shu, qolgan darajalar (maktab,
 * tuman, shahar) esa "Yutuqlar" oynasida to'liq ro'yxat bilan ko'rinadi.
 *
 * ⚠️ QATOR SONI TAXMIN QILINMAYDI — O'LCHANADI. Plitkalar qatori
 * `shrink-0` (u har doim to'liq ko'rinadi), qolgan bo'sh joy ro'yxatga
 * beriladi va `useFitRows` o'sha joyga nechta qator SIG'ISHINI hisoblaydi.
 * Shuning uchun: kesilgan yarim qator YO'Q, karta ichida surilish ham YO'Q.
 *
 * ⚠️ BO'SH OY (`total === 0`) — plitkalar BARIBIR chiziladi (nol bilan,
 * maketdagidek), bo'sh holat matni esa ro'yxatning O'RNIDA turadi.
 * `DashboardCard` ning `isEmpty` i faqat ma'lumot UMUMAN kelmaganda
 * (`!stats`) yoqiladi — aks holda u butun tanani, plitkalar bilan birga,
 * "Inbox" plashi bilan almashtirardi.
 *
 * `delay` — kartaning kirish kechikishi (ms), sahifa xoreografiyasidan.
 * Kontent (plitkalar, ro'yxat) `contentDelay` bilan KARTADAN KEYIN
 * kiradi: karta bo'sh kirib, keyin to'ladi.
 */
export const AchievementsCard = ({ data, isLoading, isError, delay = 0 }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const stats = data?.achievements;
  const byLevel = new Map((stats?.levels ?? []).map((row) => [row.key, row]));
  const recent = (stats?.recent ?? []).slice(0, RECENT_LIMIT);
  const isEmptyMonth = !!stats && stats.total === 0;

  // Plitkalar: karta + kontent + i × 60ms. Ro'yxat — plitkalardan keyin,
  // BITTA fade-up (qatorma-qator kirish bachkana ko'rinardi).
  const tilesStart = contentDelay(delay);
  const listDelay = tilesStart + ACHIEVEMENT_TILES.length * TILE_STEP_MS;

  // ⚠️ `min: 0` — ATAYLAB. Ilgari `min: 1` turardi va u O'LCHOVNI BEKOR
  // QILARDI: past ekranda ro'yxatga 1.5px joy qolganda ham 28px lik qator
  // chizilib, uning 95% i kesib tashlanardi — ya'ni foydalanuvchi uch
  // marta rad etgan "yarim qator" aynan shu chegara tufayli qaytib
  // kelardi. Endi qoida istisnosiz: SIG'MAGAN QATOR CHIZILMAYDI, sig'magan
  // bo'lim esa (yorlig'i bilan birga) umuman ochilmaydi.
  //
  // ⚠️ O'lchanadigan element — bo'limning O'ZI emas, uning O'RNI: `flex-1`
  // + `min-h-0` konteyner balandligi ICHIDAGIDAN QAT'IY NAZAR qoldiq
  // joyga teng. Bo'lim o'lchansa, u yashiringanda joy bo'shab, keyingi
  // o'lchov uni yana ochib yuborardi — ro'yxat har kadrda ochilib-yopilib
  // turardi.
  const [recentRef, visibleRecent] = useFitRows({
    rowHeight: RECENT_ROW_H,
    headerHeight: RECENT_HEAD_H,
    min: 0,
    max: RECENT_LIMIT,
  });

  const shownRecent = recent.slice(0, visibleRecent);

  // ⚠️ Oynani sahifa emas, kartaning o'zi ochadi: oyna sahifada
  // mount qilingan, kartaga esa faqat "ochish" iltimosi kerak. Shu
  // sababli sahifa bilan yangi prop kelishuvi ham talab qilinmaydi.
  const canSeeAchievements = can("achievements.view");
  // O'zgarish TAQQOSLASH OYIga nisbatan — plitkada faqat strelka turadi,
  // shuning uchun qaysi oyga nisbatan ekani `title` da aytiladi
  const compareLabel = data?.compareMonthLabel || "taqqoslash oyi";
  const changeTitle = `${compareLabel} bilan solishtirganda`;

  // Ko'rinmayotgan yutuqlar soni — havolada (`linkLabel`, yagona qoida:
  // son har doim YASHIRILGANLAR soni). Server `recent` ni to'rttaga
  // cheklaydi, shuning uchun maxraj sifatida oyning JAMI soni olinadi.
  const hiddenAchievements = Math.max(
    0,
    (stats?.total ?? 0) - shownRecent.length,
  );

  return (
    <DashboardCard
      title="Olimpiada va musobaqalar"
      hint={
        data ? `${data.monthLabel} · jami ${stats?.total ?? 0} ta yutuq` : ""
      }
      category="achievements"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!stats}
      emptyText="Bu oyda yutuq qayd etilmagan"
      dense
      bodyClassName={BODY}
      // ⚠️ Ruxsati yo'q foydalanuvchida havola YO'QOLMAYDI, o'chiriladi:
      // kartalar to'rda yonma-yon turadi va havolasi olib tashlangani
      // qo'shnisidan past tugab, qatorning pastki chizig'ini buzardi.
      footer={
        <CardLink
          disabled={!canSeeAchievements || !data}
          onClick={
            canSeeAchievements && data
              ? () => openModal("academicAchievements", { month: data.month })
              : undefined
          }
        >
          {linkLabel("Barcha yutuqlar", hiddenAchievements)}
        </CardLink>
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* ⚠️ Plitkalar `shrink-0`: kartaning ASOSIY ma'nosi shu to'rt
            raqamda va joy tanqisligida ular EMAS, ro'yxat qisqaradi.
            Kichik ekranda to'rt ustun siqilib ketadi — ikkiga bo'linadi. */}
        <div className="grid shrink-0 grid-cols-2 gap-2 xs:grid-cols-4">
          {ACHIEVEMENT_TILES.map((tile, index) => {
            const row = tile.level ? byLevel.get(tile.level) : null;
            const value = tile.level ? row?.count : stats?.total;
            const change = tile.level ? row?.change : stats?.change;
            // Daraja yorlig'i serverdan ("Xalqaro"), to'liq shakli
            // ("Xalqaro daraja") `title` da
            const label = tile.level ? (row?.label ?? tile.level) : tile.label;
            const title = tile.level ? `${label} daraja` : tile.title;

            return (
              <AchievementTile
                key={tile.level ?? "total"}
                delay={tilesStart + index * TILE_STEP_MS}
                icon={tile.icon}
                tone={tile.tone}
                value={value}
                label={label}
                title={title}
                change={change}
                changeTitle={changeTitle}
              />
            );
          })}
        </div>

        {/* ⚠️ O'LCHANADIGAN konteyner HAR DOIM chiziladi va balandligi
            ichidagi kontentga BOG'LIQ EMAS (`flex-1` + `min-h-0` =
            qoldiq joy). `overflow-y-auto` bu yerda ham, kartaning hech
            qayerida ham YO'Q — sig'maydigan qator chizilmaydi. */}
        <div ref={recentRef} className="min-h-0 flex-1 overflow-hidden">
          {isEmptyMonth && (
            // Bo'sh oy — ro'yxat o'rnida ixcham xabar (plitkalar
            // yuqorida nol bilan turibdi). Kirishi plitkalardan keyin.
            <div
              className={cn(
                "flex h-full items-center justify-center gap-1.5",
                T.cardHint,
                MOTION.enter,
              )}
              style={{ animationDelay: `${listDelay}ms` }}
            >
              <Inbox className="size-3.5 shrink-0" />
              <p>Bu oyda yutuq qayd etilmagan</p>
            </div>
          )}

          {!isEmptyMonth && shownRecent.length > 0 && (
            // ⚠️ `fitscreen` da bu bo'lim SARLAVHA emas, AJRATUVCHI:
            // chap/o'ng chiziq (`T.sectionRule`) + bo'lim yorlig'i, jami
            // 20px (`RECENT_HEAD_H` bilan BIR VAQTDA o'zgaradi): `mt-1` 4 +
            // `pt-[5px]` 5 + yorliq satri 11. Ilgari bu yerda `border-t`
            // turardi — endi chiziq yorliqning ikki yonida, uning 1px i
            // `pt` ga o'tdi. Butun bo'lim BITTA fade-up bilan plitkalardan
            // keyin kiradi.
            <div
              className={cn(
                "mt-2.5 pt-2 fitscreen:mt-1 fitscreen:pt-[5px]",
                MOTION.enter,
              )}
              style={{ animationDelay: `${listDelay}ms` }}
            >
              <div className="flex items-center gap-2 pb-1 fitscreen:pb-0">
                <span className={T.sectionRule} />
                <p
                  className={cn(
                    T.sectionLabel,
                    "shrink-0 fitscreen:leading-[11px]",
                  )}
                >
                  So'nggi yutuqlar
                </p>
                <span className={T.sectionRule} />
              </div>

              <ul>
                {shownRecent.map((row) => (
                  // Qatorlar ALOHIDA animatsiya qilinmaydi — butun bo'lim
                  // bitta kiradi. 28px quti o'zgarmaydi.
                  <li
                    key={row.id}
                    className={cn(
                      "flex h-[28px] items-center gap-2",
                      T.tableRow,
                    )}
                  >
                    {/* Daraja rangi — `LEVEL_COLORS` dagi yagona shkala.
                        Sinf nomi Tailwind'da oldindan ma'lum emas, shuning
                        uchun rang inline beriladi. */}
                    <Medal
                      className="size-3.5 shrink-0"
                      style={{ color: LEVEL_COLORS[row.level] ?? "#94a3b8" }}
                    />

                    {/* Yutuq nomi bilan birga o'quvchi va sana `title` da:
                        maketda qator BITTA satr, lekin ma'lumot
                        yo'qolmasligi kerak */}
                    <p
                      className={cn(T.tableName, "min-w-0 flex-1 truncate")}
                      title={`${row.title} · ${row.studentName} · ${formatDateUz(row.date)}`}
                    >
                      {row.title}
                    </p>

                    {/* O'rin nishoni: `leading-3` + `py-0.5` — 16px quti,
                        28px qator ichida markazda; rang `PLACE_CHIP` dan */}
                    <span
                      className={cn(
                        "shrink-0 leading-3",
                        PLACE_CHIP[row.place] ?? PLACE_CHIP.participant,
                      )}
                    >
                      {row.placeLabel}
                    </span>
                    <span className={cn(T.tableSub, "shrink-0")}>
                      {row.className}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

/**
 * To'garak plitkalari.
 *
 * ⚠️ BIRLIKLAR ARALASHMAYDI: uchtasi sanoq va o'zgarishi FOIZDA, qamrov
 * esa foizli ko'rsatkich va o'zgarishi PUNKTDA ("+4.8 p.p."). Server
 * `coverageChange` ni aynan shu ma'noda yuboradi.
 *
 * ⚠️ `Club` jadvalida DAVR YO'Q (faqat `isActive` bayrog'i), shuning uchun
 * to'garaklar soni va haftalik soat bo'yicha O'TGAN OY QIYMATI YO'Q —
 * server `null` yuboradi va plitkada "—" turadi. Bir vaqtlar u yerda
 * joriy qiymatning nusxasi turardi: ekranda "O'tgan oy: 12 · 0%" degan
 * yozuv paydo bo'lib, u o'zgarish yo'qligini TASDIQLAB turardi — hatto
 * to'garaklar soni 8 dan 12 ga chiqqan oyda ham.
 *
 * ⚠️ "Qamrov" — o'quvchilarning necha foizi to'garakka qatnashadi.
 * Maketda bu o'rinda "Qoniqish darajasi" turgan edi, lekin qoniqish
 * so'rov natijasi va tizimda so'rov yuritilmaydi. Bo'lmagan raqamni
 * ko'rsatish o'rniga o'lchanadigan ko'rsatkich qo'yildi.
 */
const CLUB_TILES = [
  {
    icon: BookOpen,
    tone: TONES.blue,
    label: "To'garaklar soni",
    unit: "count",
    valueKey: "clubCount",
    previousKey: "previousClubCount",
    changeKey: "clubChange",
    changeUnit: "percent",
    historyNote:
      "To'garaklar ro'yxati davr bilan yuritilmaydi — o'tgan oy kesimi yo'q",
  },
  {
    icon: Users,
    tone: TONES.violet,
    label: "Qatnashayotgan o'quvchi",
    unit: "count",
    valueKey: "studentCount",
    previousKey: "previousStudentCount",
    changeKey: "studentChange",
    changeUnit: "percent",
  },
  {
    icon: Clock,
    tone: TONES.cyan,
    label: "Haftalik dars soat",
    unit: "count",
    valueKey: "weeklyHours",
    previousKey: "previousWeeklyHours",
    changeKey: "weeklyHoursChange",
    changeUnit: "percent",
    historyNote:
      "To'garaklar ro'yxati davr bilan yuritilmaydi — o'tgan oy kesimi yo'q",
  },
  {
    icon: TrendingUp,
    tone: TONES.emerald,
    label: "Qamrov darajasi",
    unit: "percent",
    valueKey: "coverage",
    previousKey: "previousCoverage",
    changeKey: "coverageChange",
    changeUnit: "point",
  },
];

/**
 * TO'GARAK VA QO'SHIMCHA DARSLAR.
 *
 * ⚠️ To'garaklar RO'YXATI kartada emas, "To'garaklar" oynasida: kartada
 * to'rt ko'rsatkich turadi, ro'yxat esa (a'zolari, o'qituvchisi, tahriri
 * bilan) bir bosishda ochiladi. Ikki joyda ikki xil qisqartirilgan ro'yxat
 * turgani "qaysi biri to'liq?" degan savolni tug'dirardi.
 *
 * ⚠️ Bu kartada ro'yxat yo'q, ya'ni O'LCHASH ham kerak emas (`useFitRows`
 * ishlatilmaydi): 2×2 to'r bo'sh joyni o'zi to'ldiradi va plitkalar
 * kartaning balandligiga qarab cho'ziladi. Buning SHARTI —
 * `ClubTile` ning eng baland holati (bir ekranli rejimda 64px) to'rning
 * eng tor qatoriga (chegarada ~68.5px) sig'ishi. Plitkaga qator
 * qo'shilsa yoki matn ikki qatorga o'ralishiga yo'l qo'yilsa, o'lchov
 * qaytadan tekshirilishi shart — aks holda karta jimgina kesib
 * ko'rsatadi.
 *
 * `delay` — kartaning kirish kechikishi (ms); plitkalar kartadan keyin
 * 60ms qadam bilan kiradi.
 */
export const ClubsCard = ({ data, isLoading, isError, delay = 0 }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const stats = data?.clubs;
  const canSeeClubs = can("clubs.view");
  // Taqqoslash oyining yorlig'i — SERVERDAN (`.claude/rules/dates.md`:
  // sana matni panelda qo'lda yig'ilmaydi)
  const compareLabel = data?.compareMonthLabel || "Taqqoslash oyi";
  const tilesStart = contentDelay(delay);

  return (
    <DashboardCard
      title="To'garak va qo'shimcha darslar"
      hint={data ? `${data.monthLabel} · faol to'garaklar` : ""}
      category="clubs"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!stats || stats.clubCount === 0}
      emptyText="Faol to'garak yo'q"
      dense
      bodyClassName={BODY}
      // ⚠️ Ruxsatsiz holatda ham havola JOYIDA qoladi (o'chirilgan
      // ko'rinishda) — qatordagi uch kartaning pastki chizig'i tekis
      // turishi uchun.
      footer={
        <CardLink
          disabled={!canSeeClubs}
          onClick={canSeeClubs ? () => openModal("academicClubs") : undefined}
        >
          Batafsil ma'lumot
        </CardLink>
      }
    >
      {/* ⚠️ To'rt plitka IKKI QATORDA (2×2), bitta qatorda emas: uch
          ustunli to'rda kartaga ~590px kenglik to'g'ri keladi va to'rtga
          bo'linganda plitkaga ~140px qolardi — "Qatnashayotgan o'quvchi"
          yorlig'i va uning ostidagi taqqoslash satri o'sha kenglikda uch
          qatorga bo'linib ketardi.

          ⚠️ `h-full` + `grid-rows-2`: bir ekranli rejimda to'r kartaning
          BUTUN bo'sh maydonini egallaydi va ikki qator teng bo'linadi —
          plitkalar bir xil balandlikda turadi. Oddiy oqimda (kichik ekran)
          ota balandligi `auto` bo'lgani uchun `h-full` hech narsani
          o'zgartirmaydi. */}
      <div className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
        {CLUB_TILES.map((tile, index) => {
          const previous = stats?.[tile.previousKey];

          return (
            <ClubTile
              key={tile.valueKey}
              delay={tilesStart + index * TILE_STEP_MS}
              icon={tile.icon}
              tone={tile.tone}
              value={stats?.[tile.valueKey]}
              unit={tile.unit}
              label={tile.label}
              // ⚠️ Yorliq "O'tgan oy" DEB YOZILMAYDI: qiymat foydalanuvchi
              // tanlagan TAQQOSLASH OYIdan keladi (`buildClubs` ga
              // `previousMonth: compareMonth` uzatiladi) va u 23 oygacha
              // orqada bo'lishi mumkin.
              compare={`${compareLabel}: ${formatByUnit(previous, tile.unit)}`}
              compareTitle={previous == null ? tile.historyNote : undefined}
              change={stats?.[tile.changeKey]}
              changeUnit={tile.changeUnit}
            />
          );
        })}
      </div>
    </DashboardCard>
  );
};
