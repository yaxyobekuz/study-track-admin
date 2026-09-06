// React
import { useEffect, useState } from "react";

// Icons
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  CheckSquare,
  Minus,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";
import useEnterOnce from "@/shared/hooks/useEnterOnce";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  KPI_CARDS,
  formatByUnit,
  formatChange,
  planTone,
  trendTone,
} from "../data/academicDashboard.data";
import { MOTION, SURFACE, T, TONE, contentDelay, kpiDelay } from "../data/dashboard.tokens";

/**
 * ⚠️ To'r YAGONA joyda: yuklanish holati va tayyor holat AYNI to'rda
 * chizilishi shart — ular ajralib ketsa, ma'lumot kelgan lahzada oltita
 * karta o'z o'rnidan sakrab ketardi.
 *
 * ⚠️ `shrink-0` — KPI qatori sahifaning flex ustunida turadi va bir
 * ekranli rejimda pastdagi to'r butun qoldiq joyni oladi. Bu bo'lmasa
 * flex qatorni qisqartirib, oltita kartaning pastki satrini kesardi.
 *
 * ⚠️ Oraliq `gap-2` (ilgari `gap-4`): sahifadagi qolgan to'rlar bilan
 * bir xil — bir ekranli rejimda hamma joyda `gap-2`, oddiy oqimda esa
 * `gap-3`. Oraliqning ikki xil bo'lishi ekranni "sinib turgandek"
 * ko'rsatardi.
 */
const GRID = "grid shrink-0 grid-cols-2 gap-2 xs:grid-cols-3 xl:grid-cols-6";

/**
 * KARTA QOBIG'I — uchala holat (skelet, ma'lumotsiz, tayyor) AYNAN shu
 * sinflarni ishlatadi: qobiq farq qilsa, ma'lumot kelgan lahzada qator
 * balandligi o'zgarib, pastdagi to'qqizta karta sakrardi.
 *
 * Sirt — `SURFACE.card` (ring + ikki qatlamli soya + hover ko'tarilish),
 * to'qqizta karta bilan bir xil: KPI ham "haqiqiy karta".
 *
 * ⚠️ `fitscreen:p-2.5` — RAMKA XARAJATI faqat bir ekranli rejimda
 * qisqaradi (24 → 20): yutilgan 4px to'g'ridan-to'g'ri pastdagi uch
 * karta qatoriga bo'linadi. Kichik ekranda sahifa baribir suriladi,
 * u yerda siqishning ma'nosi yo'q.
 */
const CARD = cn(SURFACE.card, "p-3 fitscreen:p-2.5");

const ICONS = {
  students: Users,
  averageGrade: BookOpen,
  qualityRate: Star,
  attendanceRate: BarChart3,
  taskCompletion: CheckSquare,
  achievements: Trophy,
};

/**
 * Count-up kasr xonalari — `formatByUnit` bilan BIR XIL: baho ikki xona
 * (`toFixed(2)`), foiz/ball bir xona, sanoq butun. Xona ko'p bo'lsa
 * animatsiya davomida raqam formatlovchida yaxlitlanib "sakrab" turardi,
 * kam bo'lsa 4.32 o'rniga 4.30 → 4.32 deb ikki qadamda kelardi.
 */
const DECIMALS = { grade: 2, percent: 1, score: 1 };

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Ma'lumot qatlamidagi rang sinfini (`trendTone`/`planTone` — `text-green-600`,
 * `text-amber-600`, `text-red-600`) dizayn tizimining TON tokeniga o'giradi.
 * Chegara mantig'i ma'lumot faylida qoladi (moliya bilan bir xil), ko'rinish
 * esa bu yerda tokendan — ikki joyda chegara yozilmaydi.
 */
const toneOf = (className = "") => {
  if (className.includes("green")) return TONE.positive;
  if (className.includes("amber")) return TONE.warning;
  if (className.includes("red")) return TONE.negative;
  return TONE.neutral;
};

/**
 * Taqqoslash oyiga nisbatan o'zgarish — foizni ham, punktni ham server beradi.
 * Rang + vazn `TONE` dan (semibold): rangni ajratmaydigan ko'z ham farqni ko'radi.
 */
