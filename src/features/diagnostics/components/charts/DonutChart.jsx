// React
import { useEffect, useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * SEGMENTLI HALQA — bir butunning bo'laklarga taqsimoti.
 *
 * ⚠️ BU `CircularScore` EMAS VA UNI ALMASHTIRMAYDI. Ikkalasi boshqa
 * savolga javob beradi:
 *   • `CircularScore` — BITTA o'lchov qiymati (0–100 ball, "72%");
 *   • `DonutChart`    — bir necha guruhning ULUSHI ("118 / 302 / 99").
 * Taqsimotni bitta yoy bilan chizish eng ko'p uchraydigan xato edi:
 * ekranda o'rtacha ball turardi-yu, "nechtasi yaxshi, nechtasi zaif"
 * degan savol javobsiz qolardi — halqaning butun mohiyati esa shu.
 *
 * ⚠️ YOYLAR SONDAN, YORLIQLAR FOIZDAN chiziladi. Foizlar butun songa
 * yaxlitlangani uchun ularning yig'indisi 100 ga teng qilib
 * tuzatiladi (`categoryShares`), lekin BURCHAK uchun xom son
 * ishlatiladi — aks holda yaxlitlash halqada ko'zga tashlanadigan
 * bo'shliq qoldirardi.
 *
 * @param {{label:string, value:number, color:string}[]} props.segments
 * @param {React.ReactNode} [props.children] - markazdagi kontent
 */
const DonutChart = ({
  segments = [],
  size = 168,
  stroke = 22,
  trackColor = "#EDF1F7",
  className = "",
  children,
}) => {
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);

  // Animatsiya sof CSS bilan — panelda harakat kutubxonasi yo'q
  // (`CircularScore` dagi bilan bir xil yondashuv).
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // ⚠️ SILJISH `reduce` BILAN YIG'ILADI, tashqi `let` bilan emas:
  // render ichida o'zgaruvchini qayta yozish React kompilyatorining
  // qoidasini buzadi (qayta renderda tartib buzilishi mumkin).
  const arcs = segments
    .filter((s) => s.value > 0)
    .reduce((acc, s) => {
      const length = total > 0 ? (s.value / total) * circumference : 0;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
      acc.push({ ...s, length, offset });
      return acc;
    }, []);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        total > 0
          ? `Taqsimot: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`
          : "Ma'lumot yo'q"
      }
    >
      {/* ⚠️ `-rotate-90` — birinchi yoy soat 12 dan boshlanadi. Usiz u
          soat 3 dan boshlanib, ko'z bilan o'qish qiyinlashardi. */}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />

        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeDasharray={`${drawn ? arc.length : 0} ${circumference}`}
            strokeDashoffset={-arc.offset}
            className="transition-[stroke-dasharray] ease-out [transition-duration:900ms] motion-reduce:transition-none"
          >
            <title>{`${arc.label}: ${arc.value}`}</title>
          </circle>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default DonutChart;
