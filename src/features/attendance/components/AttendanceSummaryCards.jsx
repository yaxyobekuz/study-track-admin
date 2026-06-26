// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Davomat sahifalaridagi yig'indi kartalari - barcha sahifalarda bir xil dizayn.
 * @param {Array} cards - [{ key, label, color }]
 * @param {Object} summary - { [key]: number }
 * @param {string} className - grid ustunlarini moslash uchun (karta soni har xil)
 */
const AttendanceSummaryCards = ({ cards = [], summary = {}, className = "" }) => {
  if (!cards.length) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {cards.map(({ key, label, color }) => (
        <div
          key={key}
          className={cn("rounded-xl px-4 py-3 text-center", color)}
        >
          <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
          <p className="text-xs mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummaryCards;
