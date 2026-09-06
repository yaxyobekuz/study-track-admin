// Icons
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import { useCountUp } from "@/shared/hooks/useCountUp";

// Tokens
import {
  DELAY,
  DELTA,
  MOTION,
  RAIL,
  SURFACE,
  T,
  metricDelay,
} from "../data/pulse.tokens";

/**
 * KPI LENTA — heroning ostidagi oltita plitka (`data.metrics`).
 *
 * ⚠️ IKONKA YO'Q va bu Atlas lentasidan ataylab farq qiladi. Puls'da
 * ohangni SIGNAL RELSI beradi (`pulse.tokens.js` §1); har plitkaga
 * yana ikonka qo'yilsa, u relsning rangini takrorlab, olti plitkada
 * o'n ikkita rangli belgi hosil bo'lardi. Yorliq matni + rels — ma'no
 * uchun yetarli ikki belgi.
 *
 * ⚠️ RO'YXAT SERVERDAN KELADI, bu yerda QATTIQ YOZILMAYDI. Metrikaning
 * yorlig'i, ohangi va "yaxshi yo'nalishi" — biznes qarori va u
 * `activityDashboard.service.js` da turadi. Nusxa frontendda saqlansa,
 * serverdagi ohang o'zgarganda lenta jimgina eskirib qolardi.
 *
 * @param {object} props
 * @param {object} [props.data] - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - xoreografiyaning boshlanishi (ms)
 * @param {string} [props.className]
 */
