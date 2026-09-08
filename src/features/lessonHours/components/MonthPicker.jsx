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

// Utils
import { cn } from "@/shared/utils/cn";
import { MONTHS_UZ_CAP } from "@/shared/utils/date.utils";
import {
  currentMonthKey,
  formatMonthKey,
  nextMonthKey,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Tokens
import { T } from "../data/ledger.tokens";

/**
 * OY TANLAGICH — yil o'qi va 12 oy panjarasi.
 *
 * ⚠️ `<input type="month">` EMAS. Nativ element har OS da boshqacha
 * ko'rinadi (Chrome'da kulrang ochiladigan ro'yxat, Safari'da butunlay
 * boshqa), o'zbekcha oy nomlarini bilmaydi va uni ekranning qolgan
 * qismiga moslab bo'lmaydi — chegarasiz, jiddiy uslubdagi bo'limda u
 * yagona begona element bo'lib qolardi.
 *
 * ⚠️ OY NOMLARI `date.utils.js` DAN. Bu tizimdagi oy nomlarining YAGONA
 * manbai; nusxa massiv yozish aynan sana qoidasi buzilishining sababi
 * bo'lgan (`.claude/rules/dates.md` §2).
 *
 * ⚠️ KELAJAK TO'SILGAN. Kelgusi oyda dars jadvali bor, lekin
 * "hisoblanmoqda" degan raqam yo'q — u hali majburiyat emas
 * (`education.md` §1). Bosib bo'lmaydigan tugma shuni ko'rsatadi.
 *
 * @param {object} props
 * @param {number} props.month - YYYYMM
 * @param {(month: number) => void} props.onChange
 */
const MonthPicker = ({ month, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const current = currentMonthKey();

  // Panjarada ko'rinayotgan YIL — tanlangan oydan MUSTAQIL: odam 2025 ga
  // qarab, hech narsa tanlamay yopishi ham mumkin.
  //
  // ⚠️ `useEffect` bilan sinxronlanmaydi. Effekt ichida `setState` qo'shimcha
  // render bosqichini keltirib chiqaradi va React uni ogohlantirish bilan
  // belgilaydi. Kerakli xatti-harakat oddiyroq: oyna HAR OCHILGANDA yil
  // tanlangan oydan qayta olinadi (`onOpenChange`), yopiq turganda esa uni
  // kuzatib turishning ma'nosi yo'q.
  const [year, setYear] = useState(() => Math.trunc(month / 100));

  const atCurrent = month >= current;
  const currentYear = Math.trunc(current / 100);

  const shift = (direction) => {
    const next = direction < 0 ? prevMonthKey(month) : nextMonthKey(month);
    if (next > current) return;
    onChange(next);
  };

  const pick = (index) => {
    const key = year * 100 + index + 1;
    if (key > current) return;
    onChange(key);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl bg-white p-1",
        "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
        className,
      )}
    >
      <Arrow direction="prev" onClick={() => shift(-1)} />

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setYear(Math.trunc(month / 100));
          setOpen(next);
        }}
      >
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
              {formatMonthKey(month)}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[268px] overflow-hidden rounded-2xl border-0 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_44px_-20px_rgba(15,23,42,0.28)]"
        >
          {/* ── Yil o'qi ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <Arrow direction="prev" onClick={() => setYear((y) => y - 1)} small />
            <span className={cn(T.value, "text-[13px] tabular-nums")}>{year}</span>
            <Arrow
              direction="next"
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= currentYear}
              small
            />
          </div>

          <span className="block h-px bg-slate-100" />

          {/* ── 12 oy ────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-1 p-2">
            {MONTHS_UZ_CAP.map((name, index) => {
              const key = year * 100 + index + 1;
              const isFuture = key > current;
              const isSelected = key === month;
              const isNow = key === current;

              return (
                <button
                  key={name}
                  type="button"
                  disabled={isFuture}
                  onClick={() => pick(index)}
                  className={cn(
                    "relative rounded-lg py-2 text-[12px] font-medium",
                    "transition-colors duration-200 ease-out-quint",
                    isFuture && "cursor-not-allowed text-slate-300",
                    !isFuture && !isSelected && "text-slate-600 hover:bg-slate-100",
                    isSelected && "bg-slate-900 text-white",
                  )}
                >
                  {name.slice(0, 3)}

                  {/* Joriy oy belgisi — tanlanmagan bo'lsa ham ko'rinadi:
                      "hozir qayerdaman" degan savol har doim ochiq turadi. */}
                  {isNow && !isSelected && (
                    <span className="absolute inset-x-0 -bottom-0 mx-auto block size-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          <span className="block h-px bg-slate-100" />

          <div className="flex items-center justify-between px-3 py-2">
            <span className={T.meta}>Kelgusi oylar hali majburiyat emas</span>
            <button
              type="button"
              onClick={() => {
                onChange(current);
                setOpen(false);
              }}
              className="rounded-lg px-2 py-1 text-[11.5px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
            >
              Shu oy
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Arrow direction="next" onClick={() => shift(1)} disabled={atCurrent} />
    </div>
  );
};

const Arrow = ({ direction, onClick, disabled, small }) => {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Oldingi" : "Keyingi"}
      className={cn(
        "flex items-center justify-center rounded-lg transition-colors duration-200",
        small ? "size-6" : "size-7",
        disabled
          ? "cursor-not-allowed text-slate-200"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
      )}
    >
      <Icon className={small ? "size-3" : "size-3.5"} strokeWidth={2.2} />
    </button>
  );
};

export default MonthPicker;
