// React
import { useEffect, useId, useRef, useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * O'SISH CHIZIG'I — vaqt bo'yicha o'rtacha ball.
 *
 * ⚠️ MA'LUMOTSIZ KUN CHIZIQNI UZADI, NOLGA TUSHIRMAYDI. Server bo'sh
 * kunni `score: null` bilan qaytaradi; uni 0 deb chizish "o'sha kuni
 * hamma 0 ball oldi" degan yolg'on manzara berardi. Shuning uchun
 * chiziq segmentlarga bo'linadi.
 *
 * ⚠️ SANA `formatDateUz` BILAN. `.claude/rules/dates.md`: qo'lda yig'ilgan
 * yoki `toLocaleDateString` bilan chiqarilgan sana taqiqlangan. O'qda
 * `hideYear` — u faqat diagramma uchun mo'ljallangan qisqa ko'rinish.
 *
 * ⚠️ TAQQOSLASH IXTIYORIY, LEKIN JUFTLIK QAT'IY. Oldingi davr AYNI
 * UZUNLIKDA va nuqtalar DAVR BOSHIDAN HISOBLANGAN SILJISH bo'yicha
 * juftlashtiriladi (server shunday yuboradi) — ya'ni "1-kun 1-kun
 * bilan". Massiv indeksi bo'yicha juftlashtirilsa, o'tgan davrda kam
 * kun bo'lganda punktir chiziq butunlay boshqa sanalarni ko'rsatardi.
 *
 * @param {{date:string, score:number|null, attempts:number, previousScore?:number|null, previousDate?:string}[]} props.points
 */
/** Qalqib chiquvchi oynaning kengligi — chekka hisobi shunga tayanadi. */
const TOOLTIP_WIDTH = 190;

const TrendChart = ({
  points = [],
  height = 220,
  color = "#2563eb",
  className = "",
  showPrevious = false,
}) => {
  const gradientId = `diag-trend-${useId().replace(/:/g, "")}`;
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null);

  // Kenglikni kuzatamiz — SVG viewBox emas, haqiqiy piksellarda chiziladi
  // (matn o'lchami cho'zilib ketmasligi uchun).
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const iw = Math.max(0, width - padL - padR);
  const ih = height - padT - padB;

  const x = (i) =>
    padL + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => padT + ih * (1 - Math.max(0, Math.min(100, v)) / 100);

  /**
   * ⚠️ CHIZIQ UZLUKSIZ — MA'LUMOTSIZ KUN UNI UZMAYDI.
   *
   * Ilgari har bo'sh kun chiziqni bo'lakka ajratardi: 30 kunlik
   * oraliqda test faqat ba'zi kunlari topshirilgani uchun grafik
   * "sinib-sinib" ko'rinardi va o'sish yo'nalishini umuman o'qib
   * bo'lmasdi. Endi mavjud o'lchovlar ketma-ket birlashtiriladi.
   *
   * ⚠️ LEKIN BO'SH KUN NOLGA TUSHIRILMAYDI ham: uni 0 deb chizish
   * "o'sha kuni hamma 0 ball oldi" degan yolg'on bo'lardi. Ya'ni
   * chiziq bor o'lchovlar orasida to'g'ridan-to'g'ri o'tadi, nuqta esa
   * FAQAT haqiqiy o'lchov bo'lgan kunda qo'yiladi — qaysi kun
   * o'lchangani baribir ko'rinib turadi.
   */
  const toSeries = (getValue) =>
    points
      .map((p, i) => {
        const value = getValue(p);
        return value == null ? null : [x(i), y(value)];
      })
      .filter(Boolean);

  const line = toSeries((p) => p.score);
  const segments = line.length > 1 ? [line] : [];

  const grid = [0, 25, 50, 75, 100];

  // Sana yorliqlari — hammasi sig'masa har n-chisi ko'rsatiladi.
  const labelEvery = Math.max(1, Math.ceil(points.length / (iw > 520 ? 8 : 4)));

  /**
   * Soya maydoni HAR SEGMENT UCHUN ALOHIDA va uning O'Z chekkalaridan
   * yopiladi.
   *
   * ⚠️ Ilgari asos butun grafik kengligiga (`x(0)` … `x(oxirgi)`)
   * tortilardi: chiziq faqat oxirgi bir necha kunni qamrasa ham, soya
   * chapdan o'ngga cho'zilib, "ma'lumot bor" degan yolg'on taassurot
   * qoldirardi.
   */
  /**
   * Oldingi davr — AYNI segmentlash mantig'i, lekin soyasiz va punktir.
   * Rang ataylab kulrang: taqqoslash FONI bo'lishi kerak, joriy davrga
   * raqobat qilmasligi kerak.
   */
  // O'lchov bo'lgan kunlarning indekslari — kursor shularga yopishadi.
  const measured = points.reduce((acc, p, i) => {
    if (p.score != null || p.previousScore != null) acc.push(i);
    return acc;
  }, []);

  const prevLine = showPrevious ? toSeries((p) => p.previousScore) : [];
  const prevSegments = prevLine.length > 1 ? [prevLine] : [];
  /**
   * ⚠️ LEGENDA CHIZIQ EMAS, MA'LUMOT BORLIGIGA QARAB CHIQADI. Siyrak
   * ma'lumotda oldingi davr bitta nuqtadan iborat bo'lishi mumkin —
   * chiziq chizilmaydi-yu, nuqta chiziladi. Shartni "segment uzunligi
   * > 1" deb qo'yilsa, ekranda kulrang nuqta turib, uning nimaligini
   * tushuntiradigan legenda bo'lmasdi.
   */
  const hasPrevious = showPrevious && points.some((p) => p.previousScore != null);

  const baseline = (padT + ih).toFixed(1);
  const areaPaths = segments
    .filter((segment) => segment.length > 1)
    .map((segment) => {
      const line = segment
        .map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`)
        .join(" L ");
      const first = segment[0][0].toFixed(1);
      const last = segment[segment.length - 1][0].toFixed(1);
      return `M ${line} L ${last} ${baseline} L ${first} ${baseline} Z`;
    });

  /**
   * ⚠️ SICHQONCHA NUQTAGA EMAS, BUTUN MAYDONGA TUSHADI.
   *
   * Ilgari ma'lumot faqat `<title>` orqali chiqardi: u brauzerning o'z
   * qalqib chiquvchi oynasi, bir soniya kechikadi va 3.5px li doiraga
   * tegishning o'zi qiyin — amalda hech kim ko'rmasdi. Endi butun
   * grafik ustida eng yaqin kun topiladi, ya'ni kursorni taxminan
   * kerakli joyga olib borish yetarli.
   */
  const handleMove = (event) => {
    if (!points.length || iw <= 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const ratio = (px - padL) / iw;
    const raw = Math.max(
      0,
      Math.min(points.length - 1, Math.round(ratio * (points.length - 1))),
    );

    /**
     * ⚠️ ENG YAQIN O'LCHOVGA YOPISHADI, kursor turgan kunga emas.
     *
     * Test har kuni topshirilmaydi: kursorni bo'sh kunga olib borsa
     * oyna g'oyib bo'lardi va grafik "ba'zan ishlaydi, ba'zan
     * ishlamaydi" bo'lib tuyulardi. Chiziq ham baribir o'lchovlar
     * orasidan o'tadi, ya'ni yaqin kunni ko'rsatish yolg'on emas —
     * oynada o'sha kunning O'Z sanasi yoziladi.
     */
    if (!measured.length) {
      setHover(null);
      return;
    }
    const index = measured.reduce((best, i) =>
      Math.abs(i - raw) < Math.abs(best - raw) ? i : best,
    );
    setHover({ index, point: points[index] });
  };

  const tooltip = hover
    ? {
        ...hover,
        x: x(hover.index),
        // ⚠️ CHEKKA HISOBI OYNANING HAQIQIY KENGLIGIDAN. Ilgari bu
        // yerda 150 turardi-yu, oyna ~190px edi: o'ng chekkaga yaqin
        // nuqtada u kartadan chiqib ketardi.
        flip: x(hover.index) + TOOLTIP_WIDTH + 16 > width,
      }
    : null;

  return (
    // ⚠️ `minHeight`, `height` EMAS: legenda SVG'dan pastda turadi va
    // qat'iy balandlikda u konteynerdan chiqib ketardi. Kenglik esa
    // baribir shu elementdan o'lchanadi.
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ minHeight: height }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Natijalar dinamikasi"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {grid.map((g) => (
            <g key={g}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y(g)}
                y2={y(g)}
                stroke="#EDF1F7"
                strokeWidth={1}
              />
              <text
                x={padL - 8}
                y={y(g) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#AEB6C4"
              >
                {g}%
              </text>
            </g>
          ))}

          {areaPaths.map((d, i) => (
            <path key={i} d={d} fill={`url(#${gradientId})`} />
          ))}

          {prevSegments.map((segment, i) => (
            <path
              key={`prev-${i}`}
              d={`M ${segment.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L ")}`}
              fill="none"
              stroke="#C7CEDB"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {segments.map((segment, i) => (
            <path
              key={i}
              d={`M ${segment.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L ")}`}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {showPrevious &&
            points.map((p, i) =>
              p.previousScore == null ? null : (
                <circle
                  key={`prev-dot-${i}`}
                  cx={x(i)}
                  cy={y(p.previousScore)}
                  r={2.5}
                  fill="#C7CEDB"
                >
                  <title>
                    {`Oldingi davr — ${formatDateUz(p.previousDate)}: ${p.previousScore}% (${p.previousAttempts} ta urinish)`}
                  </title>
                </circle>
              ),
            )}

          {/* ⚠️ KO'RSATKICH CHIZIG'I nuqtadan OLDIN chiziladi — aks
              holda u nuqtaning ustini yopib qo'yardi. */}
          {tooltip && (
            <line
              x1={tooltip.x}
              x2={tooltip.x}
              y1={padT}
              y2={padT + ih}
              stroke="#C7CEDB"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          {points.map((p, i) =>
            p.score == null ? null : (
              <circle
                key={i}
                cx={x(i)}
                cy={y(p.score)}
                // Kursor turgan kun kattaroq — qaysi nuqta o'qilayotgani
                // ko'rinib tursin.
                r={tooltip?.index === i ? 5.5 : 3.5}
                fill="#fff"
                stroke={color}
                strokeWidth={2}
                className="transition-[r] duration-150 motion-reduce:transition-none"
              />
            ),
          )}

          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text
                key={`l-${i}`}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#7A879B"
              >
                {formatDateUz(p.date, { hideYear: true })}
              </text>
            ) : null,
          )}
        </svg>
      )}

      {/* ── QALQIB CHIQUVCHI OYNA ────────────── */}
      {/* ⚠️ SVG ICHIDA EMAS, USTIDA: SVG matni o'ralmaydi va soya
          tushirmaydi. Oddiy `div` bilan uslub panelning qolgan qismi
          bilan bir xil bo'ladi. `pointer-events-none` majburiy — aks
          holda oynaning o'zi kursorni ushlab, `mousemove` uzilib
          qolardi va oyna miltillardi. */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-gray-100 bg-white p-3 shadow-lg"
          style={{
            width: TOOLTIP_WIDTH,
            left: tooltip.flip ? undefined : tooltip.x + 12,
            right: tooltip.flip ? width - tooltip.x + 12 : undefined,
            top: 8,
          }}
        >
          <p className="text-xs font-semibold text-gray-900">
            {formatDateUz(tooltip.point.date)}
          </p>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="flex-1 text-xs text-gray-500">Ushbu davr</span>
              <span className="text-xs font-semibold tabular-nums text-gray-900">
                {tooltip.point.score != null ? `${tooltip.point.score}%` : "—"}
              </span>
            </div>

            {showPrevious && (
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[#C7CEDB]" />
                <span className="flex-1 text-xs text-gray-500">Oldingi davr</span>
                <span className="text-xs font-semibold tabular-nums text-gray-900">
                  {tooltip.point.previousScore != null
                    ? `${tooltip.point.previousScore}%`
                    : "—"}
                </span>
              </div>
            )}
          </div>

          {/* Urinishlar soni — foizning MAXRAJI. Usiz bitta urinishdan
              chiqqan 100% o'ttiz urinishdan chiqqan 100% bilan bir xil
              ishonch bilan ko'rinardi. */}
          <p className="mt-2 truncate border-t border-gray-100 pt-2 text-[11px] text-gray-400">
            {tooltip.point.attempts} ta urinish
            {/* Oldingi davr sanasi FAQAT o'lchov bo'lganda: bo'sh kun
                sanasini yozish "o'sha kuni ham test bo'lgan" degan
                yolg'on taassurot qoldirardi. */}
            {tooltip.point.previousScore != null && tooltip.point.previousDate
              ? ` · ${formatDateUz(tooltip.point.previousDate, { hideYear: true })}`
              : ""}
          </p>
        </div>
      )}

      {/* ⚠️ LEGENDA FAQAT TAQQOSLASH CHIZILGANDA. Bo'sh legenda
          "ma'lumot bor, lekin ko'rinmayapti" degan taassurot qoldirardi. */}
      {hasPrevious && (
        <div className="-mt-1 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            Ushbu davr
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#C7CEDB]" />
            Oldingi davr
          </span>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
