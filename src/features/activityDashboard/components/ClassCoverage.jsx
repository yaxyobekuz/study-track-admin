// Icons
import { ChevronRight, School } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { BAR, CHIP, MOTION, ROW, T, contentDelay, pct } from "../data/pulse.tokens";

// Components
import Panel from "./Panel";

/**
 * QAMROV OSTONALARI — chip ohangini shu ikki son hal qiladi.
 *
 * ⚠️ Raqamlar JSX ichida emas, shu yerda turadi va ular BIZNES qarori,
 * bezak emas:
 *
 *   70% — shu chegaradan yuqorida sinfga yuborilgan xabar HAQIQATAN
 *         yetib boradi: bog'langan ota-onalarning uchdan ikkisidan
 *         ko'pi botni ochadi, ya'ni e'lonni tarqatish uchun qo'shimcha
 *         qo'ng'iroq kerak emas.
 *   40% — bu chegaradan pastda bog'langanlarning KO'PCHILIGI jim,
 *         demak xabar emas, sinf rahbarining qo'ng'irog'i ishlaydi.
 *
 * Oraliq (40–70) — "ishlaydi, lekin ishonib bo'lmaydi": ogohlantirish.
 */
const RATE_GOOD = 70;
const RATE_WARN = 40;

/**
 * Foizni chip ohangiga aylantiradi.
 *
 * ⚠️ `null` uchun `neutral`: qamrov nolga TENG bo'lishi bilan
 * qamrovni HISOBLAB bo'lmasligi (bog'langan hisob yo'q) — ikki xil
 * holat, ikkalasini ham qizil chizsak, ekran bo'sh sinflar bilan
 * qip-qizil bo'lib ketardi.
 */
const rateTone = (rate, hasDenominator = true) => {
  // ⚠️ MAXRAJ NOLGA TENG BO'LSA — `neutral`, `alert` EMAS. Server
  // `rate()` funksiyasi nol maxrajda `null` emas, **0** qaytaradi
  // (`activityDashboard.service.js`), ya'ni faqat `rate == null` ni
  // tekshirish YETARLI EMAS edi: birorta ota-onasi botga ulanmagan
  // sinf qip-qizil "0%" bo'lib chiqardi. Aslida u yerda o'lchanadigan
  // narsaning O'ZI yo'q — bu muammo emas, ma'lumot yo'qligi.
  if (!hasDenominator) return "neutral";
  if (rate == null || Number.isNaN(rate)) return "neutral";
  if (rate >= RATE_GOOD) return "good";
  if (rate >= RATE_WARN) return "warn";
  return "alert";
};

/**
 * QATOR RELSI — chip ohangining rels ko'rinishidagi juftligi.
 *
 * ⚠️ Bitta ohang IKKI joyda takrorlanadi (chip + chap rels) va bu
 * ataylab: chip raqamning YONIDA turadi, rels esa qatorning CHETIDA —
 * ro'yxatni tepadan pastga ko'z bilan yugurib chiqqanda foizni
 * o'qimasdan ham "qayerda qizil bor" ko'rinadi.
 */
const RAIL_TONE = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  alert: "bg-rose-500",
  neutral: "bg-slate-300",
};

/** Bar kengligi uchun foizni 0..100 oralig'iga qisadi. */
const clampPct = (value) => Math.min(100, Math.max(0, Number(value) || 0));

/**
 * ⚠️ KIRISH ANIMATSIYASI QADAMI CHEKLANGAN. Sinflar soni yigirmadan
 * oshganda har qatorga to'liq qadam berilsa, oxirgi qator bir necha
 * soniya kutib turardi — ro'yxat "yuklanmayapti" bo'lib ko'rinadi.
 * O'ninchi qatordan keyin hammasi bir vaqtda kiradi.
 */
const STAGGER_CAP = 10;

/**
 * SINFLAR KESIMI — "bu sinfda 25 ta ota-onadan 20 tasi botdan
 * foydalanadi" degan savolning ekrandagi javobi.
 *
 * ⚠️ QAYTA SARALANMAYDI. Server `classes` ni ENG YOMONI BIRINCHI
 * tartibida beradi va shu tartib saqlanadi: qamrov ro'yxati alifbo
 * bo'yicha turganda foydalanuvchi o'n beshta sinfni ko'zi bilan
 * taqqoslashga majbur bo'lardi, holbuki unga kerak bo'lgani — birinchi
 * uchtasi. Bu yerda `sort` chaqirilsa, serverdagi tartib qoidasi
 * jimgina bekor bo'lardi.
 *
 * @param {object} props
 * @param {object} props.data - butun `activity/overview` javobi
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {(classId: string) => void} [props.onSelectClass] - qator bosilganda
 * @param {string} [props.className]
 */
const ClassCoverage = ({
  data,
  isLoading,
  isError,
  delay = 0,
  onSelectClass,
  className,
}) => {
  const rows = data?.classes ?? [];

  return (
    <Panel
      title="Sinflar kesimi"
      hint="Ota-onalar qamrovi — eng past ko'rsatkichdan boshlab"
      icon={School}
      tone="bot"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Sinflar bo'yicha ma'lumot yo'q"
      className={className}
    >
      {/* ⚠️ Ro'yxat KARTA ICHIDA suriladi, sahifa emas: sinf soni
          o'ndan oshganda blokning balandligi qo'shni bloklarni pastga
          surib yuborar va bento to'ri buzilardi.

          ⚠️ Qatorlar orasidagi ajratuvchi `ROW.list` dan keladi va u
          `-mx-5` bilan karta CHETIGACHA cho'ziladi: ilgari qatorlar
          faqat hover'da ajralar, sichqoncha turmagan holatda esa oq
          fonda matn oqimi bo'lib qolar edi */}
      <ul className={cn(ROW.list, ROW.scroll, "min-h-0 flex-1")}>
        {rows.map((row, index) => (
          <ClassRow
            key={row.id ?? "unassigned"}
            row={row}
            delay={contentDelay(delay, Math.min(index, STAGGER_CAP))}
            onSelect={onSelectClass}
          />
        ))}
      </ul>
    </Panel>
  );
};

