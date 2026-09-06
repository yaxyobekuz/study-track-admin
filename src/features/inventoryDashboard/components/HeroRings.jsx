// React
import { useId } from "react";

// Icons
import { Boxes, Layers, MapPin, Wrench } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Hooks
import useCountUp from "../hooks/useCountUp";

// Tokens
import { DELAY, HUE, MOTION, SURFACE, T } from "../data/atlas.tokens";

// Components
import Delta from "./Delta";

/**
 * UCHTA KONSENTRIK HALQA — bo'limning yagona og'irlik markazi.
 *
 * ⚠️ NIMA UCHUN UCHTA HALQA, BITTA "UMUMIY BALL" EMAS. Kompozit ball
 * (masalan "baza sog'lig'i 82") tushuntirib bo'lmaydigan raqam: uning
 * maxraji yo'q, og'irliklari ixtiyoriy va ikki xil sababdan pasaygan
 * ikki maktab bir xil ball oladi. Uchta MUSTAQIL o'lchov esa har biri
 * o'z manbasiga ega va har biri boshqa QARORGA olib boradi:
 *
 *   Baza holati       → ta'mirlash / almashtirish byudjeti
 *   Monitoring intizomi → mas'ul shaxslar bilan ish
 *   Undiruv darajasi  → kassir va aybdorlar bilan ish
 *
 * ⚠️ HALQA — FOIZ uchun, absolyut son uchun emas. Uchalasi ham 0..100
 * oralig'ida va bir xil o'lchov birligida; shu sababli ularni bitta
 * shaklda ko'rsatish mumkin. Pul summasi halqaga solinsa, uning
 * "to'liq aylanasi" nima ekani noma'lum bo'lardi.
 *
 * ⚠️ To'liq aylana = 100%. Halqa YUQORIDAN boshlanadi (`-rotate-90`) va
 * soat yo'nalishida to'ladi — soat naqshi, o'rganish talab qilmaydi.
 */

/** Halqa geometriyasi — tashqaridan ichkariga. */
const RINGS = [
  { key: "health", radius: 76, hue: HUE.baseSoft, hueEnd: HUE.base, label: "Baza holati" },
  { key: "discipline", radius: 57, hue: HUE.monitorSoft, hueEnd: HUE.monitor, label: "Monitoring intizomi" },
  { key: "recovery", radius: 38, hue: HUE.recoverySoft, hueEnd: HUE.recovery, label: "Undiruv darajasi" },
];

const STROKE = 13;
const BOX = 180;

/** Halqaning "yaxshi yo'nalishi" — uchalasi ham o'sishi kerak. */
const GOOD_WHEN = "up";

