// React
import { useMemo, useState } from "react";

// Icons
import { ChevronLeft, ChevronRight } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { DAYS_UZ, MONTHS_UZ_CAP } from "@/shared/utils/date.utils";

// Tokens
import { T } from "../data/ledger.tokens";

/**
 * KALENDAR PANELI — oy o'qi, hafta kunlari va kunlar panjarasi.
 *
 * ⚠️ YAGONA NUSXA. Ilgari panel `DateField` ichida edi; kun tanlagich
 * (`DayPicker`) ham xuddi shu kalendarni ko'rsatishi kerak bo'lgach, u shu
 * faylga chiqarildi — ikki nusxa bo'lsa, birida yakshanba rangi yoki
 * `min`/`max` qoidasi o'zgarib, ikkinchisida eskirib qolardi.
 *
 * Panel faqat ICHKI qismni chizadi: qobiq (soya, burchak, ochilish usuli)
 * chaqiruvchida — `DateField` uni oqim ichida, `DayPicker` esa popoverda
 * ochadi.
 *
 * ⚠️ "BUGUN" TUGMASI `min`/`max` ga BO'YSUNADI. Ilgari u chegarani
 * chetlab o'tardi: faqat o'tgan kunlar ochiladigan oynada "Bugun" bosilsa,
 * server so'rovni rad etardi.
 *
 * ⚠️ QIYMAT — "YYYY-MM-DD", ya'ni MASHINA QIYMATI: u API'ga boradi.
 * Ekranda faqat oy nomi va kun raqami ko'rinadi (`.claude/rules/dates.md`).
 *
 * @param {object} props
 * @param {string} [props.value] - "YYYY-MM-DD"
 * @param {(value: string) => void} props.onPick
 * @param {string} [props.min] - "YYYY-MM-DD" (shu kundan oldingilari yopiq)
 * @param {string} [props.max] - "YYYY-MM-DD" (shu kundan keyingilari yopiq)
 * @param {string} [props.hint] - pastki qatordagi izoh
 */

/** Hafta kunlari — DUSHANBADAN boshlab (kalendar shu tartibda o'qiladi). */
const WEEK_HEAD = [1, 2, 3, 4, 5, 6, 0].map((index) => ({
  dayNumber: index,
  short: DAYS_UZ[index].slice(0, 2).replace(/^./, (c) => c.toUpperCase()),
  isSunday: index === 0,
}));

/** "YYYY-MM-DD" → { year, month (1-12), day } yoki null. */
const parseDayValue = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return null;
  return { year: +match[1], month: +match[2], day: +match[3] };
};

const toDayValue = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const todayParts = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

/** "YYYY-MM-DD" → UTC vaqt tamg'asi (taqqoslash uchun) yoki null. */
const stampOf = (value) => {
  const parts = parseDayValue(value);
  return parts ? Date.UTC(parts.year, parts.month - 1, parts.day) : null;
};

/** Kun `[min, max]` oralig'idan tashqaridami (chegaralar ixtiyoriy). */
const isOutOfRange = (stamp, minStamp, maxStamp) =>
  (minStamp != null && stamp < minStamp) || (maxStamp != null && stamp > maxStamp);

const CalendarPanel = ({ value, onPick, min, max, hint }) => {
  const parsed = parseDayValue(value);
  const today = todayParts();

  // Ko'rinayotgan oy — tanlangan sanadan mustaqil: odam boshqa oyga
  // qarab, hech narsa tanlamay yopishi mumkin. Panel har ochilganda yangidan
  // quriladi, ya'ni ko'rinish tanlangan sanaga o'zi qaytadi.
  const [view, setView] = useState(() => ({
    year: parsed?.year ?? today.year,
    month: parsed?.month ?? today.month,
  }));

  const minStamp = stampOf(min);
  const maxStamp = stampOf(max);

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
          disabled: isOutOfRange(date.getTime(), minStamp, maxStamp),
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
  }, [view, minStamp, maxStamp, parsed?.year, parsed?.month, parsed?.day, today.year, today.month, today.day]);

  const shiftMonth = (direction) =>
    setView((prev) => {
      const next = prev.month + direction;
      if (next < 1) return { year: prev.year - 1, month: 12 };
      if (next > 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: next };
    });

  const todayDisabled = isOutOfRange(
    Date.UTC(today.year, today.month - 1, today.day),
    minStamp,
    maxStamp,
  );

  return (
    <>
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
              onClick={() => onPick?.(toDayValue(view.year, view.month, cell.day))}
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
          disabled={todayDisabled}
          onClick={() => onPick?.(toDayValue(today.year, today.month, today.day))}
          className={cn(
            "rounded-lg px-2 py-1 text-[11.5px] font-medium transition-colors duration-200",
            todayDisabled
              ? "cursor-not-allowed text-slate-300"
              : "text-indigo-600 hover:bg-indigo-50",
          )}
        >
          Bugun
        </button>
      </div>
    </>
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

export default CalendarPanel;
