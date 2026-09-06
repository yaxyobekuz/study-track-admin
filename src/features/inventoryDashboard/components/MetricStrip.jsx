// React
import { useId, useMemo } from "react";

// Icons
import {
  ClipboardCheck,
  HandCoins,
  ReceiptText,
  TrendingDown,
  Wallet,
  Wrench,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Hooks
import useCountUp from "../hooks/useCountUp";

// Tokens
import { DELAY, HUE, MOTION, SURFACE, T, metricDelay } from "../data/atlas.tokens";

// Components
import Delta from "./Delta";

/**
 * OLTITA KO'RSATKICH — heroning ostidagi qator.
 *
 * ⚠️ HERO BILAN TAKRORLANMAYDI. Hero uchta FOIZ va bazaning qiymatini
 * ko'rsatadi (holat), bu qator esa DAVR ichidagi harakatni: qancha
 * zarar, nechta hodisa, qancha pul qaytdi. Bir raqam ikki joyda tursa,
 * foydalanuvchi "qaysi biri to'g'ri" deb o'ylay boshlardi.
 *
 * ⚠️ SPARKLINE FAQAT UCHTASIDA. Chizilishi uchun 12 oylik qator kerak,
 * u esa faqat hodisaviy ko'rsatkichlarda bor (zarar, hodisa soni,
 * undiruv). Holat ko'rsatkichlariga (yaroqsizlar, qarz, bugungi
 * hisobotlar) tarix chizilsa, u YOLG'ON bo'lardi: qator o'sha kunlarning
 * o'zidan emas, hozirgi holatdan olingan bo'lardi.
 */
const MetricStrip = ({ data, isLoading }) => {
  const kpi = data?.kpi;

  // ⚠️ `data?.trend ?? []` bog'liqlik ro'yxatiga CHIQARILMAYDI: har
  // renderda yangi massiv hosil bo'lib, `useMemo` hech qachon
  // keshlanmasdi. Shart memo ichida qoladi.
  const series = useMemo(() => {
    const trend = data?.trend ?? [];
    return {
      damage: trend.map((row) => Number(row.damageAmount)),
      count: trend.map((row) => row.damageCount),
      recovered: trend.map((row) => Number(row.recoveredAmount)),
    };
  }, [data]);

  const items = [
    {
      key: "damage",
      icon: TrendingDown,
      accent: "damage",
      label: "Davr zarari",
      value: formatMoney(kpi?.damageAmount?.value, { withLabel: false }),
      suffix: "so'm",
      meta: `${kpi?.damageCount?.value ?? 0} ta hodisa`,
      change: kpi?.damageAmount?.change,
      goodWhen: "down",
      spark: series.damage,
      sparkColor: HUE.damage,
    },
    {
      key: "count",
      icon: ReceiptText,
      accent: "damage",
      label: "Hodisalar",
      value: (kpi?.damageCount?.value ?? 0).toLocaleString("uz-UZ"),
      suffix: "ta",
      meta: `${data?.flow?.shares?.pending ?? 0}% qaror kutmoqda`,
      change: kpi?.damageCount?.change,
      goodWhen: "down",
      spark: series.count,
      sparkColor: HUE.damage,
    },
    {
      key: "recovered",
      icon: HandCoins,
      accent: "recovery",
      label: "Undirilgan",
      value: formatMoney(kpi?.recoveredAmount?.value, { withLabel: false }),
      suffix: "so'm",
      meta: `${data?.rings?.recovery?.detail?.paymentCount ?? 0} ta to'lov`,
      change: kpi?.recoveredAmount?.change,
      goodWhen: "up",
      spark: series.recovered,
      sparkColor: HUE.recovery,
    },
    {
      key: "debt",
      icon: Wallet,
      accent: "warn",
      label: "Qarzdorlik",
      value: formatMoney(data?.debtors?.total, { withLabel: false }),
      suffix: "so'm",
      meta:
        data?.debtors?.overdueCount > 0
          ? `${data.debtors.overdueCount} ta muddati o'tgan`
          : `${data?.debtors?.count ?? 0} ta qarzdor`,
      metaTone: data?.debtors?.overdueCount > 0 ? "warn" : "neutral",
    },
    {
      key: "broken",
      icon: Wrench,
      accent: "warn",
      label: "Yaroqsiz",
      value: (kpi?.brokenQuantity?.value ?? 0).toLocaleString("uz-UZ"),
      suffix: "dona",
      meta: `${data?.base?.unitHealthRate ?? 0}% yaroqli`,
      change: kpi?.brokenQuantity?.change,
      goodWhen: "down",
    },
    {
      key: "checks",
      icon: ClipboardCheck,
      accent: "monitor",
      // ⚠️ "Bugungi hisobot" EMAS: 1280px da olti karta qatorida yorliq
      // uchun ~120px qoladi va uzunroq matn kesilib, "BUGUNGI HISOB…"
      // bo'lib qolardi. Tafsilot pastdagi meta satrida turadi.
      label: "Bugun",
      value: `${data?.monitoring?.submittedToday ?? 0}`,
      suffix: `/ ${data?.monitoring?.totalLocations ?? 0}`,
      meta:
        data?.monitoring?.pendingToday > 0
          ? `${data.monitoring.pendingToday} ta xona bermadi`
          : "Barcha xonalar berdi",
      metaTone: data?.monitoring?.pendingToday > 0 ? "warn" : "ok",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
      {/* ⚠️ `key` spread'dan AJRATIB olinadi: `{...item}` ichida ham
          `key` maydoni bor va React uni "spread orqali kelgan key" deb
          ogohlantiradi — u propga aylanmaydi, faqat shovqin qiladi. */}
      {items.map(({ key, ...item }, index) => (
        <MetricCard key={key} {...item} isLoading={isLoading} delay={metricDelay(index)} />
      ))}
    </div>
  );
};

const ACCENT_ICON = {
  damage: "text-rose-500",
  recovery: "text-emerald-500",
  warn: "text-amber-500",
  monitor: "text-indigo-500",
  base: "text-teal-500",
};

const META_TONE = {
  warn: "text-amber-600",
  ok: "text-emerald-600",
  neutral: "text-slate-400",
};

const MetricCard = ({
  icon: Icon,
  accent,
  label,
  value,
  suffix,
  meta,
  metaTone = "neutral",
  change,
  goodWhen,
  spark,
  sparkColor,
  isLoading,
  delay,
}) => (
  <article
    className={cn(SURFACE.card, "relative overflow-hidden px-3.5 py-3.5", MOTION.enter)}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Sarlavha qatori — ikonka va yorliq bir tekislikda */}
    <div className="flex items-center gap-1.5">
      <Icon className={cn("size-3.5 shrink-0", ACCENT_ICON[accent])} strokeWidth={2.2} />
      <p className={cn(T.label, "truncate")}>{label}</p>
    </div>

    {isLoading ? (
      <div className="mt-2.5 h-6 w-24 rounded-md bg-slate-100 motion-safe:animate-breathe" />
    ) : (
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className={cn(T.value, T.sizeXl, "truncate")}>{value}</span>
        {suffix && <span className="text-[10.5px] font-medium text-slate-400">{suffix}</span>}
        {change != null && (
          <Delta value={change} goodWhen={goodWhen} className="ml-auto" />
        )}
      </div>
    )}

    {meta && !isLoading && (
      <p className={cn("mt-1.5 truncate text-[10.5px] font-medium", META_TONE[metaTone])}>
        {meta}
      </p>
    )}

    {/* ⚠️ Sparkline KARTANING PASTKI CHETIDA, oqimdan TASHQARIDA
        (`absolute`): oqimga qo'yilsa, sparkline'i bor uchta karta
        qolganlaridan balandroq bo'lib, qator tekisligi buzilardi */}
    {spark?.length > 1 && !isLoading && (
      <Sparkline points={spark} color={sparkColor} delay={delay + DELAY.content} />
    )}
  </article>
);

/**
 * SPARKLINE — 12 oylik shakl, o'qsiz va tugunsiz.
 *
 * ⚠️ Bu DIAGRAMMA EMAS, SHAKL: raqamlarni o'qish uchun emas, "o'sib
 * ketdimi yoki tushdimi" degan bitta savolga javob berish uchun. Shuning
 * uchun o'q, to'r va tooltip yo'q — ular bo'lsa, 40px balandlikdagi
 * chiziq to'liq diagramma bo'lishga da'vo qilardi.
 *
 * Chiziq kirishda CHIZILADI (`draw-path`): `stroke-dasharray` uzunligiga
 * teng, `dashoffset` esa noldan boshlanadi. Uzunlik o'lchanmaydi, balki
 * gorizontal kenglikdan yuqori baho bilan olinadi — 2× kenglik har
 * qanday egri chiziq uchun yetarli va bir piksellik xato ko'rinmaydi.
 */
const SPARK_W = 120;
const SPARK_H = 26;

const Sparkline = ({ points, color, delay }) => {
  const gradientId = useId();

  const { line, area } = useMemo(() => {
    const max = Math.max(...points, 0);
    const min = Math.min(...points, 0);
    const span = max - min || 1;

    const coords = points.map((value, index) => {
      const x = (index / (points.length - 1)) * SPARK_W;
      const y = SPARK_H - ((value - min) / span) * (SPARK_H - 3) - 1.5;
      return [x, y];
    });

    // Kubik silliqlash — burchakli siniq chiziq "sxema" bo'lib ko'rinadi
    const path = coords.reduce((acc, [x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;
      const [px, py] = coords[index - 1];
      const cx = (px + x) / 2;
      return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
    }, "");

    return {
      line: path,
      area: `${path} L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`,
    };
  }, [points]);

  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      preserveAspectRatio="none"
      /* ⚠️ Shaffoflik past va gradient tez so'nadi: sparkline karta
         PASTIDA, raqamning ostida turadi va u fon bo'lishi kerak —
         to'q chiziq ko'zni raqamdan tortib olardi. */
      className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full opacity-[0.42]"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={MOTION.draw}
        style={{
          strokeDasharray: SPARK_W * 2,
          "--draw-length": SPARK_W * 2,
          animationDelay: `${delay}ms`,
        }}
      />
    </svg>
  );
};

export default MetricStrip;
