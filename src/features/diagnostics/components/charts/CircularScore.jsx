// React
import { useEffect, useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * BALL HALQASI — diagnostika natijasining asosiy vizual elementi.
 *
 * ⚠️ FRAMER-MOTION ISHLATILMAYDI. Asl loyihada bu komponent
 * `framer-motion` ga tayanardi; admin panelda esa u bog'liqlik sifatida
 * YO'Q va butun panel o'z harakat tokenlari bilan ishlaydi
 * (`tailwind.config.js` dagi izoh). Shuning uchun animatsiya sof CSS
 * `stroke-dashoffset` o'tishi bilan qilingan — natija bir xil ko'rinadi,
 * lekin bundle'ga bir bayt ham qo'shilmaydi.
 *
 * ⚠️ `prefers-reduced-motion` HURMAT QILINADI: `motion-reduce:transition-none`.
 *
 * @param {object} props
 * @param {number} props.value - 0–100
 * @param {number} [props.size=160]
 * @param {number} [props.stroke=12]
 * @param {string} [props.color] - halqa rangi (odatda `scoreColor(value)`)
 * @param {boolean} [props.ticks=true] - tashqi bo'linma chiziqlari
 * @param {React.ReactNode} [props.children] - markazdagi kontent
 */
const CircularScore = ({
  value = 0,
  size = 160,
  stroke = 12,
  color = "#2563eb",
  trackColor = "#E5E9F2",
  ticks = true,
  className = "",
  children,
}) => {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Chizish 0 dan boshlanadi va keyingi kadrda haqiqiy qiymatga o'tadi —
  // shundagina CSS o'tishi ko'rinadi (birdan to'g'ri qiymat qo'yilsa,
  // animatsiya umuman bo'lmasdi).
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(safe));
    return () => cancelAnimationFrame(frame);
  }, [safe]);

  const tickRadius = radius - stroke / 2 - 5;
  const tickCount = 44;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Natija: ${Math.round(safe)} foiz`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {ticks &&
          tickRadius > 8 &&
          Array.from({ length: tickCount }).map((_, i) => {
            const angle = (i / tickCount) * 2 * Math.PI;
            return (
              <line
                key={i}
                x1={center + tickRadius * Math.cos(angle)}
                y1={center + tickRadius * Math.sin(angle)}
                x2={center + (tickRadius - 4) * Math.cos(angle)}
                y2={center + (tickRadius - 4) * Math.sin(angle)}
                stroke={trackColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - drawn / 100)}
          className="transition-[stroke-dashoffset] ease-out [transition-duration:1200ms] motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CircularScore;