const Delta = ({ change, changeUnit }) => {
  if (change == null) return null;

  const tone = trendTone(change);
  const Icon = tone.direction === "up" ? ArrowUp : tone.direction === "down" ? ArrowDown : Minus;

  return (
    // ⚠️ `shrink-0 whitespace-nowrap` — O'LCHANGAN: 1280px da (yon panel
    // ochiq) KPI kartasi ~158px va "+0.11 p.p." matni flex ichida ikki
    // qatorga bo'linib, butun KPI qatorini 85.5 → 98px qilardi; o'sha
    // 12.5px pastdagi uch karta qatoridan olinardi. Qisqarsin — chap
    // tomondagi taqqoslash matni (`truncate`), bu emas.
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap",
        toneOf(tone.className).text,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {formatChange(change, changeUnit)}
    </span>
  );
};

/**
 * Reja bajarilishi — kartaning YUQORI O'NG burchagidagi kichik chip.
 *
 * ⚠️ Pastki satrga QO'YILMAYDI. Pastki satr oltala kartada bir xil bo'lishi
 * shart ("<taqqoslash oyi>: qiymat" + o'zgarish): bir vaqtlar reja
 * belgilangan karta o'sha satrni butunlay egallab olardi va bitta qatorda
 * "O'tgan oy: 1 240 ▲ +2.1%" bilan "Reja: 4.50 ◎ 96.5%" yonma-yon turib,
 * o'sha kartada o'tgan oy qiymati umuman ko'rinmay qolardi.
 *
 * ⚠️ Bu yerda O'SISH STRELKASI ishlatilmaydi (o'zgarish ko'rsatkichidan
 * farqli). "▲ 96.5%" degan yozuv "96.5% ga o'sdi" deb o'qiladi, holbuki bu
 * "rejaning 96.5% i bajarildi" degani — nishon ikonkasi bu ikki raqamni
 * bir qarashda ajratib turadi.
 *
 * ⚠️ `py-0` + `leading-none` — `TONE.chip` ning `py-0.5` i yorliq
 * qatorini 2px o'stirardi; balandlik 10px yorliq bilan bir xil qoladi.
 */
const PlanBadge = ({ plan, planRate, unit }) => {
  if (plan == null || planRate == null) return null;

  return (
    <span
      title={`Reja: ${formatByUnit(plan, unit)} · bajarilish ${planRate}%`}
      className={cn(
        toneOf(planTone(planRate)).chip,
        "inline-flex shrink-0 items-center gap-0.5 py-0 leading-none",
      )}
    >
      <Target className="size-3 shrink-0" />
      {planRate}%
    </span>
  );
};

/**
 * Reja bajarilishining INGICHKA PROGRESS CHIZIG'I — pastki satr ostida.
 *
 * Maketda yo'q, lekin "rejaning 96% i" degan raqam chiziq bilan bir
 * qarashda o'qiladi. Rang chegarasi nishon bilan bir xil ma'noda
 * (`planTone`): ≥100 yashil, ≥80 sariq, aks holda qizil — chiziq to'liq
 * bo'lsa reja BAJARILGAN, shuning uchun yashil chegarasi 95 emas, 100.
 *
 * ⚠️ BALANDLIK 6px (3px oraliq + 3px chiziq) — bundan oshirilmaydi: KPI
 * qatoridan olingan har piksel bir ekranli rejimda pastdagi kartalarning
 * ro'yxatidan olinadi. Rejasi yo'q karta chiziqni chizmaydi; to'r qatori
 * `stretch` bo'lgani uchun qo'shni kartalar baribir bir balandlikda.
 *
 * ⚠️ Kenglik `scaleX` bilan o'sadi (`MOTION.growX`), `width` bilan emas:
 * transform layout'ga tegmaydi va GPU'da arzon. 100% dan ortiq bajarilish
 * 100% da to'xtaydi — chiziq izdan chiqib ketmasin.
 */
const PlanBar = ({ planRate, delay = 0 }) => {
  if (planRate == null) return null;

  const value = Math.max(0, Math.min(100, Number(planRate)));
  const tone = value >= 100 ? TONE.positive : value >= 80 ? TONE.warning : TONE.negative;

  return (
    <div className="mt-[3px] h-[3px] w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full", MOTION.growX, tone.bar)}
        style={{ width: `${value}%`, animationDelay: `${delay}ms` }}
      />
    </div>
  );
};

