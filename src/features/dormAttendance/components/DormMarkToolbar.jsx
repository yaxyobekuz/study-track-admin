// Icons
import { X } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { DORM_STATUS_COLORS, DORM_STATUS_OPTIONS } from "../data/dormAttendance.data";

/**
 * BELGILASH PANELI.
 *
 * Ikki rejim bir panelda:
 *   · tanlov BO'SH — tugmalar KO'RINAYOTGAN hamma qatorga qo'llanadi
 *     ("butun sinf yotoqxonada");
 *   · tanlov BOR — faqat tanlanganlarga ("o'zi xohlagancha belgilab olib").
 *
 * ⚠️ TUGMA QAMROVI YOZILIB TURADI ("Tanlangan 12 ta" / "Ko'rinayotgan
 * 173 ta"): ikki rejim bitta panelda bo'lgani uchun tarbiyachi nimaga
 * bosayotganini ko'rmasa, bir bosishda butun maktabni "keldi" qilib
 * qo'yishi mumkin edi.
 *
 * ⚠️ Belgilash DARHOL saqlanmaydi — "Saqlash" bosiladi. Har tugma serverga
 * ketsa, 170 qatorli ro'yxatda yuzlab so'rov va yarim saqlangan davomat
 * paydo bo'lardi.
 *
 * @param {object} props
 * @param {number} props.visibleCount
 * @param {number} props.selectedCount
 * @param {(status: string) => void} props.onBulk
 * @param {() => void} props.onClearSelection
 * @param {number} props.dirtyCount
 * @param {() => void} props.onSave
 * @param {boolean} [props.isSaving]
 * @param {boolean} [props.disabled] - vaqt / kun darvozasi yopiq
 * @param {string} [props.disabledMessage]
 */
const DormMarkToolbar = ({
  visibleCount = 0,
  selectedCount = 0,
  onBulk,
  onClearSelection,
  dirtyCount = 0,
  onSave,
  isSaving = false,
  disabled = false,
  disabledMessage,
}) => {
  const scopeLabel =
    selectedCount > 0
      ? `Tanlangan ${selectedCount} ta`
      : `Ko'rinayotgan ${visibleCount} ta`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">{scopeLabel}:</span>

        {DORM_STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || visibleCount === 0}
            onClick={() => onBulk(option.value)}
            className={cn(DORM_STATUS_COLORS[option.value], "border-transparent")}
          >
            {option.label}
          </Button>
        ))}

        {selectedCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-gray-500"
          >
            <X strokeWidth={1.5} />
            Tanlovni bekor qilish
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {disabled
            ? disabledMessage
            : dirtyCount > 0
              ? `${dirtyCount} ta o'zgarish`
              : "O'zgarish yo'q"}
        </span>

        <Button
          type="button"
          disabled={disabled || dirtyCount === 0 || isSaving}
          onClick={onSave}
          className="min-w-28"
        >
          {isSaving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default DormMarkToolbar;
