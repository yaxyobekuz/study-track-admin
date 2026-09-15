// Icons
import { Loader2, MapPin, MapPinOff } from "lucide-react";

/**
 * JORIY GPS HOLATI — tugma yonidagi bitta qator.
 *
 * ⚠️ Fayl to'rt panelda AYNAN bir xil nusxa: admin, teacher, worker,
 * reception.
 *
 * ⚠️ Xato holati QIZIL emas, SARIQ: joylashuv olinmagani qayd etishni
 * TO'SMAYDI (server uni "berilmagan" deb yozadi). Qizil rang xodimga
 * "endi qayd eta olmayman" degan noto'g'ri xabar berardi — aslida
 * tugma ishlayveradi.
 *
 * ⚠️ "QAYTA URINISH" TUGMASI MAJBURIY. Ilgari joylashuvni qayta so'rashning
 * yagona yo'li "Men keldim" edi — u esa aniqlanmasa ham qaydni YUBORIB
 * yuborardi. Ya'ni yangi qurilmada ruxsat berib bo'lgan xodim joylashuvni
 * qayta aniqlata olmay, qaydni "joylashuvsiz" qilishga majbur edi.
 *
 * @param {object} props
 * @param {number|null} props.accuracy - joriy aniqlik (metr)
 * @param {string|null} props.error - o'qiladigan xato matni
 * @param {boolean} [props.loading] - aniqlash davom etyaptimi
 * @param {string} [props.permission] - `useGeolocation().permission`
 * @param {() => void} [props.onRequest] - joylashuvni (qayta) aniqlash
 */
const GeolocationStatus = ({
  accuracy,
  error,
  loading = false,
  permission = "unknown",
  onRequest,
}) => {
  const action = (label) =>
    onRequest && !loading ? (
      <button
        type="button"
        onClick={() => onRequest()}
        className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        {label}
      </button>
    ) : null;

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
          <span className="min-w-0 flex-1">{error}</span>
          {action("Qayta urinish")}
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
        <MapPin className="size-4 shrink-0" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          {permission === "prompt"
            ? "Joylashuvni aniqlash uchun brauzer ruxsat so'raydi"
            : "Joylashuv hali aniqlanmagan"}
        </span>
        {action("Aniqlash")}
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
      <MapPin className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 flex-1">
        GPS aniqligi: ±{Math.round(accuracy)} m
        {!isGood && (isMedium ? " (o'rtacha)" : " (past)")}
        {loading && (
          <span className="ml-1.5 text-xs text-gray-400">aniqlanmoqda...</span>
        )}
      </span>
      {/* Aniqlik past bo'lsa — ochiqroq joyga chiqib yangilash imkoni */}
      {!isGood && action("Yangilash")}
    </div>
  );
};

export default GeolocationStatus;