/**
 * BITTA SINF QATORI — sarlavha + ikki qatlamli bar + izoh.
 *
 * ⚠️ IKKI QATLAM = IKKI XIL MAXRAJ va bu ataylab:
 *
 *   och violet (orqa)  = `linkRate` → maxraj O'QUVCHILAR:
 *                        sinfdagi nechta o'quvchining ota-onasi
 *                        umuman botga bog'langan;
 *   to'q violet (old)  = `rate`     → maxraj BOG'LANGAN HISOBLAR:
 *                        bog'langanlarning nechtasi haqiqatan faol.
 *
 * Shuning uchun old qatlam orqa qatlamdan UZUNROQ bo'lishi mumkin va
 * bu xato emas — ular bitta relsdagi ikki boshqa o'lchov. Bittasini
 * ikkinchisining ichiga joylashtirib "ulushning ulushi" qilib
 * chizsak, raqam yolg'on bo'lardi: 5 ta bog'langan hisobning 4 tasi
 * faol bo'lgani "sinfning 80% i faol" degani EMAS. Aynan shu sababli
 * bar ostida maxrajni ochiq aytadigan izoh turadi.
 */
const ClassRow = ({ row, delay, onSelect }) => {
  const tone = rateTone(row.rate, (row.linked ?? 0) > 0);

  // Sinfsizlar qatori — o'z shakli bo'yicha boshqalardan farq qilmaydi
  // (u ham xuddi shunday muammoli bo'lishi mumkin), faqat nomi kursivda:
  // "Sinfsiz" — sinf NOMI emas, guruh yorlig'i
  const isUnassigned = row.id == null;

  // ⚠️ "Sinfsiz" qatori BOSILMAYDI: uning ortida `id` yo'q, ya'ni
  // ochiladigan sinf ham yo'q. Uni ham bosiladigan qilib qo'ysak,
  // foydalanuvchi bosib, hech narsa ochilmasligini ko'rardi
  const isClickable = typeof onSelect === "function" && !isUnassigned;
  const Row = isClickable ? "button" : "div";

  return (
    <li className={MOTION.enterUp} style={{ animationDelay: `${delay}ms` }}>
      <Row
        {...(isClickable
          ? { type: "button", onClick: () => onSelect(row.id) }
          : {})}
        className={cn(
          ROW.base,
          ROW.hover,
          isClickable && cn(ROW.clickable, "ring-violet-400/60"),
        )}
      >
        {/* Chap aksent — qamrov ohangida, faqat hover/fokusda ochiladi */}
        <span aria-hidden="true" className={cn(ROW.rail, RAIL_TONE[tone])} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(T.tdName, "truncate", isUnassigned && "italic")}>
              {row.name}
            </span>

            {/* Raqamlar O'NGGA tekislanadi: qatordan qatorga bir
                ustunda tursa, ko'z ularni taqqoslay oladi */}
            <div className="ml-auto flex shrink-0 items-baseline gap-2">
              {/* ⚠️ Ohang tokendan (amber — "e'tibor"), o'lcham va vazn esa
                  `T.meta` dan: bu yerda YANGI tipografiya emas, mavjud
                  darajaning signal rangi */}
              {row.silent > 0 && (
                <span className={cn(T.meta, "text-amber-600")}>
                  {row.silent} jim
                </span>
              )}

              <span className={T.tdNum}>
                {row.active ?? 0} / {row.linked ?? 0}
              </span>

              <span
                className={cn(CHIP.base, CHIP.tone[tone], "tabular-nums")}
              >
                {pct(row.rate)}
              </span>
            </div>
          </div>

          {/* ⚠️ `aria-hidden`: bar yuqoridagi raqamlar va pastdagi izohning
              takrori — ekran o'quvchiga uchinchi marta aytilmaydi */}
          <div aria-hidden="true" className={cn(BAR.track, "mt-1.5 w-full")}>
            <span
              className={cn(BAR.fill, "bg-violet-100")}
              style={{
                width: `${clampPct(row.linkRate)}%`,
                animationDelay: `${delay}ms`,
              }}
            />
            {/* Old qatlam ORQASIDAN keyin to'ladi: ikkalasi bir vaqtda
                o'ssa, ular bitta qalin chiziq bo'lib ko'rinardi.

                ⚠️ Yorug'lik bandi (`BAR.sheen`) FAQAT shu qatlamda:
                `rate` — kartaning asosiy ko'rsatkichi. Orqa qatlamga
                ham qo'yilsa, bitta relsda ikkita harakat raqobatlashib,
                ikkalasi ham ma'nosini yo'qotardi */}
            <span
              className={cn(BAR.fill, "bg-violet-500")}
              style={{
                width: `${clampPct(row.rate)}%`,
                animationDelay: `${delay + 90}ms`,
              }}
            >
              <span aria-hidden="true" className={BAR.sheen} />
            </span>
          </div>

          <p className={cn(T.meta, "mt-1 text-slate-400")}>
            {row.linkedStudents ?? 0}/{row.students ?? 0} bog'langan
          </p>
        </div>

        {isClickable && (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 text-slate-300",
              "transition-[transform,color] duration-200 ease-out-quint",
              "group-hover:translate-x-0.5 group-hover:text-slate-400",
            )}
            strokeWidth={2.2}
          />
        )}
      </Row>
    </li>
  );
};

export default ClassCoverage;