const MetricStrip = ({ data, isLoading = false, isError = false, delay = 0, className }) => {
  const metrics = data?.metrics ?? [];

  // ⚠️ `delay` — xoreografiyaning BOSHLANISHI, plitkalar orasidagi qadam
  // emas: sahifa lentani boshqa o'ringa qo'ysa, faqat boshlanish nuqtasi
  // suriladi, ketma-ketlik esa tokendagi `metricDelay` da qoladi.
  const tileDelay = (index) =>
    delay ? delay + index * DELAY.metricStep : metricDelay(index);

  // Bo'sh massiv ham plitka bilan chiziladi: lenta ekranning tuzilishini
  // ushlab turadi, aks holda hero ostidagi qator to'satdan yo'qolardi.
  if (isLoading || isError || metrics.length === 0) {
    return (
      <div className={cn(GRID, className)}>
        {Array.from({ length: 6 }, (_, index) => (
          <MetricPlaceholder
            key={index}
            isLoading={isLoading}
            delay={tileDelay(index)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(GRID, className)}>
      {metrics.map((metric, index) => (
        <MetricTile key={metric.key} metric={metric} delay={tileDelay(index)} />
      ))}
    </div>
  );
};

/** To'r — 2 → 3 → 6 ustun. Oltitasi faqat keng ekranda bitta qatorga sig'adi. */
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6";

/**
 * Plitka ichki bo'shlig'i.
 *
 * ⚠️ Chapdan kengroq (`pl-4`): 3px signal relsi kartaning chap qirrasida
 * turadi va matn unga tegib ketmasligi kerak.
 */
const TILE = "py-3.5 pl-4 pr-3.5";

/** Butun sonlarni guruhlash uchun formatter — "12 480". */
// ⚠️ `formatMoney` ISHLATILMAYDI: bu yerda summa emas, DONA (xodim,
// hodisa, bog'lanish) va "so'm" yorlig'i yolg'on bo'lardi. Formatter
// modul darajasida bir marta yaratiladi — `Intl.NumberFormat`
// konstruktori qimmat va u har sanoq kadrida qayta chaqirilsa, count-up
// sekinlashardi.
const wholeFormatter = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 });

/**
 * Ko'rsatkich qiymatini matnga aylantiradi.
 *
 * ⚠️ Foiz NUQTA bilan (`94.3`), dona esa guruhlangan butun son. `uz-UZ`
 * formatter foizga VERGUL qo'yardi va u yonidagi `pct()` yorliqlaridan
 * (`pulse.tokens.js`) farq qilib turardi — bitta ekranda ikki xil kasr
 * ajratgichi.
 *
 * @param {number|null} value
 * @param {number} decimals
 * @returns {string} - bo'sh qiymatda em-dash
 */
const formatMetric = (value, decimals) => {
  if (value == null || !Number.isFinite(value)) return "—";
  return decimals > 0 ? value.toFixed(decimals) : wholeFormatter.format(Math.round(value));
};

/**
 * BITTA PLITKA.
 *
 * ⚠️ Kasr xonasi QAT'IY: foizda bitta, donada nol. Sanoq davomida xona
 * soni o'zgarsa (`9.5` → `94`), raqamning kengligi sakrab turardi.
 */
const MetricTile = ({ metric, delay }) => {
  const { label, value, previous, unit, tone, hint, higherIsBetter } = metric;

  const decimals = unit === "%" ? 1 : 0;
  const counted = useCountUp(Number.isFinite(value) ? value : null, { decimals });

  return (
    <article
      className={cn(SURFACE.card, TILE, MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Signal relsi — bezak emas, ko'rsatkichning ohangi */}
      <span
        aria-hidden="true"
        className={cn(RAIL.base, RAIL.tone[tone] ?? RAIL.tone.neutral)}
      />

      <p className={cn(T.label, "truncate")}>{label}</p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1.5">
        <span className={cn(T.value, T.sizeXl)}>{formatMetric(counted, decimals)}</span>

        {/* ⚠️ Foiz belgisi raqamning DAVOMI, ikkinchi raqam emas: kichik
            va kulrang (T.label bilan bir xil slate-400) bo'lgani uchun
            ko'z avval sonni, keyin birlikni o'qiydi. */}
        {unit === "%" && <span className={cn(T.meta, "text-slate-400")}>%</span>}

        <DeltaChip
          value={value}
          previous={previous}
          unit={unit}
          higherIsBetter={higherIsBetter}
          className="ml-auto"
        />
      </div>

      {/* Izoh — raqamning maxraji ("12 / 40 xodim tizimga kirdi") */}
      <p className={cn(T.meta, "mt-1.5 truncate")}>{hint || "—"}</p>
    </article>
  );
};

/**
 * O'ZGARISH CHIPI — oldingi davrga nisbatan.
 *
 * ⚠️ RANG BAHONI beradi, YO'NALISHNI emas — yo'nalishni ishora (↑/↓)
 * ko'rsatadi. "Yaxshi" tomon ko'rsatkichga bog'liq va uni SERVER aytadi
 * (`higherIsBetter`):
 *
 *   true  — o'sishi yaxshi (qamrov, yangi bog'lanishlar) → ↑ yashil
 *   false — o'sishi YOMON (jim turgan xodimlar) → ↑ QIZIL, ↓ yashil
 *   null  — baholab bo'lmaydi (masalan sof hajm) → doim neytral
 *
 * Uchinchi holat alohida kerak: "ko'p yaxshi, kam yomon" degan qoida
 * har ko'rsatkichga tegishli emas va yo'q joyda yashil rang berish
 * foydalanuvchini noto'g'ri xulosaga olib borardi.
 *
 * ⚠️ Farq FOIZ EMAS, PUNKT (`p`): 40% dan 44% ga o'sish "4 punkt", "10%"
 * emas. Ikkalasi bitta chipda aralashsa, raqam ma'nosini yo'qotardi.
 *
 * ⚠️ `previous == null` → chip UMUMAN chizilmaydi. "0" yozuvi
 * "o'zgarmadi" degan yolg'on ma'noni berardi, holbuki taqqoslash
 * bazasining o'zi yo'q.
 */
const DeltaChip = ({ value, previous, unit, higherIsBetter, className }) => {
  if (!Number.isFinite(value) || !Number.isFinite(previous)) return null;

  const diff = value - previous;
  // Shovqin chegarasi: foizda 0.05 punkt, donada yarim dona — ikkalasi
  // ham "amalda o'zgarmadi" degani.
  const isFlat = Math.abs(diff) < (unit === "%" ? 0.05 : 0.5);
  const isUp = diff > 0;
  const isGood = higherIsBetter ? isUp : !isUp;

  const tone =
    isFlat || higherIsBetter == null
      ? DELTA.flat
      : isGood
        ? DELTA.up
        : DELTA.down;

  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const text = isFlat ? "0" : formatMetric(Math.abs(diff), unit === "%" ? 1 : 0);
  const suffix = unit === "%" ? " p" : "";

  return (
    <span
      className={cn(DELTA.chip, tone, className)}
      // Rangni ajrata olmaydigan ko'z uchun ham, ekran o'qigich uchun ham
      // o'zgarish SO'Z bilan takrorlanadi.
      aria-label={
        isFlat
          ? "Oldingi davrga nisbatan o'zgarmadi"
          : `Oldingi davrga nisbatan ${text}${suffix} ${isUp ? "ko'paydi" : "kamaydi"}`
      }
    >
      <Icon className="size-2.5" strokeWidth={2.6} aria-hidden="true" />
      {text}
      {suffix}
    </span>
  );
};

/**
 * YUKLANISH VA XATO PLITKASI — kontent plitkasi bilan AYNAN bir o'lchamda.
 *
 * ⚠️ Skelet qatorlari kontentning qatorlari balandligiga qo'yilgan
 * (yorliq 16px, raqam 21px, izoh 16px): aks holda ma'lumot kelganda
 * lenta bir necha piksel "sakrab", ostidagi butun to'rni surib
 * qo'yardi.
 *
 * ⚠️ Jimirlash FAQAT yuklanishda. Jimirlash — "kelmoqda" degan va'da;
 * xatoda hech narsa kelmaydi va u yerda tinch em-dash turadi.
 */
const MetricPlaceholder = ({ isLoading, delay }) => {
  const bar = cn("rounded-full bg-slate-100", isLoading && "motion-safe:animate-breathe");

  return (
    <article
      className={cn(SURFACE.card, TILE, MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span aria-hidden="true" className={cn(RAIL.base, RAIL.tone.neutral)} />

      <div className="flex h-4 items-center">
        <span className={cn(bar, "h-2.5 w-16")} />
      </div>

      <div className="mt-2 flex h-[21px] items-center">
        {isLoading ? (
          <span className={cn(bar, "h-4 w-20")} style={{ animationDelay: "160ms" }} />
        ) : (
          <span className={cn(T.value, T.sizeXl, "text-slate-300")}>—</span>
        )}
      </div>

      <div className="mt-1.5 flex h-4 items-center">
        <span className={cn(bar, "h-2.5 w-24")} style={{ animationDelay: "320ms" }} />
      </div>
    </article>
  );
};

export default MetricStrip;
