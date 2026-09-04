// Icons
import { Pin } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DAY_LABEL } from "../data/planner.data";

/**
 * BITTA KUN — BITTA KARTA.
 *
 * Jadval katta to'r emas, kunlarga bo'lingan kartalar ko'rinishida: sinf
 * jadvalini odam aynan shunday o'qiydi — "dushanbada nima bor?". Katta
 * to'rda bu savolga javob berish uchun ko'z ustun sarlavhasi bilan katak
 * orasida yurib kelishi kerak bo'lardi.
 *
 * Har bir satr — bitta KATAK (kun + dars raqami). Bo'sh satr ham
 * chiziladi: "3-darsda hech narsa yo'q" degan ma'lumot ham kerak, uni
 * yashirsak sinfning oynasi ko'rinmay qolardi.
 */
const TimetableDayCard = ({
  day,
  periods,
  lessonAt,
  stateAt,
  selectedId,
  canEdit,
  onSlotClick,
  onTogglePin,
}) => (
  <div className="rounded-2xl bg-white p-2 shadow-sm">
    <p className="px-1.5 pb-1.5 text-xs font-semibold text-gray-700">
      {DAY_LABEL[day] ?? day}
    </p>

    <div className="space-y-1">
      {periods.map((period) => {
        const lesson = lessonAt(period.order);
        const state = stateAt(period.order);
        const isSelected = Boolean(lesson) && lesson.id === selectedId;
        const time = period.startTime
          ? `${period.startTime}–${period.endTime}`
          : "";

        return (
          // ⚠️ Qadash tugmasi satr tugmasining ICHIDA emas, YONIDA turadi:
          // <button> ichida ikkinchi <button> yaroqsiz HTML va ichkarisi
          // bosilmay qolardi. Shuning uchun o'rab turuvchi div `relative`.
          <div key={period.order} className="relative">
            <button
              type="button"
              disabled={!canEdit && !lesson}
              title={time ? `${period.order}-dars · ${time}` : undefined}
              onClick={() => onSlotClick(day, period.order, lesson)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                lesson
                  ? "bg-slate-100 hover:bg-slate-200"
                  : "bg-gray-50 hover:bg-gray-100",
                canEdit && lesson && "pr-6",
                // Ko'chirish belgilari faqat dars TANLANGANDA yonadi.
                isSelected && "bg-primary/10 ring-2 ring-primary",
                !isSelected && state === "move" && "bg-emerald-100",
                !isSelected && state === "swap" && "bg-amber-100",
                !isSelected && state === "blocked" && "opacity-40",
              )}
            >
              <span className="w-3.5 shrink-0 text-[11px] font-medium tabular-nums text-gray-400">
                {period.order}
              </span>

              {lesson ? (
                <>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900">
                    {lesson.subject.name}
                  </span>
                  <span className="max-w-[45%] shrink-0 truncate text-[11px] text-gray-500">
                    {lesson.teacher.fullName}
                  </span>
                </>
              ) : (
                <span className="flex-1 truncate text-[11px] text-gray-300">
                  {time || "—"}
                </span>
              )}
            </button>

            {canEdit && lesson && (
              <button
                type="button"
                title={
                  lesson.isPinned
                    ? "Qadash bekor qilinsin"
                    : "Qayta shakllantirishda joyida qolsin"
                }
                onClick={() => onTogglePin(lesson)}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5",
                  lesson.isPinned
                    ? "text-primary"
                    : "text-gray-300 hover:text-gray-500",
                )}
              >
                <Pin size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default TimetableDayCard;
