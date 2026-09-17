// Icons
import { Download, FileText, Film, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

const sizeText = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Biriktirilgan fayllar to'ri: rasm — eskiz, video — pleyer, hujjat — karta.
 *
 * @param {object} props
 * @param {Array<{key: string, url: string, type: string, originalName?: string, sizeBytes?: number}>} props.items
 * @param {(item: object) => void} [props.onRemove] - berilsa har bir faylda "olib tashlash" tugmasi
 * @param {string} [props.className]
 */
const AttachmentGrid = ({ items = [], onRemove, className = "" }) => {
  if (!items.length) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <div
          key={item.key || idx}
          className="group relative overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100"
        >
          {item.type === "image" ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden"
            >
              <img
                src={item.url}
                alt={item.originalName || "Rasm"}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
            </a>
          ) : item.type === "video" ? (
            <video
              src={item.url}
              controls
              className="aspect-[4/3] w-full bg-black object-contain"
            />
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 p-3 text-center hover:bg-gray-100"
            >
              <FileText className="size-8 text-blue-500" strokeWidth={1.5} />
              <span className="line-clamp-2 break-all text-xs font-medium text-gray-700">
                {item.originalName || "Hujjat"}
              </span>
            </a>
          )}

          <div className="flex items-center gap-1.5 border-t border-gray-100 bg-white px-2 py-1.5">
            {item.type === "video" && (
              <Film className="size-3.5 shrink-0 text-gray-400" />
            )}
            <span className="min-w-0 flex-1 truncate text-[11px] text-gray-500">
              {item.originalName || "Fayl"}
              {item.sizeBytes ? ` · ${sizeText(item.sizeBytes)}` : ""}
            </span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label="Yuklab olish"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <Download className="size-3.5" />
            </a>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label="Faylni olib tashlash"
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-gray-600 shadow hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttachmentGrid;
