// React
import { useId } from "react";

// Icons
import { Activity, Link2, TriangleAlert, UserMinus } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useCountUp from "@/shared/hooks/useCountUp";

// Tokens
import { DELAY, HUE, MOTION, SURFACE, T, contentDelay } from "../data/pulse.tokens";

/**
 * PULS HERO — ekranning yagona og'irlik markazi, "HOZIR qanday" savoliga javob.
 *
 * ⚠️ HERO FAQAT BUGUNGI KUNNI KO'RSATADI, davrni emas. Sahifadagi qolgan
 * hamma narsa (`metrics`, `trend`, `hourly`, `weekday`) tanlangan davr —
 * 7/14/30/90 kun — bo'yicha hisoblanadi. Agar hero ham davrni ko'rsatsa,
 * u pastdagi bloklarning kattalashtirilgan nusxasi bo'lib qolardi va
 * "jonli signal" janri (`pulse.tokens.js` sarlavhasi) yo'qolardi: puls
 * o'tgan oyni emas, shu daqiqadagi holatni bildiradi.
 *
 * ⚠️ IKKITA MUSTAQIL HALQA, BITTA "UMUMIY FAOLLIK BALLI" EMAS. Bot
 * qamrovi va xodimlar faolligi — ikki xil AUDITORIYA va ikki xil QAROR:
 * birinchisi past bo'lsa ota-onalar bilan ishlanadi, ikkinchisi past
 * bo'lsa xodimlar bilan. Ularni bitta songa qo'shish "70%" beradi-yu,
 * qaysi tomonda muammo borligini yashirardi.
 *
 * ⚠️ HALQA — FOIZ uchun. Ikkala qiymat ham 0..100 va bir xil o'lchov
 * birligida, shu sababli bir xil shaklda chiziladi; ichidagi
 * `aktiv / jami` esa foizning MAXRAJINI ochib beradi — 3 xodimdan 2 tasi
 * ham 67%, 300 tadan 200 tasi ham 67%, lekin bu ikki boshqa vaziyat.
 *
 * ⚠️ `collecting` IZOHI MAJBURIY. Tarix hali yig'ilayotgan maktabda
 * halqalar tabiiy ravishda past chiqadi. Izohsiz bu "falokat" bo'lib
 * o'qilardi va birinchi ko'rgan odam noto'g'ri xulosa chiqarardi.
 *
 * ⚠️ Sana MATNI serverdan tayyor keladi (`today.label`, `sinceLabel`) —
 * bu yerda hech qanday sana yig'ilmaydi (`.claude/rules/dates.md`).
 *
 * @param {object} props
 * @param {object} [props.data] - `GET /activity/overview` javobining `data` qismi
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay] - kirish animatsiyasi kechikishi (ms)
 * @param {string} [props.className]
 */

/**
 * Halqa geometriyasi. Ikkalasi bir xil o'lchamda: turli radius "biri
 * muhimroq" degan ma'no berardi, aslida ikkalasi teng huquqli.
 */
const BOX = 136;
const RADIUS = 57;
const STROKE = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** 0..100 oralig'iga qamab, sonligiga ishonch hosil qiladi. */
const toRate = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
};

