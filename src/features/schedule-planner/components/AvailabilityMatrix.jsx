// React
import { useMemo } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DAY_LABEL } from "../data/planner.data";

/**
 * BANDLIK MATRITSASI — satr: o'qituvchi, ustun: (kun × dars).
 *
 * Bitta ekranda ikkala savolga javob beradi: "kim qachon band?" va "shu
 * soatda kim bo'sh?". Katakni bosish band/bo'sh holatini almashtiradi, ya'ni
 * bu yerda ham ko'rasan, ham tahrirlaysan — ikkinchi ekranga o'tish shart
 * emas.
 *
 * Kunlar orasida qalinroq chegara bor: 42 ta bir xil katak orasidan kun
 * chegarasini topish qiyin bo'lardi.
 */
const AvailabilityMatrix = ({
  teachers,
  days,
  periods,
  slotSummary,
  canEdit,
  onToggle,
}) => {
  const busyIndex = useMemo(() => {
    const set = new Set();
    for (const teacher of teachers) {
      for (const slot of teacher.busy) {
        set.add(`${teacher.id}|${slot.day}|${slot.order}`);
      }
    }
    return set;
  }, [teachers]);

  const summaryIndex = useMemo(
    () => new Map(slotSummary.map((s) => [`${s.day}|${s.order}`, s])),
    [slotSummary],
  );

  if (teachers.length === 0 || periods.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-20 min-w-44 border-b border-r border-gray-200 bg-white px-3 py-2 text-left font-medium text-gray-700"
            >
              O'qituvchi
            </th>
            {days.map((day) => (
              <th
                key={day}
                colSpan={periods.length}
                className="border-b border-l-2 border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-xs font-medium text-gray-600"
              >
                {DAY_LABEL[day] ?? day}
              </th>
            ))}
          </tr>
          <tr>
            {days.map((day) =>
              periods.map((period, index) => (
                <th
                  key={`${day}|${period.order}`}
                  title={
                    period.startTime
                      ? `${period.startTime}–${period.endTime}`
                      : undefined
                  }
                  className={cn(
                    "w-7 border-b border-gray-200 bg-gray-50 px-0 py-1 text-center text-[11px] font-normal text-gray-500",
                    index === 0 && "border-l-2",
                  )}
                >
                  {period.order}
                </th>
              )),
            )}
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id} className="group">
              <td className="sticky left-0 z-10 border-b border-r border-gray-100 bg-white px-3 py-1.5 group-hover:bg-gray-50">
                <span className="block truncate font-medium text-gray-900">
                  {teacher.fullName}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {teacher.subjects.map((s) => s.name).join(", ") ||
                    "Fan biriktirilmagan"}
                </span>
              </td>

              {days.map((day) =>
                periods.map((period, index) => {
                  const isBusy = busyIndex.has(
                    `${teacher.id}|${day}|${period.order}`,
                  );
                  return (
                    <td
                      key={`${day}|${period.order}`}
                      className={cn(
                        "border-b border-gray-100 p-0",
                        index === 0 && "border-l-2 border-l-gray-200",
                      )}
                    >
                      <button
                        type="button"
                        disabled={!canEdit}
                        aria-label={`${teacher.fullName} · ${DAY_LABEL[day]} · ${period.order}-dars`}
                        aria-pressed={isBusy}
                        onClick={() => onToggle(teacher.id, day, period.order)}
                        className={cn(
                          "block size-7 transition-colors",
                          isBusy
                            ? "bg-red-400 hover:bg-red-500"
                            : "bg-gray-100 hover:bg-gray-300",
                          !canEdit && "cursor-default",
                        )}
                      />
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className="sticky left-0 z-10 border-t border-r border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
              Bo'sh o'qituvchi
            </td>
            {days.map((day) =>
              periods.map((period, index) => {
                const summary = summaryIndex.get(`${day}|${period.order}`);
                const free = summary?.free ?? teachers.length;
                const ratio = teachers.length ? free / teachers.length : 1;
                return (
                  <td
                    key={`${day}|${period.order}`}
                    title={`${DAY_LABEL[day]} · ${period.order}-dars: ${free} ta bo'sh`}
                    className={cn(
                      "border-t border-gray-200 px-0 py-1 text-center text-[11px]",
                      index === 0 && "border-l-2 border-l-gray-200",
                      ratio < 0.25
                        ? "font-medium text-red-600"
                        : ratio < 0.6
                          ? "text-amber-600"
                          : "text-gray-500",
                    )}
                  >
                    {free}
                  </td>
                );
              }),
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AvailabilityMatrix;
