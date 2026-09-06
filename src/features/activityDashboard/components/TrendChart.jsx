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

// Tokens
import { CHIP, DELAY, HUE, MOTION, SURFACE, T, contentDelay } from "../data/pulse.tokens";

// Components
import Panel from "./Panel";

/**
 * KUNLIK FAOLLIK DINAMIKASI — bot va panel, ikki qatlam.
 *
 * ⚠️ IKKALASI BITTA Y O'QIDA va bu ataylab: `bot` ham, `panel` ham
 * O'SHA KUNGI NOYOB ODAM SONI, ya'ni bitta o'lchov birligi (kishi).
 * Ikkinchi o'q qo'shilsa, har qator o'z masshtabiga cho'zilib,
 * "bugun panel botdan faolroq" degan YOLG'ON ko'rinish hosil bo'lardi
 * — aslida ota-onalar soni xodimlar sonidan bir necha barobar ko'p.
 * Bitta o'q bu nisbatni ko'z bilan o'qishga imkon beradi.
 *
 * ⚠️ FOIZ (`botRate`/`panelRate`) BU YERDA CHIZILMAYDI. Qatorda u ham
 * bor, lekin foiz va odam soni bir maydonda turolmaydi: 40% va 40 kishi
 * bir xil balandlikka tushib, diagramma ma'nosini yo'qotardi.
 *
 * ⚠️ Nuqtalar (`dot`) YO'Q: 90 kunlik davrda 180 doiracha chiziqni
 * butunlay bosib ketardi. Faqat `activeDot` — sichqoncha turgan kunda.
 */

/**
 * X o'qi yorlig'i — serverning to'liq `label` idan faqat kun-oy qismi.
 *
 * ⚠️ SANA QO'LDA YIG'ILMAYDI. Server "6-sentabr, 2026" beradi; bu yerda
 * faqat vergulgacha bo'lgan bo'lak KESIB olinadi ("6-sentabr").
 * `toLocaleDateString`/`Intl` bilan qayta formatlansa, natija brauzer
 * locale'iga bog'liq bo'lib, bitta ekranda ikki xil sana turardi.
 */
const shortDay = (label) => (label ? String(label).split(",")[0] : "—");

/** O'q ko'rinishi — recharts SVG atributlari (Tailwind sinfi u yerga yetmaydi). */
const AXIS = {
  tick: { fontSize: 10.5, fill: HUE.axis, fontWeight: 500 },
  axisLine: false,
  tickLine: false,
};

/** Diagramma qatlamlari — afsona, tooltip va `Area` bitta manbadan. */
const SERIES = [
  { key: "bot", name: "Bot", tone: "bot", color: HUE.bot },
  { key: "panel", name: "Panel", tone: "panel", color: HUE.panel },
];

