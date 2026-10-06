// React
import { useEffect, useRef, useState } from "react";

// Icons
import { CalendarDays } from "lucide-react";

// Components
import CalendarPanel from "./CalendarPanel";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Tokens
import { T } from "../data/ledger.tokens";

/**
 * SANA MAYDONI — o'z kalendarimiz, oqim ichida ochiladi.
 *
 * ⚠️ NATIV `<input type="date">` DAN VOZ KECHILDI va sabab aniq.
 *
 * Avval nativ element shaffof qilib ustiga qo'yilgan edi (ko'rinadigan matn
 * bizniki, xatti-harakat nativ). Bu ISHLAMADI: Chrome `input[type=date]`
 * ning maydoniga bosilganda kalendarni OCHMAYDI — u faqat o'ng chetdagi
 * kalendar belgisiga bosilganda ochiladi, belgi esa `opacity-0` da
 * ko'rinmaydi. Ya'ni foydalanuvchi maydonga bosardi va HECH NARSA
 * bo'lmasdi. Klaviatura bilan yozish ham "ishlamayotgandek" tuyulardi:
 * qiymat o'zgarardi, lekin tahrirlanayotgan bo'lak ko'rinmasdi.
 *
 * `showPicker()` bilan tuzatish mumkin edi, lekin u brauzerga qarab
 * boshqacha ishlaydi va kalendarning O'ZI baribir OS uslubida qolardi —
 * chegarasiz, jiddiy uslubdagi bo'limda yagona begona element.
 *
 * ⚠️ PORTAL YO'Q. Bu maydon MODAL ichida turadi va Radix `Dialog` sahifa
 * aylanishini `shards: [contentRef]` bilan qulflaydi — portalga chiqarilgan
 * qatlam qulf tashqarisida qolib, aylantirib bo'lmaydigan bo'lardi
 * (`TeacherPicker` sarlavhasidagi to'liq izoh).
 *
 * ⚠️ QIYMAT — "YYYY-MM-DD", ya'ni MASHINA QIYMATI: u API'ga boradi.
 * Ekranda esa faqat `formatDateUz` natijasi ko'rinadi ("8-sentabr, 2026").
 * ISO satrini ekranga chiqarish taqiqlangan (`.claude/rules/dates.md`).
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value - "YYYY-MM-DD"
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.min] - "YYYY-MM-DD" (shu kundan oldingilari yopiq)
 * @param {string} [props.max] - "YYYY-MM-DD" (shu kundan keyingilari yopiq)
 * @param {string} [props.hint]
 */

const DateField = ({ label, value, onChange, min, max, hint, disabled }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <span className={cn(T.label, "mb-1.5 block")}>{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-xl bg-slate-50 px-3 text-left",
          "transition-colors duration-200 ease-out-quint",
          disabled
            ? "cursor-not-allowed opacity-55"
            : "hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
          open && "bg-slate-100",
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
      </button>

      {hint && !open && <span className={cn(T.meta, "mt-1 block")}>{hint}</span>}

      {open && (
        <div
          className={cn(
            "mt-1.5 overflow-hidden rounded-2xl bg-white p-2",
            "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_32px_-18px_rgba(15,23,42,0.26)]",
            "motion-safe:animate-post",
          )}
        >
          {/* Har ochilganda yangidan quriladi — ko'rinish tanlangan sanaga qaytadi */}
          <CalendarPanel
            value={value}
            min={min}
            max={max}
            hint={hint}
            onPick={(next) => {
              onChange?.(next);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateField;
