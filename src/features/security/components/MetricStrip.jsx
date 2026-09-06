// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import { useCountUp } from "@/shared/hooks/useCountUp";

// Tokens
import { DELAY, MOTION, RAIL, SURFACE, T, metricDelay } from "../data/sentinel.tokens";

/**
 * KPI LENTA — heroning ostidagi oltita plitka (`data.metrics`).
 *
 * ⚠️ FAOLLIK BO'LIMIDAGI LENTA BILAN AYNAN BIR XIL SHAKL (bir xil to'r,
 * bir xil plitka ichki bo'shlig'i, bir xil xoreografiya). Ikki bo'lim
 * qo'shni va foydalanuvchi ular orasida tez-tez o'tadi: plitka boshqa
 * o'lchamda bo'lsa, ekran o'tish paytida "sakrab" ketardi. Farq faqat
 * RANG O'QIDA — u yerda rels KANALNI (bot / panel), bu yerda
 * JIDDIYLIKNI kodlaydi (`alert | warn | session | success | device |
 * neutral`).
 *
 * ⚠️ DELTA CHIPI YO'Q va bu shaklning kamchiligi emas, QAROR. Javobda
 * `previous` maydonining o'zi yo'q, chunki xavfsizlikda "o'tgan davrga
 * nisbatan" o'lchovi CHALG'ITUVCHI: bitta jiddiy hodisa o'ntadan
 * muhimroq, ya'ni "ogohlantirishlar 40% kamaydi" degan yashil chip
 * qolgan bitta `critical` qatorni ko'zdan yashirardi. Bu yerda savol
 * "kamaydimi" emas, "hozir nol emasmi".
 *
 * ⚠️ RO'YXAT SERVERDAN KELADI, bu yerda QATTIQ YOZILMAYDI. Yorliq,
 * ohang va "yaxshi yo'nalish" — biznes qarori va u
 * `securityDashboard.service.js` da turadi.
 *
 * @param {object} props
 * @param {object} [props.data] - butun overview obyekti
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {number} [props.delay=0] - xoreografiyaning boshlanishi (ms)
 * @param {string} [props.className]
 */