/** Ikonka kvadrati — rangli fon, oq ikonka. Zoom/scale YO'Q. */
const IconBox = ({ icon: Icon, accent, muted = false }) => (
  <span
    className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
      "shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]",
      muted && "opacity-40",
      accent,
    )}
  >
    <Icon className="size-4" />
  </span>
);

/**
 * MA'LUMOTSIZ holat — so'rov xato bilan tugadi yoki javob bo'sh keldi.
 *
 * ⚠️ Qator UMUMAN YO'QOLMAYDI (ilgari `return null` edi). Ikki sabab:
 *   1. bir ekranli rejimning butun hisobi KPI qatori ~80px joy oladi deb
 *      qurilgan — qator yo'qolsa pastdagi to'qqizta karta yuqoriga
 *      sakrab, maketning "6 KPI + 3×3" shakli buzilardi;
 *   2. `CardLink` bilan bir xil qoida: element YO'QOLMAYDI, o'chiriladi —
 *      shunda foydalanuvchi ko'rsatkich BOR ekanini, faqat qiymati
 *      kelmaganini ko'radi.
 */
const Placeholder = ({ card }) => (
  <div className={CARD}>
    <div className="flex items-start gap-2.5">
      <IconBox icon={ICONS[card.key]} accent={card.accent} muted />

      <div className="min-w-0 flex-1">
        <p className={cn(T.label, "truncate leading-none")}>{card.label}</p>
        <p className={cn(T.value, T.valueKpi, "mt-1 truncate text-slate-300")}>—</p>
      </div>
    </div>

    <div className={cn(T.valueMeta, "mt-1 flex items-center justify-between gap-2 leading-tight")}>
      <span className="truncate">Ma'lumot yuklanmadi</span>
    </div>
  </div>
);

/** Yuklanish holati — kartaning AYNAN o'sha shakli, sakrash bo'lmasligi uchun. */
const Skeleton = () => (
  <div className={CARD}>
    <div className="flex items-center gap-2.5">
      <div className="size-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-2 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
    <div className="mt-1 h-2 w-full animate-pulse rounded bg-slate-50" />
  </div>
);

/**
 * BITTA KPI kartasi — alohida komponent, chunki count-up HOOK: `map`
 * ichida hook chaqirib bo'lmaydi.
 *
 * XOREOGRAFIYA (konteyner → kontent):
 *   1. karta `MOTION.enter` (fade-up) bilan `kpiDelay(index)` da kiradi —
 *      60ms dan boshlab 45ms qadam, oltita karta ketma-ket;
 *   2. qiymat `contentDelay` (karta + 140ms) dan keyin 0 dan sanaladi —
 *      karta BO'SH kirib, keyin to'ladi. Hookda `delay` yo'q: sanash
 *      `started` bayrog'i bilan ushlab turiladi, target 0 → qiymat;
 *   3. reja chizig'i ham o'sha paytda o'sadi (`grow-x`).
 * Bounce, zoom, ping — YO'Q. `prefers-reduced-motion` da `motion-safe:`
 * sinflar o'chadi, hook esa darhol yakuniy sonni beradi (`started`
 * boshidanoq true).
 *
 * Kirish sinfi tugagach OLIB TASHLANADI (`useEnterOnce`): `both`
 * fill-mode'i transform'ni band qilib, hover ko'tarilishini bloklardi.
 *
 * ⚠️ `previous` SANALMAYDI — u taqqoslash raqami, e'tibor joriy qiymatda.
 * Ikkalasi bir vaqtda sanalsa ko'z qaysi biriga qarashni bilmasdi.
 */
