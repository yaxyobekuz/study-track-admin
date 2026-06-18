// Toast
import { toast } from "sonner";

// React
import { useRef, useState } from "react";

// Icons
import { X, FileJson } from "lucide-react";

/**
 * Drag & drop (yoki bosib tanlash) orqali lottie (.json) fayl tanlash maydoni.
 * @param {object} props
 * @param {File|null} props.value - Tanlangan fayl.
 * @param {(file: File|null) => void} props.onChange - Fayl o'zgarganda.
 * @param {string} [props.label] - Maydon sarlavhasi.
 * @param {boolean} [props.required]
 * @param {string} [props.description] - Pastdagi izoh matni.
 */
const JsonDropzone = ({
  value,
  onChange,
  label = "Lottie fayl (.json)",
  required = false,
  description = "lottie-react uchun animatsiya .json fayli",
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isJson = name.endsWith(".json") || file.type === "application/json";
    if (!isJson) {
      toast.error("Faqat .json formatdagi fayllar qabul qilinadi");
      return;
    }
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {!value ? (
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <FileJson
            className="mx-auto h-10 w-10 text-gray-400 mb-2"
            strokeWidth={1.5}
          />
          <p className="text-sm text-gray-600">
            Faylni shu yerga tashlang yoki
          </p>
          <p className="text-sm font-medium text-blue-600">tanlash uchun bosing</p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileJson className="h-7 w-7 shrink-0 text-green-600" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-800 shrink-0"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
};

export default JsonDropzone;
