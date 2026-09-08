// Icons
import { MapPin, WifiOff } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * GPS holati — xodim TUGMANI BOSISHDAN OLDIN joylashuvi qabul qilinishini
 * bilishi kerak.
 *
 * Aniqlik ko'rsatilmasa, "ofisdan tashqarida" belgisi faqat qayd etilgandan
 * KEYIN chiqardi va uni orqaga qaytarib bo'lmasdi (davomat append-only).
 *
 * @param {object} props
 * @param {number|null} [props.accuracy] - metrdagi aniqlik
 * @param {string|null} [props.error] - brauzer bergan xato matni
 */
const GeolocationStatus = ({ accuracy = null, error = null }) => {
  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <WifiOff className="size-4 shrink-0" strokeWidth={1.5} />
        {error}
      </p>
    );
  }

  if (accuracy == null) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin className="size-4 shrink-0" strokeWidth={1.5} />
        Joylashuv aniqlanmoqda...
      </p>
    );
  }

  const isGood = accuracy <= 50;
  const isMedium = accuracy <= 150;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm",
        isGood ? "text-green-600" : isMedium ? "text-yellow-600" : "text-red-600",
      )}
    >
      <MapPin className="size-4 shrink-0" strokeWidth={1.5} />
      GPS aniqligi: ±{Math.round(accuracy)} m{!isGood && " (yaxshi emas)"}
    </p>
  );
};

export default GeolocationStatus;