const KpiCard = ({ card, row, compareLabel, index }) => {
  const delay = kpiDelay(index);
  const contentAt = contentDelay(delay);
  const enter = useEnterOnce(MOTION.enter);

  const [started, setStarted] = useState(prefersReducedMotion);
  useEffect(() => {
    if (started) return undefined;
    const timer = setTimeout(() => setStarted(true), contentAt);
    return () => clearTimeout(timer);
  }, [started, contentAt]);

  const target = row.value == null ? null : started ? Number(row.value) : 0;
  const value = useCountUp(target, {
    duration: 900,
    decimals: DECIMALS[row.unit] ?? 0,
  });

  return (
    <div
      className={cn(CARD, "group", enter.enterClass)}
      style={{ animationDelay: `${delay}ms` }}
      onAnimationEnd={enter.onAnimationEnd}
    >
      <div className="flex items-start gap-2.5">
        {/* Kvadrat ikonka 44px dan `size-9` (36px) ga tushdi va
            `rounded-xl` o'rniga `rounded-lg`: qator balandligi endi
            ikonka bilan emas, ikki qatorlik matn bilan belgilanadi va u
            ekrandagi qolgan uch qatorga joy qoldiradi. */}
        <IconBox icon={ICONS[card.key]} accent={card.accent} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            {/* ⚠️ 10px — bu YORLIQ uchun chegara, o'qiladigan matn
                uchun emas: yonida turgan 22px qiymat ma'noni o'zi
                tashiydi, yorliq esa uni nomlaydi. Bir ekranli rejimda
                KPI qatoridan o'g'irlangan har piksel pastdagi
                kartalarning QATORIGA aylanadi. Undan pastga
                TUSHIRILMAYDI. */}
            <p className={cn(T.label, "truncate leading-none")}>{card.label}</p>
            <PlanBadge plan={row.plan} planRate={row.planRate} unit={row.unit} />
          </div>
          {/* `tabular-nums` (T.value) — sanash paytida raqamlar kengligi
              o'zgarib, matn chapga-o'ngga "titramasin". */}
          <p className={cn(T.value, T.valueKpi, "mt-1 truncate")}>
            {value == null ? "—" : formatByUnit(value, row.unit)}
          </p>
        </div>
      </div>

      <div className={cn(T.valueMeta, "mt-1 flex items-center justify-between gap-2 leading-tight")}>
        <span className="truncate">
          {compareLabel}: {formatByUnit(row.previous, row.unit)}
        </span>
        <Delta change={row.change} changeUnit={row.changeUnit} />
      </div>

      {row.plan != null && <PlanBar planRate={row.planRate} delay={contentAt} />}
    </div>
  );
};

/**
 * Sahifaning yuqori qatori — oltita savolga bir qarashda javob:
 * nechta o'quvchi bor, qanday baho oladi, sifat qanday, darsga keladimi,
 * topshiriq bajariladimi va tashqarida qanday natija ko'rsatyapmiz.
 *
 * ⚠️ Pastki satr OLTALA KARTADA BIR XIL: "<taqqoslash oyi>: qiymat" va
 * o'zgarish. Reja belgilangan bo'lsa u yuqori o'ng burchakdagi nishonda
 * ko'rinadi (`PlanBadge`) — shunda ikki xil ma'lumot bir-birining o'rnini
 * egallamaydi va qator tekis qoladi.
 *
 * ⚠️ Yorliq "O'tgan oy" DEB YOZILMAYDI. Taqqoslash oyini foydalanuvchi
 * sahifa boshidagi tanlagichdan tanlaydi va u 23 oygacha orqada bo'lishi
 * mumkin: "Yanvar, 2025" tanlanganda "O'tgan oy: 980" degan yozuv yolg'on
 * bo'lardi. Yorliqni SERVER beradi (`compareMonthLabel`) — fanlar
 * diagrammasi ham xuddi shu matnni ishlatadi, ya'ni bitta ekranda ikki xil
 * atama paydo bo'lmaydi.
 */
const KpiCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className={GRID}>
        {KPI_CARDS.map((card) => (
          <Skeleton key={card.key} />
        ))}
      </div>
    );
  }

  if (!data?.kpi) {
    return (
      <div className={GRID}>
        {KPI_CARDS.map((card) => (
          <Placeholder key={card.key} card={card} />
        ))}
      </div>
    );
  }

  // Yorliq serverdan; kelmasa neytral so'z — sana matni qo'lda yig'ilmaydi
  const compareLabel = data.compareMonthLabel || "Taqqoslash oyi";

  return (
    <div className={GRID}>
      {KPI_CARDS.map((card, index) => {
        const row = data.kpi[card.key];
        if (!row) return null;

        return (
          <KpiCard key={card.key} card={card} row={row} compareLabel={compareLabel} index={index} />
        );
      })}
    </div>
  );
};

export default KpiCards;