const MetricStrip = ({ data, isLoading = false, isError = false, delay = 0, className }) => {
  const metrics = data?.metrics ?? [];

  // ⚠️ `delay` — xoreografiyaning BOSHLANISHI, plitkalar orasidagi qadam
  // emas: sahifa lentani boshqa o'ringa qo'ysa, faqat boshlanish nuqtasi
  // suriladi, ketma-ketlik esa tokendagi `metricDelay` da qoladi.
  const tileDelay = (index) =>
    delay ? delay + index * DELAY.metricStep : metricDelay(index);

  // Bo'sh massiv ham plitka bilan chiziladi: lenta ekranning tuzilishini
  // ushlab turadi, aks holda hero ostidagi qator to'satdan yo'qolardi.
  if (isLoading || isError || metrics.length === 0) {
    return (
      <div className={cn(GRID, className)}>
        {Array.from({ length: 6 }, (_, index) => (
          <MetricPlaceholder key={index} isLoading={isLoading} delay={tileDelay(index)} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(GRID, className)}>
      {metrics.map((metric, index) => (
        <MetricTile key={metric.key} metric={metric} delay={tileDelay(index)} />
      ))}
    </div>
  );
};

/** To'r — 2 → 3 → 6 ustun. Oltitasi faqat keng ekranda bitta qatorga sig'adi. */
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6";

/**
 * Plitka ichki bo'shlig'i.
 *
 * ⚠️ Chapdan kengroq (`pl-4`): 3px signal relsi kartaning chap qirrasida
 * turadi va matn unga tegib ketmasligi kerak.
 */
const TILE = "py-3.5 pl-4 pr-3.5";

/**
 * "Bu yerda nol bo'lishi kerak edi" rangi.
 *
 * ⚠️ Tokens faylga QO'ShILMADI: bu yangi tipografiya darajasi emas,
 * `T.value` ustidagi HOLAT qatlami (bitta rang almashtirish). Beshta
 * daraja shkalasiga oltinchi qator qo'shilsa, u "qachon ishlatiladi"
 * degan savolni tug'dirardi, javob esa faqat shu lentaga tegishli.
 */
const ALERT_VALUE = "text-rose-600";

/** Butun sonlarni guruhlash uchun formatter — "12 480". */
// ⚠️ Formatter modul darajasida bir marta yaratiladi: `Intl.NumberFormat`
// konstruktori qimmat va u har sanoq kadrida qayta chaqirilsa, count-up
// sekinlashardi.
const wholeFormatter = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 });

/**
 * Ko'rsatkich qiymatini matnga aylantiradi.
 *
 * ⚠️ Foiz NUQTA bilan (`4.3`), dona esa guruhlangan butun son —
 * faollik lentasi bilan bir xil qoida, aks holda ikki qo'shni bo'limda
 * ikki xil kasr ajratgichi ko'rinardi.
 *
 * @param {number|null} value
 * @param {number} decimals
 * @returns {string} - bo'sh qiymatda em-dash
 */
const formatMetric = (value, decimals) => {
  if (value == null || !Number.isFinite(value)) return "—";
  return decimals > 0 ? value.toFixed(decimals) : wholeFormatter.format(Math.round(value));
};

/**
 * BITTA PLITKA.
 *
 * ⚠️ Kasr xonasi QAT'IY: foizda bitta, donada nol. Sanoq davomida xona
 * soni o'zgarsa (`9.5` → `94`), raqamning kengligi sakrab turardi.
 *
 * ⚠️ RAQAM QIZIL BO'LADI, agar server "o'sishi yomon" desa
 * (`higherIsBetter === false`) VA qiymat noldan katta bo'lsa. Ma'nosi:
 * "bu yerda nol bo'lishi kerak edi". Nolda qizil BERILMAYDI — nol
 * aynan kutilgan holat va uni qizil qilish "hamma narsa shoshilinch"
 * degan, ya'ni hech narsa shoshilinch emas degan natijani berardi.
 *
 * ⚠️ `higherIsBetter === null` — kontekst raqami (ochiq seanslar, noyob
 * qurilmalar): u yaxshi ham, yomon ham emas va hech qachon bo'yalmaydi.
 *
 * ⚠️ Rang YAGONA belgi emas: qizil qiymat yonida ekran o'qigich uchun
 * yashirin izoh turadi va relsning ohangi ham `alert`/`warn` bo'ladi.
 */
const MetricTile = ({ metric, delay }) => {
  const { label, value, unit, tone, hint, higherIsBetter } = metric;

  const decimals = unit === "%" ? 1 : 0;
  const counted = useCountUp(Number.isFinite(value) ? value : null, { decimals });

  // ⚠️ Baho SANALGAN qiymatdan emas, YAKUNIY qiymatdan olinadi: count-up
  // noldan boshlangani uchun rang animatsiya davomida qizildan qoraga
  // (yoki teskarisiga) sakrab turardi.
  const isBad = higherIsBetter === false && Number.isFinite(value) && value > 0;

  return (
    <article
      className={cn(SURFACE.card, TILE, MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Signal relsi — bezak emas, ko'rsatkichning jiddiyligi */}
      <span
        aria-hidden="true"
        className={cn(RAIL.base, RAIL.tone[tone] ?? RAIL.tone.neutral)}
      />

      <p className={cn(T.label, "truncate")}>{label}</p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1.5">
        <span className={cn(T.value, T.sizeXl, isBad && ALERT_VALUE)}>
          {formatMetric(counted, decimals)}
        </span>

        {/* ⚠️ Foiz belgisi raqamning DAVOMI, ikkinchi raqam emas: kichik
            va kulrang bo'lgani uchun ko'z avval sonni, keyin birlikni
            o'qiydi. Qizil holatda ham u bo'yalmaydi — e'tibor SONDA. */}
        {unit === "%" && <span className={cn(T.meta, "text-slate-400")}>%</span>}

        {isBad && <span className="sr-only">e'tibor talab qiladi</span>}
      </div>

      {/* Izoh — raqamning maxraji ("3 ta urinish 128 tadan") */}
      <p className={cn(T.meta, "mt-1.5 truncate")}>{hint || "—"}</p>
    </article>
  );
};

/**
 * YUKLANISH VA XATO PLITKASI — kontent plitkasi bilan AYNAN bir o'lchamda.
 *
 * ⚠️ Skelet qatorlari kontentning qatorlari balandligiga qo'yilgan
 * (yorliq 16px, raqam 21px, izoh 16px): aks holda ma'lumot kelganda
 * lenta bir necha piksel "sakrab", ostidagi butun to'rni surib
 * qo'yardi.
 *
 * ⚠️ Jimirlash FAQAT yuklanishda. Jimirlash — "kelmoqda" degan va'da;
 * xatoda hech narsa kelmaydi va u yerda tinch em-dash turadi.
 *
 * ⚠️ Rels har doim NEYTRAL: ohang ma'lumotdan chiqadi va u hali yo'q.
 * Skeletga qizil rels berilsa, ekran yuklanish paytida "muammo bor"
 * deb yolg'on aytardi.
 */
const MetricPlaceholder = ({ isLoading, delay }) => {
  const bar = cn("rounded-full bg-slate-100", isLoading && "motion-safe:animate-breathe");

  return (
    <article
      className={cn(SURFACE.card, TILE, MOTION.enter)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span aria-hidden="true" className={cn(RAIL.base, RAIL.tone.neutral)} />

      <div className="flex h-4 items-center">
        <span className={cn(bar, "h-2.5 w-16")} />
      </div>

      <div className="mt-2 flex h-[21px] items-center">
        {isLoading ? (
          <span className={cn(bar, "h-4 w-20")} style={{ animationDelay: "160ms" }} />
        ) : (
          <span className={cn(T.value, T.sizeXl, "text-slate-300")}>—</span>
        )}
      </div>

      <div className="mt-1.5 flex h-4 items-center">
        <span className={cn(bar, "h-2.5 w-24")} style={{ animationDelay: "320ms" }} />
      </div>
    </article>
  );
};

export default MetricStrip;
