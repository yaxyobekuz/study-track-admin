// React
import { useId, useMemo } from "react";

// Icons
import { Activity } from "lucide-react";

// Recharts
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import { DELAY, HUE, MOTION, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/**
 * ZARAR VA UNDIRUV DINAMIKASI — 12 oylik ikki qatlam.
 *
 * ⚠️ IKKALASI BITTA O'QDA va bu ataylab: ikkalasi ham SO'M va savol ham
 * bitta — "yo'qotgan pulimizning qanchasi qaytdi". Ikki o'qqa bo'linsa,
 * chiziqlar bir-birini kesib o'tib, "undiruv zarardan oshdi" degan
 * ko'rinish hosil bo'lardi — masshtab har o'qda boshqa bo'lgani uchun.
 *
 * ⚠️ HODISALAR SONI PASTDA, ALOHIDA QATORDA. U DONA bilan o'lchanadi va
 * pul o'qiga sig'maydi; ikkinchi Y o'qi qo'shish o'rniga ingichka ustun
 * qatori chiziladi (Stripe/Linear naqshi). Shu bilan diagramma "nechta
 * hodisa" va "qancha pul" savollariga alohida javob beradi, lekin bitta
 * VAQT o'qini bo'lishadi — oylar tik tekislanadi.
 *
 * ⚠️ Nuqtalar (`dot`) YO'Q: 12 nuqta × 2 qator = 24 doiracha diagrammani
 * "sxema" ga aylantiradi. Faqat `activeDot` — sichqoncha turgan oyda.
 */

/** Pul o'qi yorlig'i — "1.2 mln", "840 ming". */
const compactMoney = (value) => {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1)} mlrd`;
  if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} mln`;
  if (Math.abs(number) >= 1_000) return `${Math.round(number / 1_000)} ming`;
  return String(number);
};

const AXIS = {
  tick: { fontSize: 10.5, fill: HUE.axis, fontWeight: 500 },
  axisLine: false,
  tickLine: false,
};

const DamageTrend = ({ data, isLoading, isError, delay = 0, className }) => {
  const gradientId = useId();

  const series = useMemo(
    () =>
      (data?.trend ?? []).map((row) => ({
        ...row,
        damage: Number(row.damageAmount),
        recovered: Number(row.recoveredAmount),
      })),
    [data],
  );

  const hasData = series.some((row) => row.damage > 0 || row.recovered > 0);
  const maxCount = Math.max(...series.map((row) => row.damageCount), 1);

  return (
    <Panel
      title="Zarar va undiruv dinamikasi"
      hint={`Oxirgi ${series.length || 12} oy · yo'qotilgan va qaytarilgan pul`}
      icon={Activity}
      accent="damage"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Bu davrda zarar ham, undiruv ham qayd etilmagan"
      action={<TrendLegend />}
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── Pul qatlami ─────────────────────────────────────────── */}
        <div className="h-[212px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`${gradientId}-damage`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={HUE.damage} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={HUE.damage} stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id={`${gradientId}-recovered`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={HUE.recovery} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={HUE.recovery} stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* ⚠️ Faqat GORIZONTAL to'r: vertikal chiziqlar 12 oyda 12 ta
                  tik chiziq chizib, diagrammani "panjara" qilardi */}
              <CartesianGrid vertical={false} stroke={HUE.grid} strokeDasharray="0" />

              <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" tickMargin={8} />
              <YAxis {...AXIS} tickFormatter={compactMoney} width={62} tickMargin={4} />

              <Tooltip
                content={<TrendTooltip />}
                cursor={{ stroke: HUE.neutralSoft, strokeWidth: 1, strokeDasharray: "3 3" }}
              />

              <Area
                type="monotone"
                dataKey="damage"
                name="Zarar"
                stroke={HUE.damage}
                /* ⚠️ 2.4px, 2px EMAS: nol qiymatli oylarda chiziq X o'qi
                   bilan ustma-ust tushadi va ingichka chiziq to'r
                   chizig'idan farq qilmay qolardi. */
                strokeWidth={2.4}
                fill={`url(#${gradientId}-damage)`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={900}
                animationBegin={delay + DELAY.content}
              />
              <Area
                type="monotone"
                dataKey="recovered"
                name="Undirilgan"
                stroke={HUE.recovery}
                strokeWidth={2.4}
                fill={`url(#${gradientId}-recovered)`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={900}
                animationBegin={delay + DELAY.content + 160}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Hodisalar qatori ────────────────────────────────────────
            ⚠️ Chap tomonda 62px bo'sh joy — yuqoridagi `YAxis` kengligi.
            Bu ikki qatlamning oylari TIK TEKISLANISHI uchun: aks holda
            pastdagi ustunlar diagramma o'qidan 62px chapga siljib,
            "yanvarning zarari fevralning hodisasi bilan" yonma-yon
            turgandek ko'rinardi. */}
        <div className="mt-2 flex items-end gap-[3px] pl-[62px] pr-1">
          {series.map((row, index) => (
            <CountBar
              key={row.month}
              row={row}
              max={maxCount}
              delay={delay + DELAY.content + index * 40}
            />
          ))}
        </div>

        <p className={cn(T.label, "mt-2 pl-[62px]")}>Hodisalar soni</p>
      </div>
    </Panel>
  );
};

