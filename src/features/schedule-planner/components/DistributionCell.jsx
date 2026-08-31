// React
import { memo } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * VARAQNING BITTA KATAGI — alohida "plitka" ko'rinishida.
 *
 * ⚠️ Kataklar orasidagi bo'shliq `border-spacing` bilan EMAS, katakning ICHKI
 * to'ldirmasi (`p-[2px]`) bilan yasaladi. Sababi: `border-spacing` haqiqiy
 * teshik qoldiradi va yopishib turgan qatorlar ostidan pastdagi ma'lumot
 * o'sha teshiklardan ko'rinib qolardi. To'ldirma esa katakni to'liq
 * shaffofmas qoldiradi — bo'shliq katakning o'z foni bo'lib ko'rinadi.
 *
 * ⚠️ `memo` MAJBURIY: varaqda 500 dan ortiq katak bor va har bosishda ota
 * komponent qayta chiziladi. Memo bo'lmasa har bir harf uchun hammasi qayta
 * render qilinardi.
 *
 * ⚠️ Shared `Input` ISHLATILMAYDI: u `forwardRef` bilan o'ralmagan (fokusni
 * boshqarib bo'lmaydi) va `md:text-sm` shriftni qaytarib kattalashtiradi.
 *
 * ⚠️ `type="text"` + `inputMode="numeric"` — `type="number"` EMAS: raqamli
 * inputda ArrowUp/Down qiymatni o'zgartiradi, bizga esa ular katakdan katakka
 * yurish uchun kerak.
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
      // ⚠️ Bo'shliq foni O'ZGARMAYDI. Aktiv qator/ustunni bo'shliqni
      // bo'yash bilan ko'rsatish bir tutash rangli yo'lak hosil qilib,
      // plitkalar orasidagi havoni yo'qotardi va jadval og'irlashardi.
      // Buning o'rniga faqat PLITKALARNING rangi o'zgaradi.
      className="bg-white p-[2px]"
    >
      <div
        className={cn(
          "rounded-md transition-colors",
          // Rang MA'NO tashiydi: yashil — soat belgilangan, sariq — ataylab 0.
          // Aktiv qator/ustundagi plitka QUYUQROQ bo'ladi — rang o'z
          // ma'nosini saqlab qoladi (yashil = soat bor, sariq = ataylab 0),
          // shunchaki bir pog'ona to'yingan bo'lib chiqadi.
          //
          // Bo'sh katak ham PLITKA bo'lib ko'rinishi kerak: undan ochroq
          // rang oq bo'shliqqa qo'shilib ketib, jadval to'r bo'lib emas,
          // tarqoq raqamlar bo'lib ko'rinardi.
          filled
            ? value === 0
              ? highlighted
                ? "bg-amber-200"
                : "bg-amber-100"
              : highlighted
                ? "bg-emerald-200"
                : "bg-emerald-100"
            : highlighted
              ? "bg-sky-100"
              : "bg-slate-100",
          isActive && "ring-2 ring-primary",
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
            "h-6 w-full rounded-md border-0 bg-transparent p-0 text-center text-xs",
            "font-medium tabular-nums text-slate-700 outline-none",
            // Strelka bilan yurganda tanlangan katak yopishib turgan qatorlar
            // yoki fanlar ustuni ostida qolib ketmasligi uchun chekka.
            // Yuqoridagi chekka QOTIRILMAGAN — jadval uni o'lchaydi.
            "scroll-mt-[var(--dist-scroll,11rem)] scroll-ml-56",
          )}
        />
      </div>
    </td>
  );
});

export default DistributionCell;
