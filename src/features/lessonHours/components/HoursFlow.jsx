// React
import { useId } from "react";

// Icons
import { CalendarRange, Coins, GitBranch } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import Panel from "./Panel";

// Data & tokens
import { HUE, MOTION, SURFACE, T } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * SOAT QANDAY PULGA AYLANADI — uch bosqichli oqim sxemasi.
 *
 * Bu ekrandagi YAGONA tushuntiruvchi diagramma va u bitta savolga javob
 * beradi: "vedomostdagi raqam qayerdan chiqdi?". Javob zanjiri:
 *
 *     dars jadvali  →  o'rinbosarlik tuzatmasi  →  o'tilgan soat  →  maosh
 *
 * ⚠️ IKKI QATLAM: MATN HTML'DA, BOG'LOVCHILAR SVG'DA. Klassik Sankey
 * avval sinab ko'rilgan va tashlangan: yorliqlar gradient dog' ustida
 * "stikerdek" suzib qolardi va uzun ism sig'masdi. HTML kartalar esa
 * brauzerning o'z matn joylashtirishini oladi (o'rash, qisqartirish),
 * SVG esa faqat chiziq chizadi — har biri o'z ishini qiladi.
 *
 * ⚠️ BOG'LOVCHILAR HARAKATLANADI (`flow-dash`) — bu bo'limdagi ikkinchi
 * va OXIRGI uzluksiz harakat (birinchisi hero'dagi `tide`). Uchinchisi
 * qo'shilsa, ekran "reklama banneri" bo'lib qolardi. Harakat
 * `stroke-dashoffset` orqali — sof bo'yash, layout'ga tegmaydi.
 *
 * ⚠️ TUZATMA IKKI YO'NALISHLI. "Berildi" va "olindi" bitta raqamga
 * qo'shilmaydi: nol farq "hech narsa bo'lmadi" degani emas — 12 soat
 * berib, 12 soat olgan o'qituvchi butunlay boshqa oy yashagan.
 */
const HoursFlow = ({ data, isLoading, isError, delay = 0 }) => {
  const gradientId = useId();
  const totals = data?.totals;

  const scheduled =
    (totals?.totalHours ?? 0) - (totals?.substitutedHours ?? 0);
  const covered = totals?.substitutedHours ?? 0;
  const net = totals?.totalHours ?? 0;

  return (
    <Panel
      title="Soat qanday pulga aylanadi"
      hint="Jadvaldan vedomostgacha bo'lgan yo'l"
      icon={GitBranch}
      tone="accrued"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !totals}
    >
      <div className="relative mt-1">
        {/* ── Bog'lovchilar (orqa qatlam) ─────────────────────── */}
        <svg
          viewBox="0 0 100 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        >
          <defs>
            <linearGradient id={`${gradientId}-ribbon`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={HUE.lineSoft} stopOpacity="0.15" />
              <stop offset="100%" stopColor={HUE.line} stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Jadval → O'tilgan soat */}
          <path
            d="M32,34 C42,34 44,60 52,60"
            fill="none"
            stroke={`url(#${gradientId}-ribbon)`}
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M32,34 C42,34 44,60 52,60"
            fill="none"
            stroke={HUE.line}
            strokeWidth="1.4"
            strokeDasharray="4 10"
            strokeLinecap="round"
            opacity="0.55"
            vectorEffect="non-scaling-stroke"
            className={MOTION.flow}
          />

          {/* O'rinbosarlik → O'tilgan soat */}
          <path
            d="M32,88 C42,88 44,62 52,62"
            fill="none"
            stroke={HUE.substituted}
            strokeWidth="1.4"
            strokeDasharray="4 10"
            strokeLinecap="round"
            opacity="0.45"
            vectorEffect="non-scaling-stroke"
            className={MOTION.flow}
          />

          {/* O'tilgan soat → Maosh */}
          <path
            d="M74,60 C82,60 84,60 92,60"
            fill="none"
            stroke={HUE.settled}
            strokeWidth="1.6"
            strokeDasharray="4 10"
            strokeLinecap="round"
            opacity="0.55"
            vectorEffect="non-scaling-stroke"
            className={MOTION.flow}
          />
        </svg>

        {/* ── Bosqichlar (old qatlam) ─────────────────────────── */}
        <div className="relative grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          {/* Chap ustun: ikki manba */}
          <div className="space-y-2.5">
            <SourceCard
              icon={CalendarRange}
              label="Dars jadvali"
              value={formatHourNumber(scheduled)}
              hint="o'z darslari"
              tone="planned"
            />
            <SourceCard
              icon={GitBranch}
              label="O'rinbosarlik"
              value={covered > 0 ? `+${formatHourNumber(covered)}` : "0"}
              hint={
                covered > 0
                  ? "boshqa o'qituvchi o'rniga"
                  : "shu oyda ko'chirilmagan"
              }
              tone="given"
            />
          </div>

          {/* O'rta: YAKUNIY soat — butun oyning rejasi.
              ⚠️ Sarlavha "O'tilgan soat" EMAS: `totals.totalHours` — butun
              oy (`scheduled − out + in`), `taughtHours` esa faqat
              bugungacha. Ikkalasi bitta yorliq ostida turgani ekranning
              o'zini o'ziga zid qilardi ("420 o'tilgan / 70 tasi bugungacha"). */}
          <div className="flex justify-center">
            <div className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-center shadow-[0_10px_28px_-16px_rgba(15,23,42,0.55)] md:w-[132px]">
              <p className={T.labelDark}>Oylik soat</p>
              <p className={cn(T.valueHero, T.size2xl, "mt-2")}>
                {formatHourNumber(net)}
              </p>
              <p className={cn(T.metaDark, "mt-2")}>
                {totals?.taughtHours != null
                  ? `${formatHourNumber(totals.taughtHours)} tasi bugungacha`
                  : "—"}
              </p>
            </div>
          </div>

          {/* O'ng: pul */}
          <div className="space-y-2.5">
            <SourceCard
              icon={Coins}
              label="Oy oxirida"
              value={formatMoney(totals?.projectedAmount)}
              hint="jonli prognoz"
              tone="accrued"
              wide
            />
            <SourceCard
              icon={Coins}
              label="Muhrlangan"
              value={formatMoney(totals?.sealedAmount)}
              hint={
                totals?.sealedCount
                  ? `${totals.sealedCount} ta majburiyat`
                  : "hali shakllantirilmagan"
              }
              tone="sealed"
              wide
            />
          </div>
        </div>

        {/* Izoh — sxema o'zi aytolmaydigan yagona narsa */}
        <p className={cn(T.hint, "mt-4 leading-relaxed")}>
          Prognoz — bugungi jadval bo'yicha hisob. Majburiyat esa oy
          yakunlanganda muhrlanadi va undan keyin o'zgarmaydi: to'g'rilash
          kerak bo'lsa, u bekor qilinib qayta shakllantiriladi.
        </p>
      </div>
    </Panel>
  );
};

const TONE_ICON = {
  planned: "bg-slate-100 text-slate-500",
  given: "bg-rose-50 text-rose-600",
  accrued: "bg-amber-50 text-amber-700",
  sealed: "bg-slate-100 text-slate-600",
};

const SourceCard = ({ icon: Icon, label, value, hint, tone, wide }) => (
  <div className={cn(SURFACE.tile, SURFACE.tileHover, "flex items-center gap-3")}>
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[10px]",
        TONE_ICON[tone] ?? TONE_ICON.planned,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} />
    </span>

    <div className="min-w-0 flex-1">
      <p className={T.label}>{label}</p>
      <p className={cn(T.value, wide ? T.sizeMd : T.sizeLg, "mt-1.5 truncate")}>
        {value}
      </p>
    </div>

    {hint && (
      <p className={cn(T.meta, "hidden max-w-[92px] text-right leading-snug lg:block")}>
        {hint}
      </p>
    )}
  </div>
);

export default HoursFlow;