/** Afsona — sarlavhaning o'ng tomonida, ikki nuqta. */
const TrendLegend = () => (
  <div className="flex items-center gap-3">
    {[
      { label: "Zarar", color: HUE.damage },
      { label: "Undirilgan", color: HUE.recovery },
    ].map((item) => (
      <span key={item.label} className="flex items-center gap-1.5">
        <span
          className="size-1.5 rounded-full"
          style={{ background: item.color }}
          aria-hidden
        />
        <span className="text-[10.5px] font-medium text-slate-500">{item.label}</span>
      </span>
    ))}
  </div>
);

/**
 * HODISA USTUNI — hodisalar soni uchun.
 *
 * Balandlik eng ko'p hodisali oyga nisbatan. Nol hodisali oy 2px
 * "asos" chizig'i bilan qoladi — umuman chizilmasa, ustun qatorida
 * teshik paydo bo'lib, oylar tekisligi ko'zga tashlanmasdi.
 */
const CountBar = ({ row, max, delay }) => {
  const height = row.damageCount > 0 ? Math.max(4, (row.damageCount / max) * 26) : 2;

  return (
    <div className="group relative flex flex-1 flex-col items-center gap-1">
      <div
        className={cn(
          "w-full rounded-[3px] transition-colors duration-200 ease-out-quint",
          row.damageCount > 0
            ? "bg-rose-200/90 group-hover:bg-rose-400"
            : "bg-slate-100",
          MOTION.growY,
        )}
        style={{ height: `${height}px`, animationDelay: `${delay}ms` }}
      />

      {/* Raqam faqat hover'da — 12 ta doimiy raqam ustun qatorini
          o'qib bo'lmas qilardi */}
      <span className="pointer-events-none absolute -top-4 rounded bg-slate-900 px-1 py-px text-[9px] font-semibold tabular-nums text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {row.damageCount}
      </span>
    </div>
  );
};

/**
 * TOOLTIP — oy, ikkala summa va hodisa soni.
 *
 * ⚠️ Recharts'ning standart tooltip'i ishlatilmaydi: u oq quti + kulrang
 * chegara chizadi va bu ekrandagi yagona "chegarali" element bo'lib
 * qolardi (`atlas.tokens.js` — chegarasiz tamoyil).
 */
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className="rounded-xl bg-slate-900/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-white/50">
        {label}
      </p>

      <div className="mt-1.5 space-y-1">
        {[
          { label: "Zarar", value: row.damage, color: HUE.damageSoft },
          { label: "Undirilgan", value: row.recovered, color: HUE.recoverySoft },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: item.color }}
              aria-hidden
            />
            <span className="text-[11px] text-white/60">{item.label}</span>
            <span className="ml-auto text-[11.5px] font-semibold tabular-nums text-white">
              {formatMoney(item.value, { withLabel: false })}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-1.5 text-[10.5px] font-medium text-white/45">
        {row.damageCount} ta hodisa · {row.brokenQuantity} sindi · {row.missingQuantity} yo'qoldi
      </p>
    </div>
  );
};

export default DamageTrend;
