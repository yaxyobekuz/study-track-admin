// React
import { memo } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * VARAQNING BITTA KATAGI.
 *
 * ⚠️ `memo` MAJBURIY: varaqda ~475 ta katak bor va har bosishda `values`
 * obyekti yangilanadi, ya'ni ota komponent butunlay qayta chiziladi. Memo
 * bo'lmasa har bir harf uchun 475 ta input qayta render qilinardi.
 *
 * ⚠️ Shared `Input` ISHLATILMAYDI: u `forwardRef` bilan o'ralmagan (fokusni
 * boshqarib bo'lmaydi) va `inputBaseClasses` ichidagi `md:text-sm` shriftni
 * qaytarib kattalashtiradi.
 *
 * ⚠️ `type="text"` + `inputMode="numeric"` — `type="number"` EMAS: raqamli
 * inputda ArrowUp/Down qiymatni o'zgartiradi, bizga esa ular katakdan katakka
 * yurish uchun kerak.
 *
 * ⚠️ `h-6` global `input { h-11 }` qoidasini bekor qiladi (styles/index.css,
 * @layer base) — usiz har bir katak 44px bo'lib, jadval ekranga sig'masdi.
 */
const DistributionCell = memo(function DistributionCell({
  subjectId,
  classId,
  rowIndex,
  colIndex,
  value,
  highlighted,
  isActive,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
}) {
  const filled = value !== undefined && value !== null;

  return (
    <td
      className={cn(
        "border border-gray-200 p-0 transition-colors",
        // Rang MA'NO tashiydi: yashil — soat belgilangan, sariq — ataylab 0.
        filled ? (value === 0 ? "bg-amber-100" : "bg-emerald-100") : "bg-white",
        // Aktiv katakning QATORI va USTUNI — qaysi fan va qaysi sinf ustida
        // turganingiz jadvalning o'rtasida ham ko'rinib tursin.
        highlighted && !filled && "bg-sky-50",
        highlighted && filled && "brightness-95",
        isActive && "ring-2 ring-inset ring-primary",
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        data-row={rowIndex}
        data-col={colIndex}
        value={value ?? ""}
        onChange={(e) => onChange(subjectId, classId, e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        className={cn(
          "h-6 w-full border-0 bg-transparent p-0 text-center text-xs tabular-nums",
          "outline-none",
          // Yopishib turgan sarlavha va fanlar ustuni ostida qolib ketmasligi
          // uchun: strelka bilan yurganda brauzer shu chekkalarni hisobga oladi.
          "scroll-mt-32 scroll-ml-56",
        )}
      />
    </td>
  );
});

export default DistributionCell;