const PulseHero = ({ data, isLoading = false, isError = false, delay = DELAY.hero, className }) => {
  const today = data?.today;
  const collecting = data?.collecting === true;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-5 sm:px-6", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Fon qatlamlari — bezak, kontent emas: ikkalasi `pointer-events-none` */}
      <div className={SURFACE.heroGlow} aria-hidden="true" />
      <div className={SURFACE.heroGlowAlt} aria-hidden="true" />

      <div className="relative">
        {isError ? (
          <HeroError />
        ) : isLoading ? (
          <HeroSkeleton />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
            {/* ── Chap: qaysi kun va "hozir" belgisi ─────────────────── */}
            <div
              className={cn("min-w-0 lg:w-[180px] lg:shrink-0", MOTION.enterUp)}
              style={{ animationDelay: `${contentDelay(delay, 0)}ms` }}
            >
              <p className={T.labelDark}>Bugun</p>

              <p className={cn(T.valueHero, T.sizeLg, "mt-1.5")}>
                {today?.label ?? "—"}
              </p>

              {/* ⚠️ Ekrandagi YAGONA doimiy harakat. Ikkinchi nafas
                  oluvchi element qo'shilsa, ular raqobatlashib "reklama
                  banneri" ta'sirini berardi (`pulse.tokens.js` §3) */}
              <span className="mt-3 inline-flex items-center gap-2">
                <span className={MOTION.liveDot}>
                  <span className={MOTION.liveRing} aria-hidden="true" />
                  <span className={cn(MOTION.liveCore, "relative")} />
                </span>
                <span className={T.labelDark}>jonli</span>
              </span>
            </div>

            {/* ── Markaz: ikkita halqa ───────────────────────────────── */}
            {/* ⚠️ Mobilda ustma-ust EMAS, yonma-yon kichrayadi: ikki
                halqaning butun ma'nosi ularni TAQQOSLASHDA, ustma-ust
                qo'yilsa taqqoslash uchun ko'zni yurgizish kerak bo'lardi */}
            <div className="flex flex-1 items-start justify-center gap-4 sm:gap-8">
              <Ring
                label="Bot qamrovi"
                rate={today?.bot?.rate}
                active={today?.bot?.active}
                total={today?.bot?.total}
                hue={HUE.bot}
                hueSoft={HUE.botSoft}
                delay={contentDelay(delay, 1)}
              />
              <Ring
                label="Xodimlar faolligi"
                rate={today?.panel?.rate}
                active={today?.panel?.active}
                total={today?.panel?.total}
                hue={HUE.panel}
                hueSoft={HUE.panelSoft}
                delay={contentDelay(delay, 2)}
              />
            </div>

            {/* ── O'ng: uchta fakt ───────────────────────────────────── */}
            {/* Mobilda pastga tushadi va uch ustunga yoyiladi */}
            <div className="grid grid-cols-3 gap-2 lg:w-[196px] lg:shrink-0 lg:grid-cols-1">
              <Tile
                icon={Activity}
                label="Bugungi harakatlar"
                value={today?.events}
                delay={contentDelay(delay, 3)}
              />
              <Tile
                icon={Link2}
                label="Bog'langan hisoblar"
                value={data?.parents?.linked}
                delay={contentDelay(delay, 4)}
              />
              <Tile
                icon={UserMinus}
                label="Jim turgan xodimlar"
                value={data?.staff?.silentTotal}
                tone="warn"
                delay={contentDelay(delay, 5)}
              />
            </div>
          </div>
        )}

        {/* ── Tarix yig'ilmoqda ────────────────────────────────────── */}
        {!isLoading && !isError && collecting && (
          <p
            className={cn(T.metaDark, "mt-5 border-t border-white/[0.07] pt-3", MOTION.enterUp)}
            style={{ animationDelay: `${contentDelay(delay, 6)}ms` }}
          >
            Ma'lumot yig'ilmoqda — faollik tarixi {data?.sinceLabel ?? "—"} dan
            boshlab yozilmoqda
          </p>
        )}
      </div>
    </section>
  );
};

/**
 * BITTA HALQA — foiz, uning maxraji va nomi.
 *
 * ⚠️ Gradient `id` si `useId` bilan olinadi: sahifada ikkita halqa bor
 * va `id` takrorlansa brauzer BIRINCHISINI ikkalasiga qo'llab, sky halqa
 * ham violet bo'lib chiqardi.
 *
 * ⚠️ Qiymat 0 bo'lsa halqa bo'sh chiziladi, lekin blok baribir turadi:
 * "bugun hech kim kirmadi" — bu ham javob, yo'qolgan blok esa emas.
 */
