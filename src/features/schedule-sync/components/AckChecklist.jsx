// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Talab qilingan ogohlantirishlar — har biri alohida belgilanadi.
 *
 * ⚠️ Hammasi BELGILANMAGAN holda chiziladi va "hammasini belgilash"
 * tugmasi ATAYLAB yo'q: har biri butun maktabga ta'sir qiladigan oqibat
 * (sinf jadvali olib tashlanadi, bugungi darslar o'zgaradi, oylik
 * qayta hisoblanadi) va odam uni o'qib tasdiqlashi kerak.
 *
 * @param {object} props
 * @param {Array<{code: string, title: string, message: string}>} props.acks
 * @param {Set<string>} props.acked
 * @param {Set<string>} [props.missing] - server "tasdiqlanmagan" degan kodlar
 * @param {(code: string) => void} props.onToggle
 * @param {boolean} [props.disabled]
 */
const AckChecklist = ({
  acks = [],
  acked,
  missing = new Set(),
  onToggle,
  disabled = false,
}) => {
  if (acks.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-gray-900">
        Tasdiqlang: quyidagilar bilan tanishdim
      </legend>

      {acks.map((ack) => {
        const id = `ack-${ack.code}`;
        const isMissing = missing.has(ack.code);

        return (
          <label
            key={ack.code}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
              acked.has(ack.code)
                ? "border-blue-200 bg-blue-50/50"
                : "border-gray-200 bg-white hover:border-gray-300",
              isMissing && "border-red-300 bg-red-50/60 ring-1 ring-red-300",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              id={id}
              type="checkbox"
              disabled={disabled}
              checked={acked.has(ack.code)}
              onChange={() => onToggle(ack.code)}
              className="mt-0.5 size-4 shrink-0 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium text-gray-900">
                {ack.title}
              </span>
              <span className="block text-xs leading-relaxed text-gray-600">
                {ack.message}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
};

export default AckChecklist;
