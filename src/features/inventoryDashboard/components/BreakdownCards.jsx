// React
import { useCallback, useMemo, useRef, useState } from "react";

// Icons
import { Boxes, HelpCircle } from "lucide-react";

// Recharts
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import {
  DELAY,
  HUE,
  LOSS_SCALE,
  MOTION,
  SCALE,
  T,
  isLightSurface,
} from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/* ═══════════════════════ SABAB KESIMI ═══════════════════════ */

/**
 * "NEGA YO'QOTDIK" — sabablar bo'yicha donut.
 *
 * ⚠️ NIMA UCHUN DONUT, USTUNLI DIAGRAMMA EMAS. Bu yerda savol
 * "qaysi sabab kattaroq" emas, "yo'qotishimiz NIMADAN iborat" — ya'ni
 * BUTUNNING TARKIBI. Donut markazidagi bo'shliq esa jamini ko'rsatish
 * uchun tayyor joy beradi, ustunli diagrammada esa jami hech qayerga
 * sig'masdi.
 *
 * ⚠️ Segmentlar orasida bo'shliq (`paddingAngle`) va yumaloq burchak
 * (`cornerRadius`): tutash halqada qo'shni segmentlar bir-biriga
 * qo'shilib ketadi va ularning soni ko'rinmaydi.
 *
 * ⚠️ RANG SHKALASI TARTIBLI (`LOSS_SCALE` — to'qdan ochiga), kamalak
 * emas: segmentlar kattalik bo'yicha saralangan, ya'ni rang ham
 * tartibni takrorlashi kerak (`atlas.tokens.js`).
 */