const Ring = ({ label, rate, active, total, hue, hueSoft, delay }) => {
  const gradientId = useId();

  const value = toRate(rate);
  // ⚠️ Kasr xonasi qiymatga qarab tanlanadi: "67%" va "66.7%" ikkalasi
  // ham to'g'ri, lekin butun songa ".0" qo'shilsa aniqlik YOLG'ON
  // ko'rinardi — server yaxlitlangan foiz yuborishi mumkin.
  const decimals = Number.isInteger(value) ? 0 : 1;
  const counted = useCountUp(value, { duration: 1200, decimals });
  const shown = (counted ?? 0).toFixed(decimals);

  const offset = CIRCUMFERENCE * (1 - value / 100);

  // ⚠️ Ekran o'quvchisi uchun YAKUNIY qiymat, `shown` emas: `shown`
  // sanoq davomida har kadrda o'zgaradi va yordamchi texnologiya
  // o'tkinchi raqamni o'qib qolishi mumkin edi.
  const ariaLabel = `${label}: ${value.toFixed(decimals)}%`;

  return (
    <div className="flex w-[118px] shrink-0 flex-col items-center sm:w-[136px]">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${BOX} ${BOX}`}
          className="h-auto w-full -rotate-90"
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={hueSoft} />
              <stop offset="100%" stopColor={hue} />
            </linearGradient>
          </defs>

          {/* Rels — to'liq aylana, halqaning "sig'imi" */}
          <circle
            cx={BOX / 2}
            cy={BOX / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={STROKE}
          />

          {/* To'lgan yoy. Boshlanish/tugash `--ring-from`/`--ring-to` dan
              keladi: har foiz uchun boshqa qiymat, keyframe'ga qattiq
              raqam yozib bo'lmaydi.

              ⚠️ `strokeDashoffset` inline ham qo'yiladi — bu ZAXIRA, bezak
              emas: `motion-safe:` tufayli `prefers-reduced-motion` da
              animatsiya UMUMAN ishlamaydi va offset 0 bo'lib qolib, har
              halqa TO'LIQ (100%) chizilardi. CSS kaskadida animatsiya
              inline uslubdan yuqori turadi, shuning uchun harakat yoqilgan
              muhitda bu qiymat animatsiyaga xalaqit qilmaydi. */}
          <circle
            cx={BOX / 2}
            cy={BOX / 2}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="motion-safe:animate-ring-fill"
            style={{
              "--ring-from": CIRCUMFERENCE,
              "--ring-to": offset,
              strokeDashoffset: offset,
              animationDelay: `${delay}ms`,
            }}
          />
        </svg>

        {/* ⚠️ Raqam SVG ICHIDA emas, ustidagi qatlamda: SVG `-rotate-90`
            bilan burilgan va ichidagi matn ham yonboshlab qolardi */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(T.valueHero, T.size3xl)}>
            {shown}
            <span className={cn(T.valueHero, T.sizeMd, "ml-0.5")}>%</span>
          </span>

          <span className={cn(T.metaDark, "mt-1.5 tabular-nums")}>
            {active ?? 0} / {total ?? 0}
          </span>
        </div>
      </div>

      <p className={cn(T.labelDark, "mt-2 text-center")}>{label}</p>
    </div>
  );
};

/** Ichki plitka — bitta fakt: ikonka, yorliq va son. */
const Tile = ({ icon: Icon, label, value, tone = "neutral", delay }) => {
  const numeric = Number(value);
  const counted = useCountUp(Number.isFinite(numeric) ? numeric : null, { duration: 1100 });

  return (
    <div
      className={cn(SURFACE.tileDark, "flex items-center gap-2.5 px-3 py-2.5", MOTION.enterUp)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ⚠️ "Jim turganlar" plitkasi sariq ikonka oladi, lekin RANG
          YAGONA BELGI EMAS — yorliqning o'zi ("Jim turgan xodimlar") va
          soni ma'noni rangsiz ham to'liq beradi */}
      <Icon
        className={cn(
          "size-3.5 shrink-0",
          tone === "warn" && numeric > 0 ? "text-amber-300" : "text-white/35",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />

      <div className="min-w-0">
        <p className={cn(T.labelDark, "truncate")}>{label}</p>
        <p className={cn(T.valueHero, T.sizeLg, "mt-1")}>
          {counted == null ? "—" : counted.toLocaleString("uz-UZ")}
        </p>
      </div>
    </div>
  );
};

/**
 * YUKLANISH — heroning SHAKLI saqlanadi.
 *
 * ⚠️ Halqalar bo'sh doira sifatida emas, to'liq doira sifatida
 * chiziladi: nol uzunlikdagi yoy "0%" degan YOLG'ON ma'noni berardi.
 */
const HeroSkeleton = () => (
  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
    <div className="space-y-2.5 lg:w-[180px] lg:shrink-0">
      <div className="h-2.5 w-16 rounded-full bg-white/10 motion-safe:animate-breathe" />
      <div className="h-4 w-32 rounded-lg bg-white/10 motion-safe:animate-breathe" />
      <div className="h-2.5 w-12 rounded-full bg-white/10 motion-safe:animate-breathe" />
    </div>

    <div className="flex flex-1 items-start justify-center gap-4 sm:gap-8">
      {[0, 1].map((index) => (
        <div key={index} className="flex w-[118px] shrink-0 flex-col items-center sm:w-[136px]">
          <div
            className="aspect-square w-full rounded-full bg-white/10 motion-safe:animate-breathe"
            style={{ animationDelay: `${index * 160}ms` }}
          />
          <div className="mt-2 h-2.5 w-20 rounded-full bg-white/10 motion-safe:animate-breathe" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-2 lg:w-[196px] lg:shrink-0 lg:grid-cols-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[52px] rounded-2xl bg-white/10 motion-safe:animate-breathe"
          style={{ animationDelay: `${index * 130}ms` }}
        />
      ))}
    </div>
  </div>
);

/** Xato — hero balandligini saqlab, bitta jumla bilan. */
const HeroError = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
    <TriangleAlert className="size-5 text-white/35" strokeWidth={1.8} aria-hidden="true" />
    <p className={T.metaDark}>Bugungi faollikni yuklab bo'lmadi</p>
  </div>
);

export default PulseHero;
