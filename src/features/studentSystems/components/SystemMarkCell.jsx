// Components
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

const personName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ");

/**
 * Bitta o'quvchi × bitta tizim katakchasi.
 *
 * Belgilangan bo'lsa — kim va qachon belgilagani maslahatda (belgi
 * "kiritildi" degan da'vo, uning muallifi ko'rinib turishi kerak).
 *
 * `disabled` — ruxsat yo'q (`studentSystems.mark`): holat ko'rinadi,
 * o'zgartirib bo'lmaydi.
 *
 * @param {object} props
 * @param {object|null} props.mark - `{ markedAt, markedBy }` yoki `null`
 * @param {string} props.label - "ERP" / "Kundalik.com"
 * @param {string} props.studentName
 * @param {boolean} props.disabled
 * @param {() => void} props.onToggle
 */
const SystemMarkCell = ({ mark, label, studentName, disabled, onToggle }) => {
  const checked = Boolean(mark);

  const hint = checked
    ? `${label} da bor · ${[personName(mark.markedBy) || "Noma'lum xodim", formatDateTimeUz(mark.markedAt)].join(", ")}`
    : `${label} da yo'q`;

  return (
    <Tooltip content={disabled ? `${hint} · belgilash uchun ruxsat yo'q` : hint}>
      <label
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg transition-colors",
          disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-100",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          aria-label={`${studentName} — ${label}`}
          className="size-[18px] cursor-pointer accent-emerald-600 disabled:cursor-not-allowed"
        />
      </label>
    </Tooltip>
  );
};

export default SystemMarkCell;
