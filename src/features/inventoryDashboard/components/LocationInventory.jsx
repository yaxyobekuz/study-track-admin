// React
import { useMemo, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowRight, ChevronDown, DoorOpen } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import { DELAY, HUE, MOTION, SURFACE, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/* ═══════════════════════ XONALAR KESIMI ═══════════════════════ */

/**
 * XONALAR KESIMI — "qayerda nima bor va qanday holatda".
 *
 * Dashboarddagi qolgan xona bloklaridan FARQI shunda: ular REYTING
 * ("qayerda ko'proq sinadi", "qaysi turda intizom past"), bu esa
 * XATLOVNING O'ZI — har bir xona uchun uchta raqam: mavjud, yaroqli,
 * yaroqsiz. Rahbar ekranida bu ikki savol bir-birini almashtira
 * olmaydi: reyting sakkizta xonani ko'rsatadi va yaxshi ishlayotgan
 * xona u yerda umuman uchramaydi.
 *
 * ⚠️ BLOK BOSILADI va bu uning asosiy vazifasi. Har bir plitka —
 * xatlovning O'SHA XONA bo'yicha filtrlangan ko'rinishiga havola
 * (`/inventory/stock?locationId=...`). Dashboard "muammo bor" deb
 * aytadi, xatlov esa "aynan qaysi jihoz" deb javob beradi — ikkalasi
 * orasida qo'lda filtr tanlash bosqichi bo'lmasligi kerak.
 *
 * ⚠️ HAVOLA RUXSATGA BOG'LIQ (`inventory.view`). Ruxsati yo'q xodimga
 * plitka oddiy karta bo'lib qoladi: bosiladigan ko'rinishda chizib,
 * keyin bo'sh sahifaga olib borish "tizim buzuq" degan taassurot
 * qoldirardi (tab ham xuddi shu kalit bilan yashiriladi).
 *
 * ⚠️ XATLOVI BO'SH XONA ALOHIDA BELGILANADI. Nol yaroqsiz "hammasi
 * joyida" degan ma'noni beradi, holbuki u yerda shunchaki MA'LUMOT
 * YO'Q. Ikkalasi bir xil ko'rinsa, to'ldirilmagan xona hech qachon
 * ko'zga tashlanmasdi.
 */

/** Xatlov sahifasi — plitkaning manzili. */
const STOCK_PATH = "/inventory/stock";

/** Yig'ilgan holatda ko'rinadigan plitkalar (to'rning ikki qatori). */
const VISIBLE = 8;

/**
 * Saralash tanlagichi shu sondan ORTIQ xona bo'lgandagina chiziladi.
 * Uchtagacha ro'yxatda tartib almashuvi ko'zga tashlanmaydi va tugma
 * ishlamayotgandek ko'rinadi (`action` yonidagi izoh).
 */
const SORT_THRESHOLD = 3;

/**
 * SARALASH — uchta savol, uchta tartib.
 *
 * ⚠️ Sukut bo'yicha YAROQSIZ: dashboard signal ekrani, ya'ni birinchi
 * ko'rinadigan xona e'tibor talab qiladigani bo'lishi kerak. Alifbo
 * tartibi "xonani topish" uchun kerak va u ham bor — lekin u ikkinchi
 * savol.
 */
const SORTS = [
  { value: "broken", label: "Yaroqsiz" },
  { value: "quantity", label: "Mavjud" },
  { value: "name", label: "Nom" },
];

const COMPARATORS = {
  broken: (a, b) => b.brokenQuantity - a.brokenQuantity || b.quantity - a.quantity,
  quantity: (a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "uz"),
  name: (a, b) => a.name.localeCompare(b.name, "uz"),
};

export const LocationInventory = ({ data, isLoading, isError, delay = 0, className }) => {
  const { can } = usePermissions();
  const canOpenStock = can("inventory.view");

  const [sort, setSort] = useState("broken");
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const all = data?.locations?.all ?? [];
    return [...all].sort(COMPARATORS[sort] ?? COMPARATORS.broken);
  }, [data, sort]);

  // ⚠️ Jami SERVERDAN keladi, ko'rinib turgan plitkalardan emas: ro'yxat
  // yig'ilgan holatda sakkizta bo'ladi va "jami" o'sha sakkiztaning
  // yig'indisi bo'lib qolardi
  const totals = data?.locations?.totals;

  const visible = expanded ? rows : rows.slice(0, VISIBLE);
  const hidden = rows.length - visible.length;

  return (
    <Panel
      title="Xonalar kesimi"
      hint="Har bir xonada nima bor: mavjud, yaroqli, yaroqsiz"
      icon={DoorOpen}
      accent="base"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Xatlovda xona yo'q — kesim ham bo'sh"
      className={className}
      // ⚠️ SARALASH TANLAGICHI KAM XONADA CHIZILMAYDI. Ikki-uch xonada
      // uchala tartib deyarli bir xil ro'yxat beradi va tugma "bosdim,
      // hech narsa o'zgarmadi" degan taassurot qoldiradi — ya'ni
      // boshqaruv o'zi haqida yolg'on va'da beradi. Tanlagich faqat
      // ro'yxat uzayganda, ya'ni tartib haqiqatan ma'noga ega
      // bo'lganda paydo bo'ladi.
      action={
        rows.length > SORT_THRESHOLD ? (
          <SortSwitch value={sort} onChange={setSort} />
        ) : null
      }
    >
      {totals && (
        <TotalsStrip totals={totals} canOpenStock={canOpenStock} delay={delay} />
      )}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map((row, index) => (
          <LocationTile
            key={row.locationId}
            row={row}
            clickable={canOpenStock}
            delay={delay + DELAY.content + Math.min(index, 8) * 45}
          />
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-xl py-2",
            "text-[11px] font-semibold text-slate-500",
            "transition-colors duration-200 ease-out-quint hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          Yana {hidden} ta xona
          <ChevronDown className="size-3.5" />
        </button>
      )}
    </Panel>
  );
};

