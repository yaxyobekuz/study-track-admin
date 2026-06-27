// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";

// Data
import { STATUS_COLORS, MARK_STATUS_OPTIONS } from "../data/attendance.data";

/**
 * Davomat belgilash paneli: "barchasini belgilash" tugmalari + saqlash.
 * @param {Function} onBulk - (status) => void, barcha qatorlarni shu statusga qo'yadi
 * @param {number} dirtyCount - saqlanadigan o'zgarishlar soni
 * @param {Function} onSave - saqlash
 * @param {boolean} isSaving - saqlanmoqda holati
 */
const MarkToolbar = ({ onBulk, dirtyCount = 0, onSave, isSaving = false }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">Barchasini belgilash:</span>

      {MARK_STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onBulk(opt.value)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium border border-transparent transition-opacity hover:opacity-80",
            STATUS_COLORS[opt.value],
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">
        {dirtyCount > 0 ? `${dirtyCount} ta o'zgarish` : "O'zgarish yo'q"}
      </span>

      <Button
        type="button"
        disabled={dirtyCount === 0 || isSaving}
        onClick={onSave}
        className="min-w-28"
      >
        {isSaving ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  </div>
);

export default MarkToolbar;
