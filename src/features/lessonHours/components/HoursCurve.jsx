// React
import { useId, useMemo, useState } from "react";

// Icons
import { TrendingUp } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Panel from "./Panel";

// Data & tokens
import { HUE, T } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * OY BO'YICHA SOAT TO'PLANISHI — qo'lda chizilgan SVG.
 *
 * ⚠️ RECHARTS ISHLATILMAYDI va bu ataylab. Kerak bo'lgan narsa — bitta
 * to'planuvchi egri chiziq, kun ustunlari va "bugun" chizig'i. Recharts
 * buni bera oladi, lekin bu komponentning aynan nusxasi o'qituvchi
 * panelida ham kerak, u yerda esa recharts UMUMAN YO'Q (`package.json`).
 * Ikki xil texnika bilan chizilgan ikkita bir xil diagramma har
 * o'zgarishda ikki marta tuzatilardi.
 *
 * ⚠️ IKKI QATLAM: o'tgan kunlar TO'LIQ, kelgusi kunlar SO'NIQ. "Oyning
 * 12-kunida 40 soat" bilan "oy oxirida 96 soat" ni bitta rangda chizsak,
 * ekran allaqachon o'tilgan darsni ham va'da qilingan darsni ham bir xil
 * dalil sifatida ko'rsatardi.
 *
 * ⚠️ VERTIKAL PANJARA YO'Q — faqat gorizontal. 30 ta vertikal chiziq
 * diagrammani "qafas" qilib qo'yardi (`DamageTrend.jsx` dagi qoida).
 *
 * ⚠️ `useId()` — gradient identifikatorlari uchun. Ekranda ikkita nusxa
 * turганda qattiq yozilgan `id` ikkinchisining bo'yog'ini birinchisiga
 * ulab qo'yardi.
 */
const VIEW = { w: 720, h: 190, padX: 8, padTop: 12, padBottom: 22 };

