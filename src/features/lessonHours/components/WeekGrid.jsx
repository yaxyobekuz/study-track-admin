// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { SURFACE, T } from "../data/ledger.tokens";

/**
 * HAFTALIK YUKLAMA — olti kun, har biri ustun.
 *
 * ⚠️ YAKSHANBA YO'Q va bu qo'shimcha shart emas: `ScheduleDay` enumida
 * yakshanba umuman mavjud emas, ya'ni server bu kunni hech qachon
 * qaytarmaydi. Bo'sh yakshanba ustuni "bu kuni dars bekor qilingan" deb
 * o'qilardi.
 *
 * ⚠️ DARSI YO'Q KUN HAM CHIZILADI — "payshanbada dars yo'q" ham
 * ma'lumot (`teacherWorkload.service.js` dagi bilan bir xil qaror).
 *
 * @param {Array<{dayNumber, dayLabel, hours, occurrences}>} byDay
 * @param {number} weeklyHours - shablon bo'yicha haftalik soat
 */
const WEEK = [
  { dayNumber: 1, label: "Du" },
  { dayNumber: 2, label: "Se" },
  { dayNumber: 3, label: "Ch" },
  { dayNumber: 4, label: "Pa" },
  { dayNumber: 5, label: "Ju" },
  { dayNumber: 6, label: "Sh" },
];

const WeekGrid = ({ byDay = [], weeklyHours = 0 }) => {
  const map = new Map(byDay.map((row) => [row.dayNumber, row]));
  const max = Math.max(1, ...byDay.map((row) => row.hours));

  return (
    <div>
      <div className="flex items-end gap-1.5">
        {WEEK.map((day, index) => {
          const row = map.get(day.dayNumber);
          const hours = row?.hours ?? 0;
          const height = hours > 0 ? Math.max(10, (hours / max) * 72) : 4;

          return (
            <div
              key={day.dayNumber}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "text-[10.5px] font-semibold tabular-nums",
                  hours > 0 ? "text-slate-700" : "text-slate-300",
                )}
              >
                {hours || "—"}
              </span>

              <div
                className={cn(
                  "w-full rounded-lg origin-bottom motion-safe:animate-post",
                  hours > 0 ? "bg-indigo-500" : "bg-slate-200",
                )}
                style={{ height: `${height}px`, animationDelay: `${index * 45}ms` }}
                title={
                  row
                    ? `${row.dayLabel}: ${hours} soat (${row.occurrences} kun)`
                    : "Dars yo'q"
                }
              />

              <span className={cn(T.meta, hours === 0 && "text-slate-300")}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className={cn(SURFACE.tile, "mt-3 flex items-center justify-between py-2.5")}>
        <span className={T.label}>Haftasiga (jadval bo'yicha)</span>
        <span className={cn(T.value, "text-[13px]")}>{weeklyHours} soat</span>
      </div>
    </div>
  );
};

export default WeekGrid;