const HeroRings = ({ data, isLoading, monthLabel, updatedAt }) => {
  const gradientId = useId();

  const rings = data?.rings;
  const base = data?.base;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-5 sm:px-6")}
      style={{ animationDelay: `${DELAY.hero}ms` }}
    >
      {/* Fon qatlamlari — nur, nur va yaltirash. Uchalasi ham
          `pointer-events-none`: ular bezak, kontent emas */}
      <div className={SURFACE.heroGlow} aria-hidden />
      <div className={SURFACE.heroGlowAlt} aria-hidden />
      <div className={SURFACE.heroSheen} aria-hidden />

      <div className="relative">
        {/* ── Sarlavha qatori ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={T.labelDark}>Moddiy-texnik baza</p>
            <h2 className="mt-1 text-[15px] font-semibold leading-none tracking-[-0.01em] text-white">
              {monthLabel ?? "—"}
            </h2>
          </div>

          {updatedAt && <LiveBadge />}
        </div>

        {/* ── Halqalar + ko'rsatkichlar ───────────────────────────── */}
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <RingStack
            gradientId={gradientId}
            rings={rings}
            isLoading={isLoading}
          />

          <div className="min-w-0 flex-1">
            {/* Asosiy raqam — bazaning pul qiymati */}
            <BaseValue value={base?.baseValue} kpi={data?.kpi?.baseValue} isLoading={isLoading} />

            {/* Uchta halqaning afsonasi — rang, nom, foiz, o'zgarish */}
            <div className="mt-4 space-y-2">
              {RINGS.map((ring, index) => (
                <RingLegend
                  key={ring.key}
                  ring={ring}
                  metric={rings?.[ring.key]}
                  isLoading={isLoading}
                  delay={DELAY.hero + DELAY.content + index * 90}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Baza tarkibi — to'rtta faktik son ───────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FactTile
            icon={Boxes}
            label="Jihozlar"
            value={base?.totalQuantity}
            suffix="dona"
            isLoading={isLoading}
            delay={0}
          />
          <FactTile
            icon={Wrench}
            label="Yaroqsiz"
            value={base?.brokenQuantity}
            suffix="dona"
            tone={base?.brokenQuantity > 0 ? "warn" : "ok"}
            isLoading={isLoading}
            delay={70}
          />
          <FactTile
            icon={MapPin}
            label="Xonalar"
            value={base?.locationCount}
            suffix="ta"
            isLoading={isLoading}
            delay={140}
          />
          <FactTile
            icon={Layers}
            label="Turlari"
            value={base?.itemCount}
            suffix="ta"
            isLoading={isLoading}
            delay={210}
          />
        </div>
      </div>
    </section>
  );
};

/**
 * HALQALAR TO'PLAMI — bitta SVG, uchta yoy.
 *
 * ⚠️ Har halqa uchun ALOHIDA gradient: `useId` bilan yagona prefiks
 * olinadi, chunki bitta sahifada bir nechta SVG gradienti bo'lsa va
 * `id` lar takrorlansa, brauzer BIRINCHISINI hammasiga qo'llaydi —
 * uchala halqa bir rangda chiqib qolardi.
 */
const RingStack = ({ gradientId, rings, isLoading }) => (
  <div className="relative mx-auto shrink-0 lg:mx-0">
    <svg
      width={BOX}
      height={BOX}
      viewBox={`0 0 ${BOX} ${BOX}`}
      className="-rotate-90"
      role="img"
      aria-label="Uchta ko'rsatkich: baza holati, monitoring intizomi, undiruv darajasi"
    >
      <defs>
        {RINGS.map((ring) => (
          <linearGradient
            key={ring.key}
            id={`${gradientId}-${ring.key}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={ring.hue} />
            <stop offset="100%" stopColor={ring.hueEnd} />
          </linearGradient>
        ))}
      </defs>

      {RINGS.map((ring, index) => {
        const circumference = 2 * Math.PI * ring.radius;
        const value = Math.max(0, Math.min(100, Number(rings?.[ring.key]?.value ?? 0)));
        const offset = circumference * (1 - value / 100);

        return (
          <g key={ring.key}>
            {/* Rels — to'liq aylana, halqaning "sig'imi" */}
            <circle
              cx={BOX / 2}
              cy={BOX / 2}
              r={ring.radius}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={STROKE}
            />

            {/* To'lgan yoy. Yuklanayotganda chizilmaydi: nol uzunlikdagi
                yoy "0%" degan yolg'on ma'noni berardi */}
            {!isLoading && (
              <circle
                cx={BOX / 2}
                cy={BOX / 2}
                r={ring.radius}
                fill="none"
                stroke={`url(#${gradientId}-${ring.key})`}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={circumference}
                className={MOTION.ring}
                style={{
                  "--ring-from": circumference,
                  "--ring-to": offset,
                  animationDelay: `${DELAY.hero + DELAY.content + index * 130}ms`,
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  </div>
);

/** Bazaning pul qiymati — heroning eng katta raqami. */
const BaseValue = ({ value, kpi, isLoading }) => {
  const numeric = Number(value ?? 0);
  const counted = useCountUp(numeric, {
    delay: DELAY.hero + DELAY.content,
    duration: 1300,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-2.5 w-28 rounded-full bg-white/10 motion-safe:animate-breathe" />
        <div className="h-7 w-52 rounded-lg bg-white/10 motion-safe:animate-breathe" />
      </div>
    );
  }

  return (
    <div>
      <p className={T.labelDark}>Bazaning qiymati</p>

      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
        <span className={cn(T.valueHero, T.size2xl)}>
          {formatMoney(counted, { withLabel: false })}
        </span>
        <span className="text-[12px] font-medium text-white/45">so'm</span>

        <Delta value={kpi?.change} unit="percent" goodWhen="up" dark />
      </div>
    </div>
  );
};

/**
 * HALQANING AFSONASI — bitta qator: rang, nom, foiz va o'zgarish.
 *
 * ⚠️ Foiz halqaning O'ZIDA yozilmaydi (uchta raqam kichkina doiraning
 * ichiga sig'masdi), afsonada esa u nom bilan yonma-yon turadi va
 * "qaysi halqa qaysi raqam" savoli tug'ilmaydi — rang ikkalasini
 * bog'laydi.
 */
const RingLegend = ({ ring, metric, isLoading, delay }) => {
  const value = Number(metric?.value ?? 0);
  const counted = useCountUp(value, { delay, duration: 1000, decimals: 1 });
  const change =
    metric?.previous == null ? null : Number((value - metric.previous).toFixed(1));

  if (isLoading) {
    return <div className="h-6 rounded-lg bg-white/[0.06] motion-safe:animate-breathe" />;
  }

  return (
    <div
      className={cn(
        SURFACE.tileDark,
        "flex items-center gap-2.5 px-3 py-2",
        MOTION.enterX,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: `linear-gradient(135deg, ${ring.hue}, ${ring.hueEnd})` }}
        aria-hidden
      />

      <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-white/70">
        {ring.label}
      </span>

      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-white">
        {counted.toFixed(1)}%
      </span>

      {/* ⚠️ Qat'iy kenglik + `justify-end`: chip bo'lmagan qatorda ham
          foizlar bir vertikalda turadi. `text-right` yolg'iz yetmasdi —
          chip `inline-flex` va u qator baseline'iga emas, o'z
          qutisiga tekislanadi. */}
      <span className="flex w-[58px] shrink-0 items-center justify-end">
        <Delta value={change} unit="point" goodWhen={GOOD_WHEN} dark />
      </span>
    </div>
  );
};

/** Baza tarkibi plitkasi — ikonka, yorliq va son. */
const FactTile = ({ icon: Icon, label, value, suffix, tone = "ok", isLoading, delay }) => {
  const counted = useCountUp(Number(value ?? 0), {
    delay: DELAY.hero + DELAY.content + 260 + delay,
    duration: 1100,
  });

  return (
    <div
      className={cn(SURFACE.tileDark, "flex items-center gap-2.5 px-3 py-2.5", MOTION.enter)}
      style={{ animationDelay: `${DELAY.hero + DELAY.content + 220 + delay}ms` }}
    >
      <Icon
        className={cn("size-3.5 shrink-0", tone === "warn" ? "text-amber-300" : "text-white/35")}
        strokeWidth={2}
      />

      <div className="min-w-0">
        <p className={cn(T.labelDark, "truncate")}>{label}</p>
        <p className="mt-0.5 text-[14px] font-semibold leading-none tabular-nums text-white">
          {isLoading ? "—" : counted.toLocaleString("uz-UZ")}
          <span className="ml-1 text-[10px] font-medium text-white/40">{suffix}</span>
        </p>
      </div>
    </div>
  );
};

/**
 * JONLI INDIKATORI — ma'lumot HAQIQATAN yangi kelganini bildiradi.
 *
 * ⚠️ Qotib qolgan "Jonli" yozuvi yolg'on bo'lardi: belgi faqat
 * `dataUpdatedAt` bo'lganda chiziladi (ta'lim dashboardidagi bilan bir
 * xil qoida). Nuqta atrofidagi halqa NAFAS oladi — `ping` emas: ping
 * "ogohlantirish" ni bildiradi va bu yerda ogohlantiradigan narsa yo'q.
 */
const LiveBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1">
    <span className="relative flex size-1.5">
      <span className={MOTION.liveRing} aria-hidden />
      <span className={cn(MOTION.liveDot, "relative")} />
    </span>
    <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/55">
      Jonli
    </span>
  </span>
);

export default HeroRings;
