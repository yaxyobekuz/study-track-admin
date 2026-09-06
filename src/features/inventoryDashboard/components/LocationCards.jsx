// React
import { useMemo } from "react";

// Icons
import { LayoutGrid, MapPin } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Tokens
import { DELAY, HUE, MOTION, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/* ═══════════════════════ XONALAR REYTINGI ═══════════════════════ */

/**
 * ZARAR BO'YICHA XONALAR — "qayerda ko'proq sinadi".
 *
 * ⚠️ DIAGRAMMA KUTUBXONASI ISHLATILMAYDI. Bu qator "nom + chiziq +
 * raqam" dan iborat va uni recharts bilan chizish o'q, to'r va
 * konteyner qatlamlarini olib kelardi — natijada 8 qator uchun butun
 * SVG diagramma. Oddiy `div` esa matnni to'g'ri kesadi, qatorni
 * bosiladigan qiladi va balandligi kontentga moslashadi.
 *
 * ⚠️ CHIZIQ ENG KATTA QIYMATGA nisbatan, jamiga emas: bu REYTING
 * (kim ko'proq), tarkib emas. Jamiga nisbatan chizilsa, birinchi
 * o'rindagi xona ham 12% bo'lib, hamma chiziq ko'rinmas darajada
 * qisqa bo'lardi.
 */
export const LocationRanking = ({ data, isLoading, isError, delay = 0, className }) => {
  const rows = useMemo(() => {
    const items = data?.locations?.byDamage ?? [];
    const max = Math.max(...items.map((row) => Number(row.damageAmount)), 1);

    return items.map((row) => ({
      ...row,
      amountNum: Number(row.damageAmount),
      // Chiziq eng katta qiymatga nisbatan — bu REYTING (kim ko'proq),
      // tarkib emas. Jamiga nisbatan chizilsa, birinchi o'rindagi xona
      // ham 12% bo'lib, hamma chiziq ko'rinmas darajada qisqa bo'lardi
      width: Math.max(3, (Number(row.damageAmount) / max) * 100),
      // Yaroqsizlar ULUSHI — ikkinchi, mustaqil o'lchov: zarar summasi
      // katta bo'lgani bilan xona holati yaxshi bo'lishi mumkin
      brokenShare:
        row.quantity > 0 ? Math.min(100, (row.brokenQuantity / row.quantity) * 100) : 0,
    }));
  }, [data]);

  return (
    <Panel
      title="Xonalar bo'yicha zarar"
      hint="Eng ko'p yo'qotish qayd etilgan joylar"
      icon={MapPin}
      accent="warn"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu davrda birorta xonada zarar qayd etilmagan"
      className={className}
    >
      <ol className="min-h-0 flex-1 space-y-1">
        {rows.map((row, index) => (
          <RankRow
            key={row.locationId}
            row={row}
            rank={index + 1}
            delay={delay + DELAY.content + index * 55}
          />
        ))}
      </ol>
    </Panel>
  );
};

/**
 * REYTING QATORI.
 *
 * ⚠️ TARTIB RAQAMI BOR va u bezak emas. Ilgari qatorlar faqat chiziq
 * uzunligi bilan farq qilardi va yonma-yon turgan ikki xona qaysi biri
 * oldinda ekani bir qarashda bilinmasdi — chiziqlar uzunligi yaqin
 * bo'lganda esa umuman bilinmasdi. Raqam bu savolni butunlay yopadi.
 *
 * ⚠️ BIRINCHI UCHTASI AJRATILGAN (to'q fon, oq raqam): reyting
 * ekranida ko'z avval "eng yomoni qaysi" degan savolga javob qidiradi.
 * Hammasi bir xil ko'rinishda bo'lsa, u javobni qatorlarni sanab
 * topishga majbur bo'lardi.
 *
 * ⚠️ IKKI QATLAMLI CHIZIQ: to'q qismi — zarar summasi ulushi, ustidagi
 * ingichka amber chiziq — yaroqsizlar ulushi. Ular BOSHQA savollar:
 * "bu oy qancha yo'qotdik" va "xonaning holati qanday". Bitta chiziqqa
 * qo'shilsa, ikkalasi ham yolg'on bo'lardi.
 */
const RANK_BADGE = [
  "bg-slate-900 text-white",
  "bg-slate-700 text-white",
  "bg-slate-500 text-white",
];

const RankRow = ({ row, rank, delay }) => (
  <li
    className={cn(
      "group relative rounded-xl px-2.5 py-2",
      "transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",
      MOTION.enterX,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-md",
          "text-[10px] font-bold tabular-nums",
          RANK_BADGE[rank - 1] ?? "bg-slate-100 text-slate-500",
        )}
      >
        {rank}
      </span>

      <span className={cn(T.tdName, "min-w-0 flex-1 truncate")}>{row.name}</span>

      <span className={cn(T.tdNum, "shrink-0")}>
        {formatMoney(row.amountNum, { withLabel: false })}
      </span>
    </div>

    {/* Chiziq — badge kengligicha chekinadi, shunda u nom bilan bir
        vertikalda boshlanadi va qatorlar ustma-ust tekislanadi */}
    <div className="mt-1.5 pl-[28px]">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", MOTION.growX)}
          style={{
            width: `${row.width}%`,
            background: `linear-gradient(90deg, ${HUE.warnSoft}, ${HUE.damage})`,
            animationDelay: `${delay + 90}ms`,
          }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-slate-400">
          {row.typeLabel} · {row.quantity} dona · {row.damageCount} hodisa
        </span>

        {row.brokenQuantity > 0 && (
          <span className="flex shrink-0 items-center gap-1">
            <span className="h-1 w-6 overflow-hidden rounded-full bg-amber-100">
              <span
                className="block h-full rounded-full bg-amber-500"
                style={{ width: `${Math.max(12, row.brokenShare)}%` }}
              />
            </span>
            <span className="text-[10px] font-semibold tabular-nums text-amber-600">
              {row.brokenQuantity} yaroqsiz
            </span>
          </span>
        )}
      </div>
    </div>
  </li>
);

/* ═══════════════════════ XONA TURLARI PROFILI ═══════════════════════ */

/**
 * XONA TURLARI PROFILI — ikki o'lchovli taqqoslash.
 *
 * ⚠️ RADAR DIAGRAMMASIDAN VOZ KECHILDI. Radar uchta shartni birdan
 * talab qiladi: kamida uchta o'q, o'xshash kattalikdagi qiymatlar va
 * o'quvchining shakl bilan ishlash ko'nikmasi. Maktabda esa xona
 * turlari ikkitadan oltitagacha bo'ladi — ikkita turda radar
 * CHIZILMAYDI ham, va o'sha paytda kartada "Profil uchun kamida uchta
 * xona turi kerak" degan kulrang jumla bo'm-bo'sh oq maydonda turardi.
 * Ekran buzilgandek ko'rinardi, holbuki ma'lumot bor edi.
 *
 * Endi har bir tur — QATOR, ikkita o'lchov esa ikkita chiziq:
 * yaroqlilik (teal) va monitoring intizomi (indigo). Bu shakl ikkita
 * turda ham, oltitasida ham bir xil ishlaydi va taqqoslash to'g'ridan-
 * to'g'ri gorizontal bo'ylab o'qiladi — radar shaklini "ochish" kerak
 * emas.
 *
 * ⚠️ IKKALA O'LCHOV HAM FOIZDA (0..100) — bu majburiy: ular bitta
 * o'qni bo'lishadi. Zarar summasi bu yerga QO'SHILMAYDI, u so'mda
 * o'lchanadi va yonidagi reyting kartasida turadi.
 */
export const LocationRadar = ({ data, isLoading, isError, delay = 0, className }) => {
  const rows = useMemo(() => {
    const types = data?.locations?.types ?? [];

    // Eng katta oltita tur — undan ortig'ida qatorlar kartaga sig'maydi
    return types.slice(0, 6).map((row) => ({
      ...row,
      health: Math.max(0, Math.min(100, row.healthRate ?? 0)),
      discipline: Math.max(0, Math.min(100, row.checkRate ?? 0)),
    }));
  }, [data]);

  return (
    <Panel
      title="Xona turlari profili"
      hint="Yaroqlilik va monitoring intizomi kesimi"
      icon={LayoutGrid}
      accent="monitor"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Xatlovda xona yo'q — kesim ham bo'sh"
      className={className}
      action={<ProfileLegend />}
    >
      <ul className="min-h-0 flex-1 space-y-2.5">
        {rows.map((row, index) => (
          <ProfileRow
            key={row.type}
            row={row}
            delay={delay + DELAY.content + index * 60}
          />
        ))}
      </ul>
    </Panel>
  );
};

/** Afsona — sarlavhaning o'ng tomonida, ikki nuqta. */
const ProfileLegend = () => (
  <div className="flex items-center gap-3">
    {[
      { label: "Yaroqlilik", color: HUE.base },
      { label: "Intizom", color: HUE.monitor },
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
 * TUR QATORI — nomi, ikki chiziq va ikki foiz.
 *
 * ⚠️ Chiziqlar USTMA-UST emas, KETMA-KET: ular bir xil o'lchovda emas
 * ("yaroqli jihozlar" va "berilgan hisobotlar" — boshqa maxrajlar).
 * Bitta relsda ustma-ust chizilsa, "birinchisi ikkinchisining ichida"
 * degan yolg'on ma'no chiqardi.
 *
 * ⚠️ Foiz chiziqning YONIDA turadi, ustida emas: 4px balandlikdagi
 * chiziq ichiga raqam sig'maydi, ustiga qo'yilsa esa qator balandligi
 * ikki barobar oshardi.
 */
const ProfileRow = ({ row, delay }) => (
  <li
    className={cn(
      "rounded-xl px-2.5 py-2 transition-colors duration-200 ease-out-quint hover:bg-slate-50/80",
      MOTION.enterX,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-baseline justify-between gap-2">
      <span className={cn(T.tdName, "truncate")}>{row.label}</span>
      <span className="shrink-0 text-[10px] font-medium text-slate-400">
        {row.locations} ta xona · {row.quantity} dona
      </span>
    </div>

    <div className="mt-1.5 space-y-1">
      <MetricLine value={row.health} color={HUE.base} delay={delay + 80} />
      <MetricLine value={row.discipline} color={HUE.monitor} delay={delay + 140} />
    </div>
  </li>
);

/** Bitta o'lchov chizig'i: rels, to'ldirish va foiz. */
const MetricLine = ({ value, color, delay }) => (
  <div className="flex items-center gap-2">
    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full", MOTION.growX)}
        style={{
          width: `${Math.max(1.5, value)}%`,
          background: color,
          animationDelay: `${delay}ms`,
        }}
      />
    </div>

    <span className="w-[34px] shrink-0 text-right text-[10px] font-semibold tabular-nums text-slate-500">
      {Math.round(value)}%
    </span>
  </div>
);
