// React
import { useRef, useState } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DAY_LABEL } from "../data/planner.data";

/**
 * BITTA O'QITUVCHINING HAFTASI — satr: dars, ustun: kun.
 *
 * Sichqonchani bosib SUDRAB bir necha katakni bir yo'la bo'yash mumkin:
 * "seshanba kuni tushdan keyin bo'lmayman" degan holat 8 ta alohida bosish
 * emas, bitta harakat bo'lishi kerak.
 *
 * Sudrash boshlangan katakning holati BUTUN harakat uchun maqsad holatini
 * belgilaydi (bo'shdan boshlansa — hammasini band qiladi, aksincha —
 * bo'shatadi). Aks holda ustidan o'tgan kataklar navbat bilan yonib-o'chib
 * chiqardi.
 */
const AvailabilityTeacherGrid = ({
  days,
  periods,
  busy,
  canEdit,
  onToggle,
  onBulk,
}) => {
  const busySet = new Set(busy.map((slot) => `${slot.day}|${slot.order}`));
  const [painting, setPainting] = useState(null); // { target: boolean, touched: Set }
  const gridRef = useRef(null);

  const isBusy = (day, order) => busySet.has(`${day}|${order}`);

  const startPaint = (day, order) => {
    if (!canEdit) return;
    const target = !isBusy(day, order);
    setPainting({ target, touched: new Set([`${day}|${order}`]) });
    onToggle(day, order);
  };

  const paintOver = (day, order) => {
    if (!painting) return;
    const key = `${day}|${order}`;
    if (painting.touched.has(key)) return;
    if (isBusy(day, order) === painting.target) return;
    painting.touched.add(key);
    onToggle(day, order);
  };

  const endPaint = () => setPainting(null);

  // Butun kun / butun dars qatorini almashtirish.
  const toggleDay = (day) => {
    if (!canEdit) return;
    const allBusy = periods.every((p) => isBusy(day, p.order));
    onBulk(
      periods.map((p) => ({ day, order: p.order })),
      !allBusy,
    );
  };

  const togglePeriod = (order) => {
    if (!canEdit) return;
    const allBusy = days.every((day) => isBusy(day, order));
    onBulk(
      days.map((day) => ({ day, order })),
      !allBusy,
    );
  };

  if (periods.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
        Dars soatlari belgilanmagan — Sozlamalar tabidan qo'shing.
      </p>
    );
  }

  return (
    <div
      ref={gridRef}
      onMouseUp={endPaint}
      onMouseLeave={endPaint}
      className="overflow-x-auto rounded-2xl bg-white p-3"
    >
      <table className="min-w-full select-none text-sm">
        <thead>
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">
              Dars
            </th>
            {days.map((day) => (
              <th key={day} className="px-1 py-2">
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  disabled={!canEdit}
                  title="Butun kunni almashtirish"
                  className="w-full rounded-lg px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  {DAY_LABEL[day] ?? day}
                </button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {periods.map((period) => (
            <tr key={period.order}>
              <td className="px-2 py-1">
                <button
                  type="button"
                  onClick={() => togglePeriod(period.order)}
                  disabled={!canEdit}
                  title="Butun dars qatorini almashtirish"
                  className="rounded-lg px-2 py-1 text-left hover:bg-gray-100 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className="block font-medium text-gray-900">
                    {period.order}-dars
                  </span>
                  {period.startTime && (
                    <span className="block text-xs text-gray-500">
                      {period.startTime}–{period.endTime}
                    </span>
                  )}
                </button>
              </td>

              {days.map((day) => {
                const busyHere = isBusy(day, period.order);
                return (
                  <td key={day} className="px-1 py-1">
                    <button
                      type="button"
                      disabled={!canEdit}
                      aria-pressed={busyHere}
                      onMouseDown={() => startPaint(day, period.order)}
                      onMouseEnter={() => paintOver(day, period.order)}
                      className={cn(
                        "h-12 w-full rounded-lg border text-xs font-medium transition-colors",
                        busyHere
                          ? "border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100",
                        !canEdit && "cursor-default",
                      )}
                    >
                      {busyHere ? "Band" : "Bo'sh"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 px-2 text-xs text-gray-500">
        Katakni bosing yoki bosib turib suring. Kun nomini yoki dars raqamini
        bosish butun qator/ustunni almashtiradi.
      </p>
    </div>
  );
};

export default AvailabilityTeacherGrid;
