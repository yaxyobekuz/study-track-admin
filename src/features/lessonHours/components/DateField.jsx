// React
import { useEffect, useMemo, useRef, useState } from "react";

// Icons
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { DAYS_UZ, MONTHS_UZ_CAP, formatDateUz } from "@/shared/utils/date.utils";

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
 * @param {string} [props.hint]
 */

/** Hafta kunlari — DUSHANBADAN boshlab (kalendar shu tartibda o'qiladi). */
const WEEK_HEAD = [1, 2, 3, 4, 5, 6, 0].map((index) => ({
  dayNumber: index,
  short: DAYS_UZ[index].slice(0, 2).replace(/^./, (c) => c.toUpperCase()),
  isSunday: index === 0,
}));

/** "YYYY-MM-DD" → { year, month (1-12), day } yoki null. */
const parseValue = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return null;
  return { year: +match[1], month: +match[2], day: +match[3] };
};

const toValue = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const todayParts = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

const DateField = ({ label, value, onChange, min, hint, disabled }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const parsed = parseValue(value);
  const today = todayParts();

  // Ko'rinayotgan oy — tanlangan sanadan mustaqil: odam boshqa oyga
  // qarab, hech narsa tanlamay yopishi mumkin.
  const [view, setView] = useState(() => ({
    year: parsed?.year ?? today.year,
    month: parsed?.month ?? today.month,
  }));

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

  /**
   * Oyning kataklari — birinchi kun DUSHANBAGA to'g'ri kelguncha bo'sh
   * katak qo'yiladi.
   *
   * ⚠️ Sana `Date.UTC` bilan quriladi: lokal konstruktor yozgi vaqt
   * o'tkazadigan muhitda oy chegarasini bir kunga siljitishi mumkin.
   */
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.year, view.month - 1, 1));
    const total = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();

    // `getUTCDay()`: 0 = yakshanba. Dushanbadan boshlanadigan panjarada
    // yakshanba OXIRGI ustun, shuning uchun oldingi bo'sh kataklar soni
    // "dushanbagacha necha kun" bo'ladi.
    const lead = (first.getUTCDay() + 6) % 7;

    const minParsed = parseValue(min);
    const minStamp = minParsed
      ? Date.UTC(minParsed.year, minParsed.month - 1, minParsed.day)
      : null;

    return [
      // Oy boshigacha bo'sh kataklar — kalitlari barqaror bo'lishi uchun
      // ular ham obyekt sifatida quriladi (indeksga tayanmaydi).
      ...Array.from({ length: lead }, (_, index) => ({ pad: `pad-${index}` })),
      ...Array.from({ length: total }, (_, index) => {
        const day = index + 1;
        const date = new Date(Date.UTC(view.year, view.month - 1, day));

        return {
          day,
          dayNumber: date.getUTCDay(),
          disabled: minStamp != null && date.getTime() < minStamp,
          isSelected:
            parsed?.year === view.year &&
            parsed?.month === view.month &&
            parsed?.day === day,
          isToday:
            today.year === view.year &&
            today.month === view.month &&
            today.day === day,
        };
      }),
    ];
  }, [view, min, parsed, today.year, today.month, today.day]);

  const shiftMonth = (direction) =>
    setView((prev) => {
      const next = prev.month + direction;
      if (next < 1) return { year: prev.year - 1, month: 12 };
      if (next > 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: next };
    });

  const openPanel = () => {
    // Har ochilganda ko'rinish tanlangan sanaga qaytadi — odam boshqa oyga
    // qarab yopgan bo'lsa, keyingi safar yana o'sha yerdan boshlamaydi.
    setView({
      year: parsed?.year ?? today.year,
      month: parsed?.month ?? today.month,
    });
    setOpen(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <span className={cn(T.label, "mb-1.5 block")}>{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
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
          {/* ── Oy o'qi ───────────────────────────────────────── */}
          <div className="flex items-center justify-between px-1 pb-1.5">
            <Arrow direction="prev" onClick={() => shiftMonth(-1)} />
            <span className={cn(T.value, "text-[12.5px]")}>
              {MONTHS_UZ_CAP[view.month - 1]}, {view.year}
            </span>
            <Arrow direction="next" onClick={() => shiftMonth(1)} />
          </div>

          {/* ── Hafta kunlari ─────────────────────────────────── */}
          <div className="grid grid-cols-7 gap-0.5 pb-1">
            {WEEK_HEAD.map((head) => (
              <span
                key={head.dayNumber}
                className={cn(
                  "py-1 text-center text-[10px] font-medium uppercase tracking-[0.05em]",
                  head.isSunday ? "text-slate-300" : "text-slate-400",
                )}
              >
                {head.short}
              </span>
            ))}
          </div>

          {/* ── Kunlar ────────────────────────────────────────── */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell) =>
              cell.pad ? (
                <span key={cell.pad} />
              ) : (
                <button
                  key={cell.day}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => {
                    onChange?.(toValue(view.year, view.month, cell.day));
                    setOpen(false);
                  }}
                  className={cn(
                    "relative h-8 rounded-lg text-[12px] font-medium tabular-nums",
                    "transition-colors duration-200 ease-out-quint",
                    cell.disabled && "cursor-not-allowed text-slate-200",
                    !cell.disabled &&
                      !cell.isSelected &&
                      (cell.dayNumber === 0
                        ? "text-slate-400 hover:bg-slate-100"
                        : "text-slate-700 hover:bg-slate-100"),
                    cell.isSelected && "bg-slate-900 text-white",
                  )}
                >
                  {cell.day}

                  {/* Bugun — tanlanmagan bo'lsa ham ko'rinadi */}
                  {cell.isToday && !cell.isSelected && (
                    <span className="absolute inset-x-0 bottom-1 mx-auto block size-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              ),
            )}
          </div>

          <div className="mt-1 flex items-center justify-between px-1 pt-1.5">
            <span className={T.meta}>{hint ?? "Kunni tanlang"}</span>
            <button
              type="button"
              onClick={() => {
                onChange?.(toValue(today.year, today.month, today.day));
                setOpen(false);
              }}
              className="rounded-lg px-2 py-1 text-[11.5px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
            >
              Bugun
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Arrow = ({ direction, onClick }) => {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Oldingi oy" : "Keyingi oy"}
      className="flex size-6 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
    >
      <Icon className="size-3" strokeWidth={2.2} />
    </button>
  );
};

export default DateField;
