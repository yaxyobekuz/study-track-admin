// Utils
import { cn } from "@/shared/utils/cn";

/**
 * MAVZUNING DARAJASI VA KITOBI — kichik belgilar.
 *
 * Ikkalasi ham IXTIYORIY (mavzular faylida bo'lmasligi mumkin): bo'lmasa
 * hech narsa chizilmaydi — "—" yoki "Kitob yo'q" yozuvi har bir darsda
 * takrorlanib, jadvalni shovqinga to'ldirardi.
 *
 * @param {{ level?: string|null, book?: string|null, className?: string }} props
 */
const TopicMeta = ({ level, book, className = "" }) => {
  if (!level && !book) return null;

  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {level && (
        <span
          title="Daraja"
          className="max-w-full truncate rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium leading-none text-indigo-700"
        >
          {level}
        </span>
      )}
      {book && (
        <span
          title="Kitob"
          className="max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] leading-none text-slate-600"
        >
          {book}
        </span>
      )}
    </span>
  );
};

export default TopicMeta;
