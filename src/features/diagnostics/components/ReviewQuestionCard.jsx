// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { Check, RefreshCw, X } from "lucide-react";

/**
 * KO'RIB CHIQISHDAGI BITTA SAVOL.
 *
 * ⚠️ TO'G'RI JAVOB KO'RINADI va bu ataylab: tasdiqlash "savol to'g'rimi"
 * degan qarorni talab qiladi va javob kalitini ko'rmasdan bu qarorni
 * qabul qilib bo'lmaydi. Yo'l ADMIN ruxsati ortida; o'quvchi yo'li
 * kalitni HECH QACHON bermaydi.
 *
 * ⚠️ ALMASHTIRISH TUGMASI HAR SAVOLDA: "bitta savolni almashtirish" —
 * eng ko'p kerak bo'ladigan amal (bitta savol xato yozilgan). Tanlab
 * almashtirish uchun esa belgi (checkbox) ishlatiladi.
 */
const ReviewQuestionCard = ({
  question,
  index,
  isSelected,
  onToggle,
  onRegenerate,
  disabled,
  editable,
}) => {
  if (!question) return null;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        isSelected ? "border-primary bg-primary/5" : "border-gray-200",
      )}
    >
      <div className="flex items-start gap-2.5">
        {editable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mt-1 size-4 shrink-0 rounded border-gray-300"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
              {index + 1}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
              {question.code}
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-medium",
                question.levelKey === "easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : question.levelKey === "hard"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700",
              )}
            >
              {question.levelKeyLabel}
            </span>
            {question.topic && (
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                {question.topic.order}-mavzu
              </span>
            )}
            {question.source === "ai" && (
              <span className="rounded bg-violet-50 px-1.5 py-0.5 font-medium text-violet-700">
                AI yozgan
              </span>
            )}
            {question.status !== "approved" && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
                Tasdiqlanmagan
              </span>
            )}
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
            {question.text}
          </p>

          {/* Variantlar — to'g'risi belgilangan holda */}
          {question.options?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={cn(
                    "flex items-start gap-1.5 text-xs",
                    option.isCorrect
                      ? "font-medium text-emerald-700"
                      : "text-gray-600",
                  )}
                >
                  {option.isCorrect ? (
                    <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                  ) : (
                    <X className="mt-0.5 size-3.5 shrink-0 text-gray-300" strokeWidth={2} />
                  )}
                  <span>{option.text}</span>
                </li>
              ))}
            </ul>
          )}

          {question.explanation && (
            <p className="mt-2 rounded-lg bg-gray-50 p-2 text-[11px] text-gray-600">
              {question.explanation}
            </p>
          )}
        </div>

        {editable && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={disabled}
            title="Bu savolni almashtirish"
            className="shrink-0 rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
          >
            <RefreshCw className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewQuestionCard;