const HoursCurve = ({ data, isLoading, isError, delay = 0 }) => {
  const gradientId = useId();
  const [hover, setHover] = useState(null);

  // ⚠️ `data?.series ?? []` to'g'ridan-to'g'ri `useMemo` bog'liqligiga
  // berilsa, har renderda YANGI massiv bo'lib model qaytadan hisoblanardi.
  const series = useMemo(() => data?.series ?? [], [data]);

  const model = useMemo(() => {
    if (series.length === 0) return null;

    const max = Math.max(1, ...series.map((p) => p.cumulative ?? 0));
    const innerW = VIEW.w - VIEW.padX * 2;
    const innerH = VIEW.h - VIEW.padTop - VIEW.padBottom;
    const step = innerW / Math.max(1, series.length - 1);

    const points = series.map((point, index) => ({
      ...point,
      x: VIEW.padX + index * step,
      y: VIEW.padTop + innerH - ((point.cumulative ?? 0) / max) * innerH,
      barH: (point.hours / Math.max(1, ...series.map((p) => p.hours))) * (innerH * 0.42),
    }));

    // Oxirgi "o'tgan" nuqta — bugungi kun chegarasi
    const lastPastIndex = points.reduce(
      (acc, p, i) => (p.isPast ? i : acc),
      -1,
    );

    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

    const pastPoints = lastPastIndex >= 0 ? points.slice(0, lastPastIndex + 1) : [];
    const pastLine = pastPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

    const baseY = VIEW.padTop + innerH;
    const area =
      pastPoints.length > 1
        ? `${pastLine} L${pastPoints[pastPoints.length - 1].x.toFixed(1)},${baseY} L${pastPoints[0].x.toFixed(1)},${baseY} Z`
        : null;

    return { points, line, pastLine, area, baseY, innerH, max, lastPastIndex, step };
  }, [series]);

  const active = hover != null ? model?.points[hover] : null;

  return (
    <Panel
      title="Oy bo'ylab soat to'planishi"
      hint="Ustunlar — kunlik dars soati, chiziq — jamlanma"
      icon={TrendingUp}
      tone="taught"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !model}
      emptyText="Bu oyda dars jadvali bo'yicha soat topilmadi"
      action={
        active ? (
          <div className="text-right">
            <p className={T.label}>{active.day}-kun</p>
            <p className={cn(T.value, T.sizeMd, "mt-1")}>
              {formatHourNumber(active.cumulative)}
            </p>
          </div>
        ) : (
          <div className="text-right">
            <p className={T.label}>Jami</p>
            <p className={cn(T.value, T.sizeMd, "mt-1")}>
              {formatHourNumber(data?.totals?.totalHours)}
            </p>
          </div>
        )
      }
    >
      {model && (
        <div className="mt-1">
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            preserveAspectRatio="none"
            className="h-[190px] w-full"
            role="img"
            aria-label="Oy bo'ylab dars soatlarining to'planishi"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={HUE.area} stopOpacity="0.20" />
                <stop offset="100%" stopColor={HUE.area} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gorizontal yo'riqchilar — to'rtta, ko'proq emas */}
            {[0, 0.33, 0.66, 1].map((ratio) => {
              const y = VIEW.padTop + model.innerH * ratio;
              return (
                <line
                  key={ratio}
                  x1={VIEW.padX}
                  x2={VIEW.w - VIEW.padX}
                  y1={y}
                  y2={y}
                  stroke={HUE.grid}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* Kunlik ustunlar — o'tgani to'q, kelgusi so'niq */}
            {model.points.map((p) =>
              p.hours > 0 ? (
                <rect
                  key={`bar-${p.day}`}
                  x={p.x - Math.min(9, model.step * 0.34)}
                  width={Math.min(18, model.step * 0.68)}
                  y={model.baseY - p.barH}
                  height={p.barH}
                  rx="2"
                  fill={p.isPast ? HUE.lineSoft : HUE.future}
                  opacity={p.isPast ? 0.75 : 0.55}
                />
              ) : null,
            )}

            {/* O'tilgan qismning maydoni */}
            {model.area && <path d={model.area} fill={`url(#${gradientId}-area)`} />}

            {/* Butun oy — so'niq punktir (reja) */}
            <path
              d={model.line}
              fill="none"
              stroke={HUE.future}
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* O'tilgan qism — to'q va uzluksiz */}
            {model.pastLine && (
              <path
                d={model.pastLine}
                fill="none"
                stroke={HUE.line}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* "Bugun" chizig'i */}
            {model.lastPastIndex >= 0 &&
              model.lastPastIndex < model.points.length - 1 && (
                <g>
                  <line
                    x1={model.points[model.lastPastIndex].x}
                    x2={model.points[model.lastPastIndex].x}
                    y1={VIEW.padTop - 4}
                    y2={model.baseY}
                    stroke={HUE.line}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={model.points[model.lastPastIndex].x}
                    cy={model.points[model.lastPastIndex].y}
                    r="3.5"
                    fill="#fff"
                    stroke={HUE.line}
                    strokeWidth="2.4"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )}

            {/* Ko'rsatkich — ko'rinmas, faqat hodisa uchun */}
            {model.points.map((p, index) => (
              <rect
                key={`hit-${p.day}`}
                x={p.x - model.step / 2}
                width={model.step}
                y={0}
                height={VIEW.h}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
            ))}

            {active && (
              <line
                x1={active.x}
                x2={active.x}
                y1={VIEW.padTop - 4}
                y2={model.baseY}
                stroke={HUE.axis}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* O'q yorliqlari — HTML'da, SVG matnini cho'zmaslik uchun */}
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className={T.meta}>1-kun</span>
            <span className={T.meta}>
              {data?.isCurrentMonth ? "Bugun" : "O'rtasi"}
            </span>
            <span className={T.meta}>{series.length}-kun</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Legend color={HUE.line} label="O'tilgan" solid />
            <Legend color={HUE.future} label="Rejalashtirilgan" />
          </div>
        </div>
      )}
    </Panel>
  );
};

const Legend = ({ color, label, solid }) => (
  <span className="flex items-center gap-1.5">
    <span
      className={cn("h-[2px] w-5 rounded-full", !solid && "opacity-70")}
      style={{
        background: solid
          ? color
          : `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`,
      }}
    />
    <span className={T.meta}>{label}</span>
  </span>
);

export default HoursCurve;
