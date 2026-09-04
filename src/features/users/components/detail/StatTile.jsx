// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Detal sahifasining ko'rsatkich kartasi: yorliq, katta qiymat va izoh.
 *
 * "Dars jadvali" va "Oylik" tablari bir xil qatorni chizadi, shuning uchun
 * u ikkala faylda takrorlanmaydi — bo'lmasa sahifada bir xil ma'noli ikkita
 * turlicha karta paydo bo'lardi.
 *
 * Qiymat RAQAM ham, tayyor SATR ham bo'lishi mumkin ("12" yoki
 * "450 000 so'm"), shuning uchun bu yerda formatlash yo'q — chaqiruvchi
 * tayyor qiymat beradi.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {string} [props.hint]
 * @param {React.ComponentType} [props.icon] - lucide komponenti
 * @param {string} [props.valueClassName]
 */
const StatTile = ({
  label,
  value,
  hint = "",
  icon: Icon = null,
  valueClassName = "text-gray-900",
}) => (
  <div className="rounded-2xl bg-white p-4">
    <div className="flex items-center gap-2.5">
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      )}

      <p className="min-w-0 text-sm font-medium leading-tight text-gray-500">
        {label}
      </p>
    </div>

    <p className={cn("mt-3 break-words text-xl font-bold", valueClassName)}>
      {value}
    </p>

    {hint && <p className="mt-1 text-xs leading-snug text-gray-400">{hint}</p>}
  </div>
);

export default StatTile;
