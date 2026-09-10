// Utils
import { cn } from "@/shared/utils/cn";

/**
 * RADAR — mavzular kesimi bitta ko'rinishda.
 *
 * ⚠️ KAMIDA 3 TA O'Q KERAK. Ikkita nuqta bilan ko'pburchak chiziqqa
 * aylanadi va hech narsa ko'rsatmaydi — bunday holda chaqiruvchi
 * jadval/ustunli diagramma ko'rsatishi kerak.
 *
 * @param {object} props
 * @param {{label:string, value:number, benchmark?:number}[]} props.data
 * @param {number} [props.size=280]
 * @param {(index:number)=>void} [props.onSelect] - o'qqa bosilganda
 * @param {number} [props.activeIndex]
 */
const RadarChart = ({
  data = [],
  size = 280,
  color = "#2563eb",
  onSelect,
  activeIndex,
  className = "",
}) => {
  if (data.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const n = data.length;

  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i, radius) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const polygon = (values) =>
    values
      .map((v, i) => {
        const p = point(i, (Math.min(100, Math.max(0, v)) / 100) * R);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

  const rings = [0.25, 0.5, 0.75, 1];
  const hasBenchmark = data.some((d) => d.benchmark != null);

  return (
    <div className={cn("flex items-center justify-center px-10", className)}>
      {/* ⚠️ `overflow-visible` — yon o'qlarning yorliqlari SVG chekkasidan
          chiqib ketadi va kesilardi ("Geometriya" o'rniga "metriya"
          ko'rinardi). Konteynerga gorizontal joy `px-8` bilan beriladi. */}
      <svg
        width={size}
        height={size}
        role="img"
        aria-label="Mavzular radari"
        className="overflow-visible"
      >
        {/* Setka */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={polygon(data.map(() => ring * 100))}
            fill="none"
            stroke="#EDF1F7"
            strokeWidth={1}
          />
        ))}

        {/* O'qlar */}
        {data.map((_, i) => {
          const p = point(i, R);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#EDF1F7"
              strokeWidth={1}
            />
          );
        })}

        {/* Taqqoslash (sinf/maktab o'rtachasi) — uzuq chiziq */}
        {hasBenchmark && (
          <polygon
            points={polygon(data.map((d) => d.benchmark ?? 0))}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.7}
          />
        )}

        {/* Qiymat */}
        <polygon
          points={polygon(data.map((d) => d.value ?? 0))}
          fill={color}
          fillOpacity={0.14}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const p = point(i, ((d.value ?? 0) / 100) * R);
          const active = activeIndex === i;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={active ? 5.5 : 3.5}
              fill={active ? color : "#fff"}
              stroke={color}
              strokeWidth={2}
              onClick={onSelect ? () => onSelect(i) : undefined}
              className={onSelect ? "cursor-pointer" : undefined}
            />
          );
        })}

        {/* Yorliqlar */}
        {data.map((d, i) => {
          const p = point(i, R + 22);
          const anchor =
            Math.abs(p.x - cx) < 8 ? "middle" : p.x > cx ? "start" : "end";
          const active = activeIndex === i;
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              onClick={onSelect ? () => onSelect(i) : undefined}
              className={cn(
                "text-[11px]",
                active ? "font-semibold" : "font-medium",
                onSelect && "cursor-pointer",
              )}
              fill={active ? color : "#7A879B"}
            >
              {/* Uzun mavzu nomi radarni buzadi — qisqartiriladi */}
              {d.label.length > 14 ? `${d.label.slice(0, 13)}…` : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
