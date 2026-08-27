// Icons
import { Pin } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DAY_LABEL } from "../data/planner.data";

/**
 * HAFTALIK JADVAL — satr: dars, ustun: kun.
 *
 * QO'LDA KO'CHIRISH bosish orqali ishlaydi, sudrash orqali emas: loyihada
 * drag-and-drop kutubxonasi yo'q, qo'l bilan yozilgan DnD esa sensorli
 * ekranda deyarli ishlamaydi. Bosish naqshi ikkalasida ham bir xil:
 *   1-bosish — darsni tanlaydi, mos kataklar yonadi;
 *   2-bosish — o'sha katakka ko'chiradi (yoki almashtiradi).
 */
const TimetableGrid = ({
  days,
  periods,
  cellFor,
  stateFor,
  selectedId,
  canEdit,
  onCellClick,
  onTogglePin,
  secondaryOf,
}) => {
  if (periods.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
        Dars soatlari belgilanmagan — Sozlamalar tabidan qo'shing.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-3">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500">
              Dars
            </th>
            {days.map((day) => (
              <th
                key={day}
                className="px-1 py-2 text-center text-sm font-medium text-gray-700"
              >
                {DAY_LABEL[day] ?? day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {periods.map((period) => (
            <tr key={period.order}>
              <td className="px-2 py-1 align-top">
                <span className="block font-medium text-gray-900">
                  {period.order}-dars
                </span>
                {period.startTime && (
                  <span className="block text-xs text-gray-500">
                    {period.startTime}–{period.endTime}
                  </span>
                )}
              </td>

              {days.map((day) => {
                const lesson = cellFor(day, period.order);
                const state = stateFor(day, period.order);
                const isSelected = lesson && lesson.id === selectedId;

                return (
                  <td key={day} className="p-1 align-top">
                    <button
                      type="button"
                      disabled={!canEdit && !lesson}
                      onClick={() => onCellClick(day, period.order, lesson)}
                      className={cn(
                        "relative h-[62px] w-full min-w-32 rounded-xl border px-2 py-1.5 text-left transition-colors",
                        lesson
                          ? "border-gray-200 bg-white hover:border-gray-300"
                          : "border-dashed border-gray-200 bg-gray-50/60",
                        isSelected &&
                          "border-primary ring-2 ring-primary/30 bg-primary/5",
                        !isSelected && state === "move" && "border-emerald-400 bg-emerald-50",
                        !isSelected && state === "swap" && "border-amber-400 bg-amber-50",
                        !isSelected && state === "blocked" && "opacity-40",
                        state === "busy" && "border-red-200 bg-red-50/70",
                      )}
                    >
                      {lesson ? (
                        <>
                          <span className="block truncate font-medium text-gray-900">
                            {lesson.subject.name}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            {secondaryOf(lesson)}
                          </span>

                          {canEdit && (
                            <span
                              role="button"
                              tabIndex={-1}
                              title={
                                lesson.isPinned
                                  ? "Qadash bekor qilinsin"
                                  : "Qayta shakllantirishda joyida qolsin"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(lesson);
                              }}
                              className={cn(
                                "absolute right-1 top-1 rounded p-0.5",
                                lesson.isPinned
                                  ? "text-primary"
                                  : "text-gray-300 hover:text-gray-500",
                              )}
                            >
                              <Pin size={14} strokeWidth={1.5} />
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block text-xs text-gray-400">
                          {state === "busy" ? "Band" : ""}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;
