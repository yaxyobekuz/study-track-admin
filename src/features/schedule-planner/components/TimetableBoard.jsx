// Components
import TimetableDayCard from "./TimetableDayCard";

/**
 * DARS JADVALI TAXTASI.
 *
 * Ikkita ko'rinishi bor va ikkalasi ham BITTA g'ishtdan — kun kartasidan —
 * yig'iladi. Farqi faqat joylashuvda, shuning uchun ikkita alohida jadval
 * komponenti yozilmaydi:
 *
 *   bitta sinf   → kun kartalari yonma-yon to'r bo'lib (haftaning hammasi
 *                  bir ekranda ko'rinadi);
 *   barcha sinf  → har sinf o'z USTUNI bo'lib, ustun ichida kunlar pastga
 *                  qatoriladi (sinflarni yonma-yon solishtirish uchun).
 *
 * Qaysi ko'rinish chizilishini `classes` uzunligi hal qiladi — sahifa
 * shunchaki bitta sinfni yoki hammasini uzatadi.
 */
const TimetableBoard = ({
  classes,
  days,
  periods,
  lessonAt,
  stateAt,
  selectedId,
  canEdit,
  onSlotClick,
  onTogglePin,
}) => {
  if (periods.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
        Dars soatlari belgilanmagan — Sozlamalar tabidan qo`shing.
      </p>
    );
  }

  const cardProps = (classId, day) => ({
    day,
    periods,
    canEdit,
    selectedId,
    onTogglePin,
    lessonAt: (order) => lessonAt(classId, day, order),
    stateAt: (order) => stateAt(classId, day, order),
    onSlotClick: (slotDay, order, lesson) =>
      onSlotClick(classId, slotDay, order, lesson),
  });

  // ── Bitta sinf: hafta bir ekranda ──
  if (classes.length === 1) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <TimetableDayCard key={day} {...cardProps(classes[0].id, day)} />
        ))}
      </div>
    );
  }

  // ── Barcha sinflar: har biri ustun ──
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {classes.map((cls) => (
        <div key={cls.id} className="w-64 shrink-0 space-y-2">
          <p className="truncate rounded-xl bg-primary px-3 py-1.5 text-center text-sm font-semibold text-white">
            {cls.name}
          </p>

          {days.map((day) => (
            <TimetableDayCard key={day} {...cardProps(cls.id, day)} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TimetableBoard;
