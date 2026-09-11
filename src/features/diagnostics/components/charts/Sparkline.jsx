/**
 * BASHORAT EGRI CHIZIG'I — kichik SVG chiziq.
 *
 * ⚠️ KUTUBXONASIZ. Panelda grafik kutubxonasi yo'q va uni bitta kichik
 * chiziq uchun qo'shish mobil internetda yuklanish vaqtini oshirardi.
 *
 * ⚠️ O'Q FAQAT MA'LUMOT BO'LSA CHIZILADI: bitta nuqtali "chiziq" —
 * chiziq emas, shuning uchun 2 tadan kam nuqtada `null` qaytadi.
 */
const Sparkline = ({
  data = [],
  width = 140,
  height = 40,
  color = "#2563eb",
  className = "",
}) => {
  const points = (data || []).filter((n) => typeof n === "number");
  if (points.length < 2) return null;

  const pad = 3;
  const max = Math.max(...points);
  const min = Math.min(...points);
  // Barcha qiymat teng bo'lsa nolga bo'linish bo'lardi.
  const range = max - min || 1;

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const line = coords.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path d={area} fill={color} opacity="0.12" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  );
};

export default Sparkline;