export const ReasonBreakdown = ({ data, isLoading, isError, delay = 0, className }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const rows = useMemo(
    () =>
      (data?.reasons ?? []).map((row, index) => ({
        ...row,
        amountNum: Number(row.amount),
        color: LOSS_SCALE[Math.min(index, LOSS_SCALE.length - 1)],
      })),
    [data],
  );

  const total = rows.reduce((sum, row) => sum + row.amountNum, 0);
  const active = activeIndex == null ? null : rows[activeIndex];

  return (
    <Panel
      title="Nega yo'qotdik"
      hint="Zarar sabablari bo'yicha tarkib"
      icon={HelpCircle}
      accent="damage"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu davrda zarar qayd etilmagan"
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── Donut ─────────────────────────────────────────────── */}
        <div className="relative mx-auto h-[168px] w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amountNum"
                nameKey="label"
                innerRadius="66%"
                outerRadius="97%"
                paddingAngle={2.5}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                animationDuration={800}
                animationBegin={delay + DELAY.content}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {rows.map((row, index) => (
                  <Cell
                    key={row.reason}
                    fill={row.color}
                    opacity={activeIndex == null || activeIndex === index ? 1 : 0.32}
                    style={{ transition: "opacity 200ms cubic-bezier(0.22,1,0.36,1)" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Markaz — jami yoki sichqoncha turgan segment.
              ⚠️ `pointer-events-none`: aks holda markazdagi matn
              donutning hover hodisalarini to'sib qo'yardi */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className={cn(T.label, "truncate max-w-[92px] text-center")}>
              {active ? active.label : "Jami"}
            </p>
            <p className={cn(T.value, T.sizeLg, "mt-1")}>
              {formatMoney(active ? active.amountNum : total, { withLabel: false })}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              {active ? `${active.share}% · ${active.count} ta` : "so'm"}
            </p>
          </div>
        </div>

        {/* ── Afsona ────────────────────────────────────────────── */}
        <ul className="mt-3 space-y-1">
          {rows.slice(0, 5).map((row, index) => (
            <li
              key={row.reason}
              className={cn(
                "flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors duration-200 ease-out-quint",
                activeIndex === index ? "bg-slate-50" : "bg-transparent",
                MOTION.enterX,
              )}
              style={{ animationDelay: `${delay + DELAY.content + index * 60}ms` }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span
                className="size-2 shrink-0 rounded-[3px]"
                style={{ background: row.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-600">
                {row.label}
              </span>
              <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-slate-900">
                {row.share}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
};

/* ═══════════════════════ BAZA TARKIBI ═══════════════════════ */

/**
 * BAZANING TUZILISHI — toifalar bo'yicha treemap.
 *
 * ⚠️ Bu YAGONA blok HOLATNI ko'rsatadi, hodisani emas — shuning uchun
 * oy tanlagichiga bog'liq EMAS va sarlavhada "hozirgi holat" deb
 * yoziladi. Foydalanuvchi oyni almashtirganda bu blok o'zgarmasligi
 * uni chalkashtirmasligi kerak.
 *
 * ⚠️ MAYDON — PUL, DONA EMAS. 500 ta qoshiq va bitta proyektor donada
 * teng emas; xarid rejasi esa pulga qarab tuziladi. Dona soni plitka
 * ichida ikkilamchi qator sifatida qoladi.
 *
 * ⚠️ RECHARTS `Treemap` ISHLATILMAYDI. U `content` propiga BARCHA
 * darajalarni (root ham) uzatadi va qo'shimcha maydonlarni (rang,
 * ulush) versiyaga qarab goh to'g'ridan-to'g'ri, goh `payload` ichida
 * beradi — natijada ekranda butun maydonni qoplagan bitta bo'sh
 * to'rtburchak chizilardi. Squarified algoritmi ellik qator kod va u
 * bizga plitkaning aniq o'lchamini beradi: matnni qaysi plitkaga
 * sig'dirish mumkinligi shundan hal qilinadi.
 */
export const CategoryTreemap = ({ data, isLoading, isError, delay = 0, className }) => {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const observerRef = useRef(null);

  /**
   * ⚠️ O'lchov TAXMIN QILINMAYDI, O'LCHANADI: plitka geometriyasi
   * konteyner kengligiga bog'liq va u ekran o'lchamiga, yon panelning
   * ochiq-yopiqligiga, hatto surgichning bor-yo'qligiga qarab
   * o'zgaradi (ta'lim dashboardidagi `useFitRows` bilan bir xil
   * yondashuv).
   *
   * ⚠️ CALLBACK REF, `useRef` + `useEffect` EMAS. Karta yuklanayotgan
   * paytda `Panel` kontent o'rniga skelet chizadi, ya'ni o'lchanadigan
   * element hali MAVJUD EMAS. Bo'sh bog'liqlikli `useEffect` bir marta
   * — o'sha paytda — ishlab, `ref.current` ni `null` topardi va
   * observer hech qachon ulanmasdi: ma'lumot kelgach konteyner paydo
   * bo'lardi-yu, kengligi 0 bo'lib qolaverardi. Callback ref esa DOM
   * tuguni haqiqatan qo'shilgan lahzada chaqiriladi.
   */
  const boxRef = useCallback((node) => {
    observerRef.current?.disconnect();
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      );
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  // Qaysi plitka ustida sichqoncha turibdi — pastki satr shuni ko'rsatadi
  const [activeId, setActiveId] = useState(null);

  const rows = useMemo(
    () =>
      (data?.categories ?? []).map((row, index) => ({
        ...row,
        value: Number(row.value),
        color: SCALE[Math.min(index, SCALE.length - 1)],
      })),
    [data],
  );

  const tiles = useMemo(() => {
    // Konteyner hali o'lchanmagan (birinchi render) — plitka yo'q
    if (rows.length === 0 || box.width < 40 || box.height < 40) return [];
    return squarify(rows, { x: 0, y: 0, w: box.width, h: box.height });
  }, [rows, box]);

  const active = rows.find((row) => row.categoryId === activeId) ?? null;
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const categoryCount = rows.length;

  return (
    <Panel
      title="Bazaning tuzilishi"
      hint="Toifalar bo'yicha qiymat — hozirgi holat"
      icon={Boxes}
      accent="base"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Xatlovda jihoz yo'q — toifa kesimi ham bo'sh"
      className={className}
    >
      {/* ⚠️ `min-h-[232px]` + `flex-1`: karta yonidagi bloklar bilan
          tenglashganda treemap o'sadi, lekin hech qachon 232px dan
          past bo'lmaydi — undan pastda plitkalarga na nom, na raqam
          sig'adi. Inline `height` ishlatilmaydi: `flex-1` uni baribir
          bekor qiladi va o'lchov haqiqiy holatdan ajralib qolardi. */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={boxRef} className="relative min-h-[196px] flex-1">
          {tiles.map((tile, index) => (
            <TreemapTile
              key={tile.categoryId}
              tile={tile}
              isActive={activeId === tile.categoryId}
              isDimmed={activeId != null && activeId !== tile.categoryId}
              onEnter={() => setActiveId(tile.categoryId)}
              onLeave={() => setActiveId(null)}
              delay={delay + DELAY.content + index * 55}
            />
          ))}
        </div>

        {/* ── Pastki satr: jami yoki tanlangan toifa ────────────────
            ⚠️ Bu qatorning YAGONA vazifasi — brauzerning `title`
            tooltipini almashtirish. Ilgari plitka ustiga sichqoncha
            kelganda operatsion tizimning QORA qutisi chiqardi: u
            dizayndan butunlay tashqarida, kechikib ochiladi va
            tegib turgan barmoq ostida umuman ishlamaydi. Endi
            tafsilot doim bir joyda — plitka ostidagi satrda. */}
        <div className="mt-3 flex items-center justify-between gap-3 border-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[3px] transition-colors duration-200 ease-out-quint"
              style={{ background: active ? active.color : HUE.base }}
              aria-hidden
            />
            <span className={cn(T.tdName, "truncate")}>
              {active ? active.name : "Jami baza"}
            </span>
          </div>

          <div className="flex shrink-0 items-baseline gap-2">
            <span className={cn(T.value, "text-[15px] leading-none")}>
              {formatMoney(active ? active.value : totalValue, { withLabel: false })}
            </span>
            <span className="text-[9.5px] font-medium text-slate-400">so'm</span>
            <span className="w-[74px] text-right text-[10.5px] font-medium tabular-nums text-slate-500">
              {active
                ? `${active.quantity} dona · ${active.share}%`
                : `${categoryCount} toifa`}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

/**
 * SQUARIFIED TREEMAP (Bruls, Huizing, van Wijk).
 *
 * Plitkalarni kvadratga imkon qadar yaqin qilib joylashtiradi.
 * ⚠️ Oddiy "slice and dice" ishlatilmaydi: unda kichik toifalar
 * qog'oz tasmasidek ingichka bo'lib qoladi va ularning ichiga na nom,
 * na raqam sig'adi — treemap "rangli chiziqlar to'plami" ga aylanardi.
 *
 * @param {Array<{value: number}>} items - kamayish tartibida
 * @param {{x: number, y: number, w: number, h: number}} rect
 */
const squarify = (items, rect) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];

  // Qiymatlarni MAYDONGA o'giramiz — algoritm piksel kvadratlari bilan
  // ishlaydi, xom summalar bilan emas
  const scale = (rect.w * rect.h) / total;
  const queue = items.map((item) => ({ ...item, area: item.value * scale }));

  const out = [];
  let free = { ...rect };
  let rest = queue;

  while (rest.length > 0 && free.w > 0.5 && free.h > 0.5) {
    // Qator QISQA tomon bo'ylab quriladi — squarified'ning mohiyati shu
    const side = Math.min(free.w, free.h);

    let row = [];
    while (rest.length > 0) {
      const candidate = [...row, rest[0]];
      if (row.length === 0 || worstRatio(candidate, side) <= worstRatio(row, side)) {
        row = candidate;
        rest = rest.slice(1);
      } else break;
    }

    free = layoutRow(row, side, free, out);
  }

  return out;
};

/** Qatordagi eng yomon tomonlar nisbati — kichigi yaxshiroq (kvadratroq). */
const worstRatio = (row, side) => {
  if (row.length === 0) return Infinity;

  const sum = row.reduce((acc, node) => acc + node.area, 0);
  if (sum <= 0) return Infinity;

  const max = Math.max(...row.map((node) => node.area));
  const min = Math.min(...row.map((node) => node.area));
  const side2 = side * side;
  const sum2 = sum * sum;

  return Math.max((side2 * max) / sum2, sum2 / (side2 * min));
};

/** Qatorni joylashtiradi va QOLGAN bo'sh maydonni qaytaradi. */
const layoutRow = (row, side, rect, out) => {
  const sum = row.reduce((acc, node) => acc + node.area, 0);
  if (sum <= 0) return { ...rect, w: 0, h: 0 };

  const thickness = sum / side;
  // Qisqa tomon VERTIKAL bo'lsa, qator ham vertikal ustun bo'ladi
  const vertical = rect.w >= rect.h;

  let offset = 0;
  for (const node of row) {
    const size = node.area / thickness;

    out.push({
      ...node,
      x: vertical ? rect.x : rect.x + offset,
      y: vertical ? rect.y + offset : rect.y,
      w: vertical ? thickness : size,
      h: vertical ? size : thickness,
    });

    offset += size;
  }

  return vertical
    ? { x: rect.x + thickness, y: rect.y, w: rect.w - thickness, h: rect.h }
    : { x: rect.x, y: rect.y + thickness, w: rect.w, h: rect.h - thickness };
};

/**
 * TREEMAP PLITKASI — nom, qiymat va tafsilot.
 *
 * ⚠️ Matn plitka SIG'IMIGA qarab bosqichma-bosqich yashiriladi: keng
 * plitkada uchala qator, o'rtachada ikkitasi, kichigida faqat nom, juda
 * kichigida esa hech nima. Aks holda 40px lik plitkada uchta qator
 * bir-birining ustiga tushib, "matn qoldig'i" bo'lib ko'rinardi.
 *
 * ⚠️ HTML, SVG EMAS: matnni kesish (`truncate`) va o'rash brauzerning
 * o'z ishi — SVG'da har harfning kengligini qo'lda taxmin qilishga
 * to'g'ri kelardi va u shrift yuklanishiga qarab o'zgarardi.
 */
const TreemapTile = ({ tile, isActive, isDimmed, onEnter, onLeave, delay }) => {
  const showValue = tile.h > 50 && tile.w > 72;
  const showMeta = tile.h > 72 && tile.w > 92;
  const showName = tile.h > 24 && tile.w > 44;

  // ⚠️ Matn rangi HISOBLANADI, qotib qolmaydi: shkalaning och
  // pog'onasidagi plitkada oq matn o'qilmaydi (`atlas.tokens.js`)
  const light = isLightSurface(tile.color);
  const tone = {
    name: light ? "text-slate-900" : "text-white",
    value: light ? "text-slate-800" : "text-white/95",
    meta: light ? "text-slate-600" : "text-white/65",
  };

  return (
    /* ⚠️ `title` atributi OLIB TASHLANDI — u operatsion tizimning qora
       tooltipini chaqiradi. Tafsilot endi kartaning pastki satrida
       ko'rsatiladi; bu yerda faqat SO'NDIRISH qoladi: tanlangan plitka
       to'liq yorqinlikda, qolganlari xiralashadi va ko'z bittasiga
       qaratiladi. */
    <div
      className={cn(
        "absolute cursor-default overflow-hidden rounded-[10px] p-2.5",
        "transition-[filter,opacity,transform] duration-250 ease-out-quint",
        isActive && "brightness-[1.08]",
        isDimmed && "opacity-45",
        MOTION.pop,
      )}
      style={{
        left: tile.x + 1,
        top: tile.y + 1,
        width: Math.max(0, tile.w - 2),
        height: Math.max(0, tile.h - 2),
        background: tile.color,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {showName && (
        <p className={cn("truncate text-[11px] font-semibold leading-tight", tone.name)}>
          {tile.name}
        </p>
      )}

      {showValue && (
        <p
          className={cn(
            "mt-1 truncate text-[12.5px] font-semibold leading-none tabular-nums",
            tone.value,
          )}
        >
          {compact(tile.value)}
        </p>
      )}

      {showMeta && (
        <p
          className={cn(
            "mt-1 truncate text-[10px] font-medium leading-none tabular-nums",
            tone.meta,
          )}
        >
          {tile.quantity} dona
          {tile.brokenQuantity > 0 && ` · ${tile.brokenQuantity} yaroqsiz`}
        </p>
      )}
    </div>
  );
};

/** Plitka ichidagi pul — "12.4 mln" ko'rinishida. */
const compact = (value) => {
  const number = Number(value) || 0;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1)} mlrd`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} mln`;
  if (number >= 1_000) return `${Math.round(number / 1_000)} ming`;
  return String(number);
};
