// Icons
import { Phone, PhoneOff } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatPhoneUz, hasPhone, toTelHref } from "@/shared/utils/phone.utils";

/**
 * "Qo'ng'iroq" tugmasi — o'quvchi va ota-ona raqamlariga `tel:` havola.
 *
 * Ikkala raqam ham ixtiyoriy: bor bo'lganlari uchun tugma chiziladi, hech biri
 * bo'lmasa kulrang belgi turadi ("Raqam kiritilmagan"). Jadval qatori ichida
 * ishlatilgani uchun bosilish qatorga TARQALMAYDI (`stopPropagation`) —
 * aks holda qo'ng'iroq o'rniga tahrirlash oynasi ochilib ketardi.
 *
 * @param {object} props
 * @param {string|null} [props.phone] - o'quvchining o'zi
 * @param {string|null} [props.parentPhone] - ota-ona
 * @param {boolean} [props.compact] - faqat ikonka (jadval ustuni uchun); aks holda raqam ham yoziladi
 * @param {{phone?: string, parentPhone?: string}} [props.labels] - yorliqlar
 *   (default o'quvchi uchun: "O'quvchi" / "Ota-ona"; xodim kartasida boshqacha)
 * @param {string} [props.className]
 */
const DEFAULT_LABELS = { phone: "O'quvchi", parentPhone: "Ota-ona" };

const CallButton = ({
  phone,
  parentPhone,
  compact = false,
  labels = DEFAULT_LABELS,
  className = "",
}) => {
  const targets = [
    { key: "phone", label: labels.phone ?? DEFAULT_LABELS.phone, value: phone },
    {
      key: "parentPhone",
      label: labels.parentPhone ?? DEFAULT_LABELS.parentPhone,
      value: parentPhone,
    },
  ].filter((t) => hasPhone(t.value));

  if (targets.length === 0) {
    return (
      <span
        title="Raqam kiritilmagan"
        className={cn(
          "inline-flex items-center gap-1 text-xs text-gray-400",
          className,
        )}
      >
        <PhoneOff className="size-3.5" strokeWidth={1.75} />
        {!compact && <span>Raqam kiritilmagan</span>}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {targets.map((t) => (
        <a
          key={t.key}
          href={toTelHref(t.value)}
          title={`${t.label}: ${formatPhoneUz(t.value)}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
            compact ? "p-1.5" : "px-2.5 py-1.5 text-sm font-medium",
          )}
        >
          <Phone className="size-3.5" strokeWidth={2} />
          {!compact && (
            <span>
              <span className="text-green-600/70 text-xs">{t.label}:</span>{" "}
              {formatPhoneUz(t.value)}
            </span>
          )}
          {compact && targets.length > 1 && (
            <span className="text-[10px] font-semibold">
              {t.label.slice(0, 3)}
            </span>
          )}
        </a>
      ))}
    </span>
  );
};

export default CallButton;
