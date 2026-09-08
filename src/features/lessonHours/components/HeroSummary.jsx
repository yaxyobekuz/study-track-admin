// Icons
import { Coins, Repeat2, Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Hooks
import { useCountUp } from "@/shared/hooks/useCountUp";

// Data & tokens
import { DELAY, MOTION, SURFACE, T, metricDelay } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * REGISTR SARLAVHASI — ekranning ohangini beruvchi to'q blok.
 *
 * ⚠️ TEKIS TO'Q RANG EMAS, GRADIENT. Bir xil to'q to'rtburchak ekranda
 * "teshik" bo'lib o'qiladi; uch to'xtamli gradient esa chuqurlik beradi.
 * Ustiga ikkita `pointer-events-none` yorug'lik dog'i va bitta sekin
 * `tide` qo'yiladi — bu bo'limdagi UZLUKSIZ HARAKATLARNING BIRINCHISI
 * (ikkinchisi `HoursFlow` dagi bog'lovchilar). Uchinchisi qo'shilmaydi.
 *
 * ⚠️ IKKI RAQAM ATAYLAB YONMA-YON: "hozirgacha hisoblandi" va "oy oxirida
 * chiqadi". Bittasi ko'rsatilsa, boshliq oy o'rtasida past raqamni ko'rib
 * "byudjet yetadi" deb o'ylardi, oxirida esa to'liq summa chiqardi.
 *
 * ⚠️ PUL SANALMAYDI (`useCountUp` faqat butun sonlarga): summa serverdan
 * 2 xonali STRING bo'lib keladi va uni raqamga aylantirib animatsiya
 * qilish katta summalarda aniqlikni yo'qotardi.
 */
const HeroSummary = ({ data, isLoading, monthLabel }) => {
  const totals = data?.totals;

  // ⚠️ FAQAT SOAT SANALADI, pul EMAS: summa serverdan 2 xonali STRING
  // bo'lib keladi va uni `Number` ga aylantirib animatsiya qilish katta
  // summalarda aniqlikni yo'qotardi (`formatMoney` izohi).
  const hours = useCountUp(totals?.totalHours ?? 0);
  const taught = useCountUp(totals?.taughtHours ?? 0, { duration: 1100 });

  const isLive = data?.isCurrentMonth;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-6 xs:px-7 xs:py-7")}
      style={{ animationDelay: `${DELAY.header}ms` }}
    >
      {/* Yorug'lik qatlamlari — kontentga tegmaydi */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(120%_140%_at_88%_-10%,rgba(99,102,241,0.28),transparent_58%)," +
            "radial-gradient(90%_120%_at_-5%_110%,rgba(16,185,129,0.16),transparent_60%)]",
          MOTION.tide,
        )}
      />

      <div className="relative">
        {/* ── Sarlavha qatori ──────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={T.labelDark}>Dars soati va maosh</span>
              {isLive && (
                <span className="flex items-center gap-1.5">
                  <span className={MOTION.liveDot}>
                    <span className={MOTION.liveRing} />
                    <span className={MOTION.liveCore} />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-emerald-300/90">
                    Jonli
                  </span>
                </span>
              )}
            </div>

            <h1 className={cn(T.valueHero, T.size2xl, "mt-2")}>{monthLabel}</h1>

            <p className={cn(T.metaDark, "mt-2 max-w-[46ch] leading-relaxed")}>
              {isLive
                ? "Raqamlar dars jadvalidan jonli hisoblanmoqda. Oy yakunlanganda ular oylik majburiyatiga muhrlanadi."
                : "Oy yakunlangan — raqamlar shu davrdagi jadval va o'rinbosarlik asosida."}
            </p>
          </div>

          {/* Soat hisoblagichi — ekranning eng katta raqami */}
          <div className="text-right">
            <p className={T.labelDark}>Jami akademik soat</p>
            <p className={cn(T.valueHero, T.size3xl, "mt-2")}>
              {isLoading ? "—" : formatHourNumber(hours)}
            </p>
            <p className={cn(T.metaDark, "mt-2")}>
              {isLoading ? "—" : `${formatHourNumber(taught)} tasi o'tildi`}
            </p>
          </div>
        </div>

        {/* ── O'tilgan ulush chizig'i ──────────────────────────── */}
        <ProgressLine
          taught={totals?.taughtHours ?? 0}
          total={totals?.totalHours ?? 0}
          isLoading={isLoading}
        />

        {/* ── Ko'rsatkichlar ───────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <HeroTile
            index={0}
            icon={Coins}
            label="Hozirgacha hisoblandi"
            value={formatMoney(totals?.accruedAmount)}
            hint="o'tilgan soat bo'yicha"
            isLoading={isLoading}
          />
          <HeroTile
            index={1}
            icon={Coins}
            label="Oy oxirida"
            value={formatMoney(totals?.projectedAmount)}
            hint="jadval o'zgarmasa"
            isLoading={isLoading}
            emphasis
          />
          <HeroTile
            index={2}
            icon={Users}
            label="Soatbay xodimlar"
            value={
              totals ? `${totals.hourlyStaffCount} / ${totals.staffCount}` : "—"
            }
            hint="jami oylik oluvchidan"
            isLoading={isLoading}
          />
          <HeroTile
            index={3}
            icon={Repeat2}
            label="O'rinbosarlik"
            value={totals ? String(totals.substitutionCount) : "—"}
            hint={
              totals?.ongoingSubstitutions
                ? `${totals.ongoingSubstitutions} tasi bugun amalda`
                : "shu oyda"
            }
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  );
};

/**
 * O'TILGAN ULUSH — bitta ingichka chiziq.
 *
 * ⚠️ `width` EMAS, `scaleX`. Kenglikni animatsiya qilish har kadrda
 * layout hisoblatadi; `transform` esa kompozit qatlamda qoladi
 * (`tailwind.config.js` dagi izoh: animatsiya layout'ga tegmasligi kerak).
 */
const ProgressLine = ({ taught, total, isLoading }) => {
  const ratio = total > 0 ? Math.min(1, taught / total) : 0;

  return (
    <div className="mt-6">
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full bg-emerald-400/90", MOTION.bar)}
          style={{
            transform: `scaleX(${isLoading ? 0 : ratio})`,
            transformOrigin: "left",
            animationDelay: `${DELAY.hero + 150}ms`,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={T.metaDark}>Oy boshi</span>
        <span className="text-[10.5px] font-semibold tabular-nums text-emerald-300/90">
          {isLoading ? "—" : `${Math.round(ratio * 100)}%`}
        </span>
        <span className={T.metaDark}>Oy oxiri</span>
      </div>
    </div>
  );
};

const HeroTile = ({ icon: Icon, label, value, hint, isLoading, index, emphasis }) => (
  <div
    className={cn(
      SURFACE.heroTile,
      MOTION.enter,
      emphasis && "bg-white/[0.085]",
    )}
    style={{ animationDelay: `${metricDelay(index)}ms` }}
  >
    <div className="flex items-center gap-1.5">
      <Icon className="size-3 text-white/35" strokeWidth={2} />
      <span className={T.labelDark}>{label}</span>
    </div>
    <p className={cn(T.valueHero, T.sizeLg, "mt-2 truncate")}>
      {isLoading ? "—" : value}
    </p>
    {hint && <p className={cn(T.metaDark, "mt-1.5 truncate")}>{hint}</p>}
  </div>
);

export default HeroSummary;
