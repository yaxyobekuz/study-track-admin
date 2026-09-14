// Icons
import { Loader2, MapPin, MapPinOff } from "lucide-react";

/**
 * JORIY GPS HOLATI — tugma yonidagi bitta qator.
 *
 * ⚠️ Xato holati QIZIL emas, SARIQ: joylashuv olinmagani qayd etishni
 * TO'SMAYDI (server uni "berilmagan" deb yozadi). Qizil rang xodimga
 * "endi qayd eta olmayman" degan noto'g'ri xabar berardi — aslida
 * tugma ishlayveradi.
 *
 * @param {object} props
 * @param {number|null} props.accuracy - joriy aniqlik (metr)
 * @param {string|null} props.error - o'qiladigan xato matni
 * @param {boolean} [props.loading] - aniqlash davom etyaptimi
 */
const GeolocationStatus = ({ accuracy, error, loading = false }) => {
  // Aniqlanmoqda va hali bironta natija yo'q
  if (loading && accuracy === null) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
        <span>Joylashuv aniqlanmoqda...</span>
      </div>
    );
  }

  if (error && accuracy === null) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-start gap-1.5 text-sm text-amber-700">
          <MapPinOff className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
        <p className="pl-[22px] text-xs text-gray-500">
          Joylashuvsiz ham qayd etish mumkin — u "berilmagan" deb yoziladi
        </p>
      </div>
    );
  }

  if (accuracy === null || accuracy === undefined) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin className="size-4" strokeWidth={1.5} />
        <span>Joylashuv kutilmoqda...</span>
      </div>
    );
  }

  const isGood = accuracy <= 50;
  const isMedium = accuracy <= 150;

  return (
    <div
      className={`flex items-center gap-1.5 text-sm ${
        isGood
          ? "text-green-600"
          : isMedium
            ? "text-yellow-600"
            : "text-orange-600"
      }`}
    >
      <MapPin className="size-4" strokeWidth={1.5} />
      <span>
        GPS aniqligi: ±{Math.round(accuracy)} m
        {!isGood && (isMedium ? " (o'rtacha)" : " (past)")}
      </span>
      {loading && (
        <span className="text-xs text-gray-400">aniqlanmoqda...</span>
      )}
    </div>
  );
};

export default GeolocationStatus;