const TrendChart = ({ data, isLoading, isError, delay = 0, className }) => {
  const gradientId = useId();

  // ⚠️ `data?.trend ?? []` bog'liqlik ro'yxatiga CHIQARILMAYDI: har
  // renderda yangi massiv hosil bo'lib, memo hech qachon keshlanmasdi.
  /**
   * ⚠️ IZOH GRANULYARLIKKA MOSLASHADI. Ilgari u qat'iy "N kunlik"
   * deb yozardi va haftalik/oylik rejimda YOLG'ON bo'lib qolardi:
   * "12 kunlik" deb yozilib, aslida 12 HAFTA ko'rsatilardi.
   * Server birlikni o'zi biladi (`period.granularityLabel`).
   */
  const periodHint = useMemo(() => {
    const p = data?.period;
    if (!p) return "Noyob foydalanuvchilar";
    const unit = p.granularity === "week" ? "hafta" : p.granularity === "month" ? "oy" : "kun";
    return `Oxirgi ${p.count} ${unit} · noyob foydalanuvchilar`;
  }, [data]);

  const series = useMemo(
    () =>
      (data?.trend ?? []).map((row) => ({
        ...row,
        bot: Number(row.bot) || 0,
        panel: Number(row.panel) || 0,
        // ⚠️ SERVER BERGANI USTUN. Sana matni serverda yig'iladi
        // (`dates.md`) va granulyarlikka qarab boshqacha bo'ladi:
        // kunlikda "7-sentabr", haftalikda oraliq boshi, oylikda
        // "Sentabr, 2026". Mahalliy `shortDay` faqat eski javob
        // uchun zaxira sifatida qoladi.
        shortLabel: row.shortLabel || shortDay(row.label),
      })),
    [data],
  );

  /**
   * Yorliqlarni siyraklashtirish: 30 kunda ~6 ta yorliq qoladi.
   *
   * ⚠️ `interval="preserveStartEnd"` YETMAYDI — u recharts o'ziga
   * qulay sonini tanlaydi va 90 kunlik davrda yorliqlar bir-birining
   * ustiga chiqib ketadi. Qadam ATAYLAB qattiq hisoblanadi.
   */
  const tickInterval = Math.max(0, Math.ceil(series.length / 6) - 1);

  const hasData = series.some((row) => row.bot > 0 || row.panel > 0);

  return (
    <Panel
      title="Faollik dinamikasi"
      hint={periodHint}
      icon={Activity}
      tone="bot"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Bu davrda faollik qayd etilmagan"
      className={className}
    >
      {/* ── Afsona ─────────────────────────────────────────────────
          Sarlavha ostida, chipda: qaysi rang qaysi kanal ekani
          diagrammaga QARAMASDAN o'qilishi kerak. */}
      <div
        className={cn("flex flex-wrap items-center gap-1.5", MOTION.enterUp)}
        style={{ animationDelay: `${contentDelay(delay, 0)}ms` }}
      >
        {SERIES.map((item) => (
          <span key={item.key} className={cn(CHIP.base, CHIP.tone[item.tone])}>
            {/* `bg-current` — nuqta chipning o'z ohangini oladi, ikkinchi
                rang manbai paydo bo'lmaydi */}
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {item.name}
          </span>
        ))}
      </div>

      {/* ── Diagramma ──────────────────────────────────────────────── */}
      <div
        className={cn("mt-3 h-[240px] w-full", MOTION.enterUp)}
        style={{ animationDelay: `${contentDelay(delay, 1)}ms` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
            <defs>
              {SERIES.map((item) => (
                <linearGradient
                  key={item.key}
                  id={`${gradientId}-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={item.color} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0.01" />
                </linearGradient>
              ))}
            </defs>

            {/* ⚠️ Faqat GORIZONTAL to'r: 30 ta tik chiziq diagrammani
                "panjara" qilib, chiziqlarni yo'qotib yuborardi */}
            <CartesianGrid vertical={false} stroke={HUE.grid} strokeDasharray="0" />

            <XAxis
              dataKey="shortLabel"
              {...AXIS}
              interval={tickInterval}
              tickMargin={8}
              minTickGap={4}
            />
            {/* Odam soni — butun son; `allowDecimals` bo'lsa o'qda
                "0.5 kishi" paydo bo'lardi */}
            <YAxis {...AXIS} allowDecimals={false} width={34} tickMargin={4} />

            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: HUE.neutralSoft, strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            {SERIES.map((item, index) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#${gradientId}-${item.key})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={900}
                animationBegin={delay + DELAY.content + index * 160}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};

/**
 * TOOLTIP — kun va ikkala kanalning odam soni.
 *
 * ⚠️ Recharts'ning standart tooltip'i ISHLATILMAYDI: u kulrang
 * chegarali quti chizadi va bu ekrandagi yagona "chegarali" element
 * bo'lib qolardi (`pulse.tokens.js` — chegara o'rniga signal relsi).
 * Shu sababli qobiq `SURFACE.card` dan olinadi — tooltip kichik karta,
 * ya'ni ekrandagi boshqa sirtlar bilan bitta oiladan; faqat radius va
 * ichki bo'shliq kichiklashtiriladi.
 *
 * ⚠️ Sarlavhada TO'LIQ `label` turadi ("6-sentabr, 2026"), o'qdagi
 * qisqartma emas: o'q siyraklashtirilgani uchun sichqoncha turgan
 * kunning aniq sanasi faqat shu yerda ko'rinadi.
 */
const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className={cn(SURFACE.card, "rounded-xl px-3 py-2.5")}>
      <p className={T.title}>{row?.label ?? "—"}</p>

      <div className="mt-1.5 space-y-1">
        {SERIES.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span className={T.td}>{item.name}</span>
            <span className={cn(T.tdNum, "ml-auto")}>{row?.[item.key] ?? 0}</span>
            <span className={T.meta}>kishi</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;
