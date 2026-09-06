// React
import { useId, useMemo } from "react";

// Icons
import { GitBranch } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import { DELAY, HUE, MOTION, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/**
 * ZARARNING OQIMI — uch bosqichli oqim diagrammasi.
 *
 * Bitta savolga javob: "yo'qotgan pulimiz qayerga ketdi".
 *
 *   Umumiy zarar ─┬─ Aybdorga yozilgan ─┬─ Undirilgan
 *                 │                     └─ Qarz qoldi
 *                 ├─ Maktab hisobidan
 *                 └─ Qaror kutmoqda
 *
 * ⚠️ NIMA UCHUN OQIM, uchta alohida raqam EMAS. "Zarar 12 mln, yozilgan
 * 7 mln, undirilgan 4 mln" — bu uchta mustaqil son bo'lib o'qiladi va
 * ular orasidagi MUNOSABAT ko'rinmaydi. Oqim esa bir qarashda
 * ko'rsatadi: yo'qotishning yarmi hali hech kimga yozilmagan,
 * yozilganining esa uchdan ikkisi qarz bo'lib turibdi.
 *
 * ⚠️ KLASSIK SANKEY LENTASIDAN VOZ KECHILDI va buning aniq sababi bor.
 * Birinchi urinishda tugunlar ingichka ustun, yorliqlar esa lentaning
 * USTIDA suzib yuruvchi qutilar edi. Natijada ekranda diagramma emas,
 * "gradient dog'" ko'rinardi: lentalar butun kartani egallab, o'zaro
 * qo'shilib ketardi, yorliqlar esa ularning ustiga yopishtirilgan
 * stikerdek turardi va o'qilmasdi.
 *
 * Endi HAR BOSQICH — KARTOCHKA: nomi, summasi va ulushi o'z oq sirtida,
 * hech qanday rangli fon ustida emas. Lentalar kartochkalar ORASIDAGI
 * bo'shliqda qoladi va faqat bog'lovchi vazifasini bajaradi. Shu
 * tufayli ko'z avval RAQAMNI, keyin bog'lanishni o'qiydi — kerakli
 * tartib aynan shu.
 *
 * ⚠️ IKKI QATLAM: kartochkalar HTML (matn brauzer tomonidan kesiladi va
 * o'raladi), lentalar SVG (`preserveAspectRatio="none"` — gorizontal
 * cho'ziladi). Matnni SVG ichiga qo'ysak, tor ekranda u ham cho'zilib
 * yassilanib qolardi.
 *
 * ⚠️ IKKINCHI BOSQICH `charged` GA NORMALLASHTIRILADI. `recovered` va
 * `outstanding` `DamageCharge` dan, `charged` esa `InventoryDamage` dan
 * keladi (server izohiga qarang) — ular bir necha tiyinga farq qilishi
 * mumkin. Normallashtirilmasa, oxirgi ustun o'z manbasidan baland
 * bo'lib qolardi.
 */

/**
 * Chizma balandligi (px) — ustun sarlavhalaridan keyingi maydon.
 *
 * ⚠️ 186 — O'LCHANGAN, taxmin emas. Ikkita o'rta kartochka eng yomon
 * holatda (89% / 11%) 122px va 54px oladi, ya'ni ikkalasiga ham uch
 * qator matn sig'adi. 244px da esa manba kartochkasi ichida 90px lik
 * bo'sh maydon qolib, blok "yuklanmagan" ko'rinardi.
 */
const H = 186;

/** Tugunlar orasidagi vertikal bo'shliq. */
const GAP = 10;

/**
 * Kartochkaning eng kam balandligi.
 *
 * ⚠️ 44px — O'LCHANGAN: ikki qatorli matn (nom 14px qator + summa 17px
 * qator) uchun eng kam joy. Undan past bo'lsa summa kesilardi, ya'ni
 * 2% lik ulushning raqami umuman ko'rinmasdi.
 */
const MIN_CARD = 44;

/**
 * USTUNLAR (foizda: chap cheti va kengligi).
 *
 * ⚠️ Uchinchi bosqichning BOR-YO'QLIGIGA qarab ikki xil joylashuv.
 * Aybdorga yozilgan qarz bo'lmasa (yangi maktabda yoki hamma zarar
 * maktab hisobidan qoplangan oyda) uchinchi ustun umuman chizilmaydi —
 * qolgan ikkitasi esa 43% da qolsa, kartaning o'ng yarmi bo'sh turardi.
 */
const LAYOUT_FULL = {
  source: { left: 0, width: 17 },
  middle: { left: 41.5, width: 17 },
  target: { left: 83, width: 17 },
};

const LAYOUT_SHORT = {
  source: { left: 0, width: 19 },
  middle: { left: 81, width: 19 },
  target: null,
};

/**
 * ⚠️ KARTOCHKA KENGLIGI TOR va ustunlar kartaning ikki CHETIDA turadi.
 * Birinchi urinishda kartochkalar 27-42% edi va ular ma'lumot hajmiga
 * nisbatan bo'm-bo'sh ko'rinardi: uch qator matn 340px lik oq maydonda
 * yo'qolib ketardi. 17-19% (~230px) — uch qatorning tabiiy kengligi.
 * Ortib qolgan joy lentaga tegadi va aynan shu narsa OQIM hissini
 * beradi: qisqa lenta "ikkita quti yonma-yon" bo'lib o'qilardi.
 */

const DamageFlow = ({ data, isLoading, isError, delay = 0, className }) => {
  const gradientId = useId();
  const model = useMemo(() => buildModel(data?.flow), [data]);

  return (
    <Panel
      title="Zararning taqdiri"
      hint="Yo'qotilgan pul qayerga ketdi — hodisadan kassagacha"
      icon={GitBranch}
      accent="damage"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!model}
      emptyText="Bu davrda zarar qayd etilmagan — oqim ham yo'q"
      className={className}
    >
      {model && (
        <div className="min-h-0 flex-1">
          {/* ── Ustun sarlavhalari ───────────────────────────────────
              ⚠️ Ular MO'LJAL: uchta kartochka ustuni yonma-yon turganda
              "bu qaysi bosqich" degan savol tug'iladi va uni har safar
              kartochka matnidan chiqarib olishga to'g'ri kelardi. */}
          <div className="relative mb-2.5 h-3">
            {model.columns.map((column) => (
              <span
                key={column.key}
                className={cn(T.label, "absolute top-0 whitespace-nowrap")}
                style={{ left: `${column.left}%` }}
              >
                {column.title}
              </span>
            ))}
          </div>

          <div className="relative w-full" style={{ height: H }}>
            {/* ── Bog'lovchi lentalar — kartochkalar ORQASIDA ────────
                ⚠️ Lenta faqat bo'shliqda ko'rinadi: uning ikkala uchi
                kartochkaning tagiga kiradi va u yerda ko'rinmaydi.
                Shu sababli lenta matnning kontrastini hech qachon
                buzmaydi. */}
            <svg
              className="absolute inset-0 size-full"
              viewBox={`0 0 100 ${H}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                {model.bands.map((band) => (
                  <linearGradient
                    key={band.key}
                    id={`${gradientId}-${band.key}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    {/* ⚠️ Shaffoflik ATAYLAB past. Lenta bu yerda
                        BOG'LOVCHI, ma'lumot tashuvchi emas — raqam
                        kartochkada turadi. To'yingan lenta kartaning
                        yarmini egallab, ekranda "gradient dog'" bo'lib
                        ko'rinardi va aynan shu rad etilgan edi. */}
                    <stop offset="0%" stopColor={band.from} stopOpacity="0.13" />
                    <stop offset="100%" stopColor={band.to} stopOpacity="0.26" />
                  </linearGradient>
                ))}
              </defs>

              {model.bands.map((band, index) => (
                <path
                  key={band.key}
                  d={band.path}
                  fill={`url(#${gradientId}-${band.key})`}
                  className={MOTION.pop}
                  style={{
                    transformOrigin: "left center",
                    animationDelay: `${delay + DELAY.content + 120 + index * 80}ms`,
                  }}
                />
              ))}
            </svg>

            {/* ── Bosqich kartochkalari ─────────────────────────────── */}
            {model.nodes.map((node) => (
              <FlowCard
                key={node.key}
                node={node}
                delay={delay + DELAY.content + node.order * 70}
              />
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};

/**
 * BOSQICH KARTOCHKASI — oqimning bitta tuguni.
 *
 * ⚠️ Rang faqat CHAP RELSDA (3px) va nuqtada. Kartochkaning o'zi oq:
 * to'ldirilgan rangli kartochka ustida matn kontrasti rangga bog'liq
 * bo'lib qolardi va och ohangda (masalan "maktab hisobidan" kulrangi)
 * o'qilmasdi. Rels esa qaysi tugun qaysi lentaga ulanishini bir xil
 * aniqlikda ko'rsatadi.
 *
 * ⚠️ Matn kartochka balandligiga qarab bosqichma-bosqich kamayadi:
 * ingichka ulushda faqat nom va summa qoladi. Uch qatorni majburan
 * sig'dirsak, ular bir-birining ustiga tushardi.
 */
const FlowCard = ({ node, delay }) => {
  const compact = node.height < 56;

  return (
    <div
      className={cn(
        "absolute flex flex-col justify-center overflow-hidden rounded-xl bg-white",
        "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_-10px_rgba(15,23,42,0.18)]",
        "transition-transform duration-300 ease-out-quint motion-safe:hover:-translate-y-0.5",
        compact ? "px-2.5 py-1.5" : "px-3 py-2",
        MOTION.enter,
      )}
      style={{
        left: `${node.left}%`,
        width: `${node.width}%`,
        top: node.y,
        height: node.height,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Chap rels — tugunning rangi. Kartochkaning ICHIDA
          (`overflow-hidden` bilan) — tashqarida bo'lsa yumaloq
          burchakdan chiqib turardi. */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: node.color }}
        aria-hidden
      />

      <p className="truncate text-[10.5px] font-medium leading-none text-slate-500">
        {node.label}
      </p>

      <p className={cn(T.value, "mt-1 truncate leading-none", compact ? "text-[14px]" : "text-[17px]")}>
        {formatMoney(node.value, { withLabel: false })}
        <span className="ml-1 text-[9.5px] font-medium text-slate-400">so'm</span>
        {/* ⚠️ Ingichka kartochkada ulush SUMMA YONIDA qoladi, uchinchi
            qator sifatida emas: 54px lik kartochkaga uch qator matn
            sig'maydi va foiz butunlay yo'qolib ketardi — holbuki
            "bu qancha ulush" degan savol aynan kichik ulushlarda
            ko'proq so'raladi. */}
        {compact && (
          <span className="ml-1.5 text-[10px] font-semibold tabular-nums text-slate-400">
            {node.share}%
          </span>
        )}
      </p>

      {!compact && (
        <p className="mt-1 text-[10px] font-semibold leading-none tabular-nums text-slate-400">
          {node.share}% · {node.meta}
        </p>
      )}
    </div>
  );
};

/**
 * OQIM MODELI — qiymatlardan geometriya.
 *
 * ⚠️ Balandlik ULUSHGA proporsional, LEKIN har bir kartochka kamida
 * `MIN_CARD` piksel oladi: 0.5% lik ulush chizilmasa, "bu holat umuman
 * yo'q" degan ma'no chiqardi. Qolgan balandlik proporsional bo'linadi,
 * shuning uchun yig'indi baribir to'g'ri qoladi.
 */
const buildModel = (flow) => {
  if (!flow) return null;

  const total = Number(flow.total) || 0;
  if (total <= 0) return null;

  const charged = Number(flow.charged) || 0;
  const waived = Number(flow.waived) || 0;
  const pending = Number(flow.pending) || 0;

  // Ikkinchi bosqich — `charged` ga normallashtiriladi (sarlavha izohi)
  const recoveredRaw = Number(flow.recovered) || 0;
  const outstandingRaw = Number(flow.outstanding) || 0;
  const chargeSum = recoveredRaw + outstandingRaw;
  const scale = chargeSum > 0 ? charged / chargeSum : 0;
  const recovered = recoveredRaw * scale;
  const outstanding = outstandingRaw * scale;

  const hasTarget = recovered + outstanding > 0;
  const layout = hasTarget ? LAYOUT_FULL : LAYOUT_SHORT;

  const shareOf = (value) => Math.round((value / total) * 100);

  // ── O'rta ustun: zararning taqdiri ──
  const middleParts = [
    { key: "charged", value: charged, color: HUE.warn, label: "Aybdorga yozilgan", meta: "undiriladi" },
    { key: "waived", value: waived, color: HUE.neutral, label: "Maktab hisobidan", meta: "qoplandi" },
    { key: "pending", value: pending, color: HUE.damageSoft, label: "Qaror kutmoqda", meta: "hal qilinmagan" },
  ].filter((part) => part.value > 0);

  const middleHeights = distribute(
    middleParts.map((part) => part.value),
    H - GAP * Math.max(0, middleParts.length - 1),
  );

  let cursor = 0;
  const middleNodes = middleParts.map((part, index) => {
    const node = {
      ...part,
      ...layout.middle,
      y: cursor,
      height: middleHeights[index],
      share: shareOf(part.value),
      order: index + 1,
    };
    cursor += middleHeights[index] + GAP;
    return node;
  });

  // ── Oxirgi ustun: undiruv natijasi ──
  const chargedNode = middleNodes.find((node) => node.key === "charged");

  const targetParts = hasTarget
    ? [
        { key: "recovered", value: recovered, color: HUE.recovery, label: "Undirilgan", meta: "kassada" },
        { key: "outstanding", value: outstanding, color: HUE.damage, label: "Qarz qoldi", meta: "undirilmagan" },
      ].filter((part) => part.value > 0)
    : [];

  const targetSpan = chargedNode?.height ?? 0;
  const targetHeights = distribute(
    targetParts.map((part) => part.value),
    Math.max(MIN_CARD, targetSpan - GAP * Math.max(0, targetParts.length - 1)),
  );

  let targetCursor = chargedNode?.y ?? 0;
  const targetNodes = targetParts.map((part, index) => {
    const node = {
      ...part,
      ...layout.target,
      y: targetCursor,
      height: targetHeights[index],
      share: shareOf(part.value),
      order: middleNodes.length + index + 1,
    };
    targetCursor += targetHeights[index] + GAP;
    return node;
  });

  const sourceNode = {
    key: "total",
    label: "Umumiy zarar",
    meta: "shu davrda",
    value: total,
    share: 100,
    color: HUE.damage,
    ...layout.source,
    y: 0,
    height: H,
    order: 0,
  };

  // ── Lentalar: manba → o'rta, keyin charged → oxirgi ustun ──
  // ⚠️ Lenta kartochkaning ICHIGA 1% kirib boradi (`- 1` / `+ 1`):
  // aynan chetiga to'xtasa, yumaloq burchak bilan kartochka orasida
  // ingichka oq tirqish ko'rinib qolardi.
  const bands = [];
  let sourceCursor = 0;

  for (const node of middleNodes) {
    bands.push({
      key: `s-${node.key}`,
      from: HUE.damage,
      to: node.color,
      path: ribbon(
        layout.source.left + layout.source.width - 1,
        sourceCursor,
        sourceCursor + node.height,
        node.left + 1,
        node.y,
        node.y + node.height,
      ),
    });
    sourceCursor += node.height + GAP * (middleNodes.length > 1 ? 0 : 0);
  }

  if (hasTarget && chargedNode) {
    for (const node of targetNodes) {
      bands.push({
        key: `m-${node.key}`,
        from: HUE.warn,
        to: node.color,
        path: ribbon(
          chargedNode.left + chargedNode.width - 1,
          node.y,
          node.y + node.height,
          node.left + 1,
          node.y,
          node.y + node.height,
        ),
      });
    }
  }

  const columns = [
    { key: "c1", title: "Zarar", left: layout.source.left },
    { key: "c2", title: "Taqdiri", left: layout.middle.left },
    ...(hasTarget ? [{ key: "c3", title: "Undiruv", left: layout.target.left }] : []),
  ];

  return { total, nodes: [sourceNode, ...middleNodes, ...targetNodes], bands, columns };
};

/**
 * Balandliklarni taqsimlaydi: har bir nol bo'lmagan ulushga kamida
 * `MIN_CARD`, qolgani proporsional.
 */
const distribute = (values, space) => {
  const sum = values.reduce((acc, value) => acc + value, 0);
  if (sum <= 0 || space <= 0) return values.map(() => 0);

  const reserved = values.length * MIN_CARD;
  const flexible = Math.max(0, space - reserved);

  return values.map((value) => MIN_CARD + (value / sum) * flexible);
};

/**
 * LENTA — ikkita bezier bilan yopilgan shakl.
 *
 * Nazorat nuqtalari ikki ustunning O'RTASIDA: shu bilan lenta chiqish
 * va kirish nuqtalarida GORIZONTAL bo'ladi va kartochkaga tik
 * "urilmaydi".
 */
const ribbon = (x0, y0Top, y0Bottom, x1, y1Top, y1Bottom) => {
  const cx = (x0 + x1) / 2;

  return [
    `M ${x0} ${y0Top}`,
    `C ${cx} ${y0Top}, ${cx} ${y1Top}, ${x1} ${y1Top}`,
    `L ${x1} ${y1Bottom}`,
    `C ${cx} ${y1Bottom}, ${cx} ${y0Bottom}, ${x0} ${y0Bottom}`,
    "Z",
  ].join(" ");
};

export default DamageFlow;