/**
 * SARALASH TANLAGICHI — segmentli, uchta variant.
 *
 * ⚠️ `Select` EMAS: uchta qisqa variant ochiladigan ro'yxatda ikki
 * bosishni talab qilardi, holbuki ular yonma-yon sig'adi va tanlangani
 * ko'rinib turadi.
 */
const SortSwitch = ({ value, onChange }) => (
  <div className="flex items-center gap-0.5 rounded-lg bg-slate-100/80 p-0.5">
    {SORTS.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-[7px] px-2 py-1 text-[10.5px] font-semibold",
          "transition-colors duration-200 ease-out-quint",
          value === option.value
            ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
            : "text-slate-500 hover:text-slate-900",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * JAMI — to'rtta plitka.
 *
 * ⚠️ "Yaroqsiz" plitkasi HAVOLA va u xatlovni butun maktab bo'yicha
 * yaroqsizlar filtri bilan ochadi (`?onlyBroken=true`). Xona plitkasi
 * bitta xonaga olib boradi, bu esa "hamma yaroqsizlar bir ro'yxatda"
 * degan savolga javob beradi — ikkalasi ham amalda kerak bo'ladi.
 */
const TotalsStrip = ({ totals, canOpenStock, delay }) => {
  const tiles = [
    {
      label: "Xonalar",
      value: `${totals.locations} ta`,
      hint:
        totals.empty > 0
          ? `${totals.empty} tasida xatlov yo'q`
          : "hammasida xatlov bor",
      tone: totals.empty > 0 ? "text-amber-600" : "text-slate-400",
      to: canOpenStock ? STOCK_PATH : null,
    },
    {
      label: "Mavjud",
      value: `${totals.quantity} dona`,
      hint: `${formatMoney(totals.value, { withLabel: false })} so'm`,
      tone: "text-slate-400",
      to: canOpenStock ? STOCK_PATH : null,
    },
    {
      label: "Yaroqli",
      value: `${totals.serviceableQuantity} dona`,
      // ⚠️ `healthRate` maxraj nol bo'lsa `null` qaytadi (server:
      // `rateOf`) — "0% yaroqlilik" bilan bir xil EMAS: birinchisi
      // "ma'lumot yo'q", ikkinchisi "hammasi singan"
      hint:
        totals.healthRate == null
          ? "xatlov hali bo'sh"
          : `${Math.round(totals.healthRate)}% yaroqlilik`,
      valueClass: "text-teal-600",
      tone: "text-slate-400",
      to: canOpenStock ? STOCK_PATH : null,
    },
    {
      label: "Yaroqsiz",
      value: `${totals.brokenQuantity} dona`,
      hint: totals.brokenQuantity > 0 ? "ro'yxatni ochish" : "yaroqsiz jihoz yo'q",
      valueClass: totals.brokenQuantity > 0 ? "text-amber-600" : "text-slate-400",
      tone: "text-slate-400",
      to: canOpenStock && totals.brokenQuantity > 0
        ? `${STOCK_PATH}?onlyBroken=true`
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {tiles.map((tile, index) => (
        <TotalTile
          key={tile.label}
          {...tile}
          delay={delay + DELAY.content + index * 40}
        />
      ))}
    </div>
  );
};

const TotalTile = ({ label, value, hint, tone, valueClass, to, delay }) => {
  const Wrapper = to ? Link : "div";

  return (
    <Wrapper
      {...(to ? { to } : {})}
      className={cn(
        SURFACE.tile,
        to && SURFACE.tileHover,
        "block px-3 py-2.5",
        MOTION.enterX,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={T.label}>{label}</p>
      <p className={cn(T.value, T.sizeMd, "mt-1.5", valueClass)}>{value}</p>
      <p className={cn("mt-1 truncate text-[10px] font-medium", tone)}>{hint}</p>
    </Wrapper>
  );
};

/**
 * XONA PLITKASI.
 *
 * ⚠️ CHIZIQ TARKIBNI ko'rsatadi (yaroqli + yaroqsiz = mavjud), reyting
 * emas: shuning uchun u xonaning O'Z miqdoriga nisbatan to'ldiriladi,
 * eng katta xonaga emas. Aks holda kichkina xonadagi 100% yaroqsizlik
 * ekranda ingichka chiziq bo'lib ko'rinardi.
 *
 * ⚠️ YAROQSIZ ULUSH 2% dan kam bo'lsa ham ko'rinadigan qilib
 * chiziladi: 400 tadan 1 tasi 0.25% bo'ladi va pikselga ham
 * tushmasdi, holbuki aynan shu bitta dona uchun blok ochiladi.
 */
const LocationTile = ({ row, clickable, delay }) => {
  const isEmpty = row.quantity === 0;

  const brokenShare = isEmpty ? 0 : (row.brokenQuantity / row.quantity) * 100;
  const brokenWidth = row.brokenQuantity > 0 ? Math.max(2, brokenShare) : 0;
  const serviceableWidth = isEmpty ? 0 : Math.max(0, 100 - brokenWidth);

  const Wrapper = clickable ? Link : "div";

  return (
    <Wrapper
      {...(clickable
        ? {
            to: `${STOCK_PATH}?locationId=${row.locationId}`,
            title: `${row.name} — xatlovni ochish`,
          }
        : { title: row.name })}
      className={cn(
        "group block px-3 py-2.5 text-left",
        SURFACE.tile,
        clickable && SURFACE.tileHover,
        MOTION.enterX,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Nom va turi ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn(T.tdName, "truncate")}>{row.name}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
            {row.typeLabel}
            {!isEmpty && ` · ${row.itemCount} xil jihoz`}
          </p>
        </div>

        {clickable && (
          <ArrowRight
            className={cn(
              "size-3.5 shrink-0 text-slate-300",
              "transition-all duration-200 ease-out-quint",
              "group-hover:translate-x-0.5 group-hover:text-slate-500",
            )}
          />
        )}
      </div>

      {/* ── Uchta raqam ── */}
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <Figure label="Mavjud" value={row.quantity} className="text-slate-900" />
        <Figure
          label="Yaroqli"
          value={row.serviceableQuantity}
          className={isEmpty ? "text-slate-300" : "text-teal-600"}
        />
        <Figure
          label="Yaroqsiz"
          value={row.brokenQuantity}
          className={row.brokenQuantity > 0 ? "text-amber-600" : "text-slate-300"}
        />
      </div>

      {/* ── Tarkib chizig'i ── */}
      <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        {!isEmpty && (
          <>
            <span
              className={cn("h-full", MOTION.growX)}
              style={{
                width: `${serviceableWidth}%`,
                background: HUE.base,
                animationDelay: `${delay + 90}ms`,
              }}
            />
            <span
              className={cn("h-full", MOTION.growX)}
              style={{
                width: `${brokenWidth}%`,
                background: HUE.warn,
                animationDelay: `${delay + 90}ms`,
              }}
            />
          </>
        )}
      </div>

      {/* ── Pastki qator: qiymat yoki "xatlov yo'q" ── */}
      <p
        className={cn(
          "mt-1.5 truncate text-[10px] font-medium",
          isEmpty ? "text-amber-600" : "text-slate-400",
        )}
      >
        {isEmpty
          ? "Xatlov kiritilmagan"
          : `${formatMoney(row.value, { withLabel: false })} so'm`}
      </p>
    </Wrapper>
  );
};

/** Bitta raqam — yorlig'i ustida, o'zi ostida. */
const Figure = ({ label, value, className }) => (
  <div className="min-w-0">
    <p className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-slate-400">
      {label}
    </p>
    <p className={cn("mt-0.5 text-[15px] font-semibold tabular-nums", className)}>
      {value}
    </p>
  </div>
);

export default LocationInventory;
