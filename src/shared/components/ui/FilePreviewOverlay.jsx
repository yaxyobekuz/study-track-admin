// React
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Icons
import { Download, Maximize2, Minimize2, X, FileText } from "lucide-react";

/**
 * Biriktirilgan hujjatni MODALDA ochib ko'rish: rasm va PDF ichida
 * ko'rsatiladi, qolgan turlar uchun yuklab olish taklif qilinadi.
 *
 * Imkoniyatlar: full screen (brauzer Fullscreen API, qo'llamasa CSS
 * kengaytirish), yuklab olish (blob orqali — asl nom bilan; cross-origin
 * rad etsa yangi tabda ochish), Escape bilan yopish.
 *
 * Boshqariladigan komponent — modal registriga kirmaydi:
 *   {preview && <FilePreviewOverlay file={preview} onClose={() => setPreview(null)} />}
 *
 * `file`: { url, originalName?, type? } — upload middleware saqlagan shakl.
 */
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|svg|heic)$/i;

const kindOf = (file) => {
  const name = file.originalName || file.url || "";
  if (file.type === "image" || IMAGE_EXT.test(name)) return "image";
  if (/\.pdf$/i.test(name) || /\.pdf$/i.test(file.url || "")) return "pdf";
  return "other";
};

const FilePreviewOverlay = ({ file, onClose }) => {
  const containerRef = useRef(null);
  const [isFull, setIsFull] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const kind = kindOf(file);
  const name = file.originalName || "Hujjat";

  // Escape bilan yopish (fullscreen'da Escape avval fullscreen'dan chiqadi)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Brauzer fullscreen holatini kuzatamiz (Escape bilan chiqilganda ham)
  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setIsFull((v) => !v));
    } else {
      // Fullscreen API yo'q (eski Safari) — CSS bilan kengaytiramiz
      setIsFull((v) => !v);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      // Blob orqali — asl nom bilan saqlanadi
      const res = await fetch(file.url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Cross-origin rad etdi — hech bo'lmasa yangi tabda ochamiz
      window.open(file.url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  }, [file.url, name]);

  const overlay = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999] flex flex-col bg-black/90"
      onClick={(e) => {
        // Fon bosilganda yopiladi (kontent bosilganda emas)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Yuqori panel */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            title="Yuklab olish"
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <Download className="size-5" />
          </button>
          <button
            title={isFull ? "Kichraytirish" : "Full screen"}
            onClick={toggleFullscreen}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            {isFull ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
          <button
            title="Yopish"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Kontent */}
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-0">
        {kind === "image" ? (
          <img
            src={file.url}
            alt={name}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : kind === "pdf" ? (
          <iframe
            src={file.url}
            title={name}
            className="h-full w-full max-w-5xl rounded-lg bg-white"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-white/80">
            <FileText className="size-12" />
            <p className="text-sm">
              Bu fayl turini brauzerda ko'rsatib bo'lmaydi.
              <br />
              Yuklab olib oching.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
            >
              {downloading ? "Yuklanmoqda..." : "Yuklab olish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default FilePreviewOverlay;
