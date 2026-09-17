// React
import { useRef, useState } from "react";

// Icons
import { FileText, Film, ImageIcon, UploadCloud, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

const iconFor = (file) =>
  file.type.startsWith("image/")
    ? ImageIcon
    : file.type.startsWith("video/")
      ? Film
      : FileText;

/**
 * Fayl tanlagich: bosib yoki sudrab tashlab. Tanlanganlar alohida-alohida
 * olib tashlanadi (oddiy `<input type=file>` da bitta xato fayl uchun
 * hammasini qaytadan tanlash kerak edi).
 *
 * @param {object} props
 * @param {File[]} props.value
 * @param {(files: File[]) => void} props.onChange
 * @param {number} [props.max=10]
 * @param {string} [props.accept]
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 */
const FileDropzone = ({
  value = [],
  onChange,
  max = 10,
  accept,
  label = "Fayllar",
  hint = "",
  required = false,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [isOver, setIsOver] = useState(false);

  const add = (list) => {
    onChange([...value, ...Array.from(list || [])].slice(0, max));
  };

  const remove = (index) => onChange(value.filter((_, i) => i !== index));
  const isFull = value.length >= max;

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-primary">*</span>}
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            {value.length}/{max}
          </span>
        </p>
      )}

      <button
        type="button"
        disabled={disabled || isFull}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          isOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50/60 hover:border-blue-300 hover:bg-blue-50/40",
        )}
      >
        <UploadCloud className="size-7 text-blue-500" strokeWidth={1.5} />
        <span className="text-sm font-medium text-gray-700">
          {isFull
            ? "Fayllar soni to'ldi"
            : "Fayl tanlang yoki shu yerga tashlang"}
        </span>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={accept}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((file, index) => {
            const Icon = iconFor(file);
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-sm ring-1 ring-gray-100"
              >
                <Icon className="size-4 shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate text-gray-700">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label={`${file.name} ni olib tashlash`}
                  className="rounded p-0.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileDropzone;
