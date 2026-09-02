// Recharts
import {
  Radar,
  Legend,
  Tooltip,
  PolarGrid,
  RadarChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// Components
import ChartTooltip from "./ChartTooltip";
import ReportPanelCard from "./ReportPanelCard";

// Data
import {
  CHART_COLORS,
  percentText,
  MIN_RADAR_AXES,
  buildRadarRows,
} from "../../data/staffReport.data";

/**
 * Radar tooltip'i — bitta o'qning ikki oydagi qiymati yonma-yon.
 *
 * Sarlavhada QISQA emas, TO'LIQ yorliq turadi: o'qda "Topshiriq" yozilgan
 * bo'lsa ham, sichqoncha ustiga kelganda uning to'liq nomi ko'rinadi.
 *
 * O'lchanmagan ko'rsatkich chiziqcha bilan chiqadi: uni nolga
 * aylantirsak, "ma'lumot yo'q" ekranda "nol natija" bo'lib o'qilardi.
 */
const IndicatorTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltip
      title={payload[0]?.payload?.fullLabel}
      rows={payload.map((entry) => ({
        key: entry.dataKey,
        color: entry.color ?? entry.stroke,
        name: entry.name,
        value: percentText(entry.value),
      }))}
    />
  );
};

/**
 * O'q yorlig'i — ikki qatorgacha bo'linadi.
 *
 * Panel uchdan bir ustunda turadi, ya'ni tanasi ~230px. Gorizontalga yaqin
 * o'qdagi ikki so'zli yorliq bitta qatorda `<svg>` chekkasidan chiqib
 * ketardi va brauzer uni so'z o'rtasidan qirqardi. Shuning uchun yorliq
 * bo'sh joy bo'yicha ikkiga bo'linadi va tik ustma-ust yoziladi.
 */
const AxisTick = ({ payload, x, y, textAnchor }) => {
  const words = String(payload?.value ?? "")
    .split(" ")
    .filter(Boolean);

  // Uchtadan ko'p so'z bo'lsa ham ikki qatordan oshmaydi: qolgani
  // ikkinchi qatorga qo'shiladi.
  const lines = words.length > 2 ? [words[0], words.slice(1).join(" ")] : words;

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={CHART_COLORS.axis}
      fontSize={10}
    >
      {lines.map((line, index) => (
        <tspan key={line + index} x={x} dy={index ? 10 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

/**
 * Faoliyat ko'rsatkichlari radari — joriy oy o'tgan oy ustiga qo'yiladi.
 *
 * Beshta ko'rsatkich beshta alohida progress chizig'i bo'lganda ko'z ular
 * orasida yugurishga majbur bo'lardi. Radar esa oyning "shakli"ni bitta
 * qarashda beradi: qaysi tomon ichkariga botgani — o'sha yerda muammo.
 *
 * O'tgan oy ATAYLAB birinchi chiziladi va uzuq chiziq bilan — u faqat
 * taqqoslash foni, javob esa joriy oyning to'q chizig'ida. Qiymatlar
 * `buildRadarRows` dan keladi va 0..100 shkalasida, shuning uchun radius
 * o'qi qat'iy [0, 100]: shkala oydan oyga sakrasa, ikki oyning shakli
 * o'zaro solishtirib bo'lmas edi.
 *
 * ⚠️ O'LCHANMAGAN KO'RSATKICH CHIZILMAYDI. Recharts `null` nuqtani markazga
 * qo'yadi, ya'ni "ma'lumot yo'q" ekranda "0%" bilan bir xil ko'rinadi.
 * Shuning uchun `buildRadarRows` bunday o'qni chiqarib tashlaydi va uning
 * nomi diagramma ostida matn bilan aytiladi. O'tgan oy ko'pburchagi esa
 * faqat HAMMA o'qda ma'lumot bo'lganda chiziladi (`canCompare`).
 *
 * @param {object} props
 * @param {Array} props.indicators - serverdagi joriy/o'tgan oy ko'rsatkichlari
 * @param {string} props.monthLabel - joriy oy nomi, masalan "Sentabr, 2026"
 * @param {string} props.previousLabel - o'tgan oy nomi
 */
const StaffIndicatorsRadar = ({ indicators, monthLabel, previousLabel }) => {
  const { rows, missing, canCompare } = buildRadarRows(indicators);

  // Diagramma chizilmasa, SABABI ham yo'qolmasligi kerak: "yetarli emas"
  // degan quruq matn o'rniga aynan qaysi ko'rsatkich o'lchanmagani aytiladi
  // (izoh qatorlari pastda, bo'sh holatda ular chizilmaydi).
  const emptyText = missing.length
    ? `Ko'rsatkichlar yetarli emas — o'lchanmadi: ${missing.join(", ")}`
    : "Ko'rsatkichlar yetarli emas";

  return (
    <ReportPanelCard
      title="Faoliyat ko'rsatkichlari"
      hint="Joriy oy va o'tgan oy solishtiruvi"
      isEmpty={rows.length < MIN_RADAR_AXES}
      emptyText={emptyText}
    >
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={rows} outerRadius="58%">
            <PolarGrid stroke={CHART_COLORS.grid} />
            <PolarAngleAxis dataKey="label" tick={<AxisTick />} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fontSize: 9, fill: "#cbd5e1" }}
              axisLine={false}
            />
            <Tooltip content={<IndicatorTooltip />} />

            {canCompare && (
              <Radar
                name={previousLabel}
                dataKey="previous"
                stroke={CHART_COLORS.previous}
                fill={CHART_COLORS.previous}
                fillOpacity={0.25}
                strokeDasharray="4 3"
              />
            )}
            <Radar
              name={monthLabel}
              dataKey="current"
              stroke={CHART_COLORS.current}
              fill={CHART_COLORS.current}
              fillOpacity={0.22}
              strokeWidth={2}
            />

            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {!canCompare && (
        <p className="mt-2 text-xs text-gray-400">
          O&apos;tgan oy bilan solishtirish uchun to&apos;liq ma&apos;lumot
          yo&apos;q
        </p>
      )}

      {missing.length > 0 && (
        <p className="mt-1 text-xs text-gray-400">
          O&apos;lchanmadi: {missing.join(", ")}
        </p>
      )}
    </ReportPanelCard>
  );
};

export default StaffIndicatorsRadar;
