// Icons
import { CalendarDays } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Tokens
import { T } from "../data/ledger.tokens";

/**
 * SANA MAYDONI — o'zbekcha matn, nativ tanlagich ostida.
 *
 * ⚠️ NATIV `<input type="date">` OLIB TASHLANMAYDI, USTI YOPILADI. U
 * shaffof qilib ustiga qo'yiladi (`opacity-0`), ko'rinadigan matn esa
 * bizniki. Sabab:
 *
 *   · nativ element ISO ko'rsatadi ("2026-09-21") — bu QIYMAT, format
 *     emas, va uni ekranga chiqarish taqiqlangan (`.claude/rules/dates.md`);
 *   · lekin uning kalendari, klaviatura bilan kiritilishi va mobil
 *     qurilmadagi tanlagichi tayyor va ular haqiqatan yaxshi ishlaydi.
 *
 * Ya'ni nativ elementdan XULQ olinadi, KO'RINISH esa bizniki. Butun
 * kalendarni qaytadan yozish esa mobil tanlagichni ham qaytadan yozishni
 * anglatardi va u nativdan yomonroq chiqardi.
 *
 * ⚠️ MATN `formatDateUz` DAN. Bu tizimdagi sana matnining yagona manbai;
 * qo'lda yig'ilgan shablon aynan shu qoida buzilishining sababi bo'lgan.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value - "YYYY-MM-DD" (mashina qiymati)
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.min] - "YYYY-MM-DD"
 * @param {string} [props.hint] - maydon ostidagi izoh
 */
const DateField = ({ label, value, onChange, min, hint, required }) => (
  <label className="block">
    <span className={cn(T.label, "mb-1.5 block")}>{label}</span>

    <span
      className={cn(
        "relative flex h-11 items-center gap-2.5 rounded-xl bg-slate-50 px-3",
        "transition-colors duration-200 ease-out-quint",
        "hover:bg-slate-100 focus-within:bg-slate-100",
      )}
    >
      <CalendarDays className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />

      <span
        className={cn(
          T.td,
          "flex-1 truncate",
          value ? "font-medium text-slate-900" : "text-slate-400",
        )}
      >
        {value ? formatDateUz(value) : "Sanani tanlang"}
      </span>

      {/*
        ⚠️ `sr-only` EMAS, `opacity-0` + `inset-0`: element KO'RINMASLIGI
        emas, BOSILADIGAN bo'lib qolishi kerak. Ekranni o'qiydigan dastur
        uchun esa u haqiqiy `input` bo'lib qoladi, ya'ni yorliq ham,
        qiymat ham to'g'ri o'qiladi.
      */}
      <input
        type="date"
        value={value}
        min={min}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </span>

    {hint && <span className={cn(T.meta, "mt-1 block")}>{hint}</span>}
  </label>
);

export default DateField;
