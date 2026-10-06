// React
import { useState } from "react";

// Icons
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import CalendarPanel from "./CalendarPanel";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import { T } from "../data/ledger.tokens";
import { shiftDayValue } from "../data/lessonHours.data";

/**
 * KUN TANLAGICH — ixcham, boshqaruv qatori uchun (`MonthPicker` ning juftligi).
 *
 * ⚠️ KALENDAR `CalendarPanel` DAN — `DateField` bilan bitta nusxa.
 * ⚠️ O'QLAR YAKSHANBANI O'TKAZIB YUBORADI (`shiftDayValue`): u kuni dars yo'q.
 * ⚠️ `max` dan keyingi kun TANLANMAYDI: o'q ham, kalendar ham to'sadi
 * (masalan "faqat o'tgan kunlar" ekranida bugun).
 *
 * @param {object} props
 * @param {string} props.value - "YYYY-MM-DD"
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.max] - "YYYY-MM-DD"
 * @param {string} [props.hint] - kalendar ostidagi izoh
 */
const DayPicker = ({ value, onChange, max, hint, className }) => {
  const [open, setOpen] = useState(false);

  const next = shiftDayValue(value, 1);
  const atMax = Boolean(max) && next > max;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl bg-white p-1",
        "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
        className,
      )}
    >
      <Arrow direction="prev" onClick={() => onChange(shiftDayValue(value, -1))} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
              "transition-colors duration-200 ease-out-quint hover:bg-slate-100",
              open && "bg-slate-100",
            )}
          >
            <CalendarDays className="size-3.5 text-slate-400" strokeWidth={2} />
            <span className={cn(T.value, "text-[12.5px] whitespace-nowrap")}>
              {formatDateUz(value)}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[268px] overflow-hidden rounded-2xl border-0 p-2 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_44px_-20px_rgba(15,23,42,0.28)]"
        >
          <CalendarPanel
            value={value}
            max={max}
            hint={hint}
            onPick={(picked) => {
              onChange(picked);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Arrow direction="next" onClick={() => onChange(next)} disabled={atMax} />
    </div>
  );
};

const Arrow = ({ direction, onClick, disabled }) => {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Oldingi kun" : "Keyingi kun"}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg transition-colors duration-200",
        disabled
          ? "cursor-not-allowed text-slate-200"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} />
    </button>
  );
};

export default DayPicker;
