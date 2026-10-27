// React
import { useCallback, useEffect, useRef, useState } from "react";

// Icons
import { AlertTriangle, Camera, CameraOff, Loader2, ScanFace } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";

// Lib
import {
  FACE_REASONS,
  captureSnapshot,
  loadFaceEngine,
  readFace,
} from "../lib/faceEngine";

/**
 * VEB-KAMERA ORQALI YUZ KADRINI OLISH.
 *
 * ⚠️ VEKTOR BRAUZERDA HISOBLANADI, serverga RASM EMAS, VEKTOR ketadi
 * (`.claude/rules/face-id.md` §2). Shu sababli:
 *   · serverga native ML bog'liqligi kirmaydi;
 *   · tarmoqdan yuz rasmlari oqmaydi (rasm — ixtiyoriy audit nusxasi);
 *   · bitta kadr ~4 KB bo'ladi.
 *
 * ── TAYYORLIK DARVOZASI ─────────────────────────────────────────────
 *
 * "Saqlash" tugmasi FAQAT kadr tayyor bo'lganda ishlaydi: yuz
 * ko'rinayotgan, bitta, sifatli va tirik. Darvoza KIOSKDAGI bilan ayni
 * mantiq — lekin u YAKUNIY EMAS: server har kadrni QAYTA tekshiradi
 * (brauzer kodi almashtirilgan bo'lishi mumkin). Bu yerdagi tekshiruv
 * faqat odamga nima qilish kerakligini aytish uchun.
 *
 * ⚠️ `requestAnimationFrame` EMAS, `setInterval` (300 ms): har kadrni
 * tahlil qilish noutbukning ventilyatorini ishga solardi va hech
 * narsa bermasdi — odam kameraga 300 ms dan tez o'zgarmaydi.
 */
const DETECT_INTERVAL_MS = 300;

/** Kadr ichidagi yuz kamida shuncha ulushni egallashi kerak. */
const MIN_FACE_RATIO = 0.12;

const FaceCapture = ({ settings, onCapture, busy = false, disabled = false }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const engineRef = useRef(null);
  const timerRef = useRef(null);
  // ⚠️ Oxirgi o'qilgan kadr REF da, state'da EMAS: "Saqlash" bosilganda
  // AYNAN ekranda ko'ringan kadr yuborilishi kerak va state yangilanishi
  // render tsikliga ilinib, bir kadr orqada qolardi.
  const lastReadRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);

  /* ── Kamerani va modellarni ishga tushirish ── */
  const start = useCallback(async () => {
    setPhase("loading");
    setError("");

    try {
      // ⚠️ TARTIB: avval kamera, keyin modellar. Kamera ruxsati
      // brauzer so'rovini ochadi va odam javob berishini kutadi —
      // o'sha paytda 10 MB model yuklash tarmoqni bekorga band
      // qilardi (odam "Rad etish" ni bosishi mumkin).
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      engineRef.current = await loadFaceEngine();
      setPhase("ready");
    } catch (err) {
      const name = err?.name || "";
      setError(
        name === "NotAllowedError"
          ? "Kameraga ruxsat berilmadi — brauzer sozlamasida ruxsat bering"
          : name === "NotFoundError"
            ? "Kamera topilmadi"
            : err?.message?.includes("fetch") || err?.message?.includes("import")
              ? "Yuz tanish modellari yuklanmadi — internetni tekshiring"
              : err?.message || "Kamera ishga tushmadi",
      );
      setPhase("error");
    }
  }, []);

  /* ── Tozalash ── */
  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    lastReadRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  /* ── Tahlil halqasi ── */
  useEffect(() => {
    if (phase !== "ready") return undefined;

    let running = false;

    timerRef.current = setInterval(async () => {
      // ⚠️ QAYTA KIRISHDAN HIMOYA: bitta kadr tahlili 300 ms dan uzoq
      // bo'lsa (sekin noutbuk) chaqiruvlar ustma-ust tushib, GPU
      // navbati cheksiz o'sardi va sahifa muzlab qolardi.
      if (running || !videoRef.current || !engineRef.current) return;
      running = true;

      try {
        const read = await readFace(engineRef.current, videoRef.current);

        if (!read.ok) {
          lastReadRef.current = null;
          setStatus({ ok: false, text: FACE_REASONS[read.reason] || "Kadr olinmadi" });
          return;
        }

        const check = evaluate(read, videoRef.current, settings);
        lastReadRef.current = check.ok ? read : null;
        setStatus(check);
      } catch {
        // Bitta kadrning xatosi halqani to'xtatmaydi.
        lastReadRef.current = null;
      } finally {
        running = false;
      }
    }, DETECT_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [phase, settings]);

  /* ── Kadrni saqlash ── */
  const handleCapture = () => {
    const read = lastReadRef.current;
    if (!read) return;

    onCapture({
      embedding: read.embedding,
      quality: read.quality,
      liveness: read.liveness,
      antispoof: read.antispoof,
      snapshot: captureSnapshot(videoRef.current, read.face),
    });
  };

  const canCapture = phase === "ready" && status?.ok && !busy && !disabled;

  return (
    <div className="space-y-3">
      {/* ── Kamera oynasi ── */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-900">
        <video
          ref={videoRef}
          muted
          playsInline
          // ⚠️ `scale-x-[-1]` — oyna effekti. Kameradan kelgan tasvir
          // teskari va odam "o'ngga suril" degan ko'rsatmani chalkashtirib
          // yuborardi. Vektor VIDEO elementidan o'qiladi, ya'ni CSS
          // o'girilishi tahlilga ta'sir qilmaydi.
          className="size-full scale-x-[-1] object-cover"
        />

        {/* Yuz ramkasi — odam qayerga turishini biladi */}
        {phase === "ready" && (
          <div
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] border-2 transition-colors",
              status?.ok ? "border-emerald-400" : "border-white/40",
            )}
          />
        )}

        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <ScanFace className="size-8 text-white/50" strokeWidth={1.5} />
            <p className="max-w-xs px-6 text-[12.5px] text-white/70">
              Kamerani yoqing. Modellar birinchi martada yuklanadi
              (~10 MB) va keyin brauzer keshida qoladi.
            </p>
            <Button type="button" size="sm" onClick={start} className="gap-1.5">
              <Camera className="size-4" />
              Kamerani yoqish
            </Button>
          </div>
        )}

        {phase === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-7 animate-spin text-white/70" />
            <p className="text-[12.5px] text-white/70">Modellar yuklanmoqda…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <CameraOff className="size-8 text-rose-300" strokeWidth={1.5} />
            <p className="text-[12.5px] text-rose-200">{error}</p>
            <Button type="button" size="sm" variant="secondary" onClick={start}>
              Qayta urinish
            </Button>
          </div>
        )}
      </div>

      {/* ── Holat satri ── */}
      {phase === "ready" && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl px-3.5 py-2.5",
            status?.ok ? "bg-emerald-50" : "bg-amber-50",
          )}
        >
          {status?.ok ? (
            <ScanFace className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                "text-[12.5px] font-medium",
                status?.ok ? "text-emerald-900" : "text-amber-900",
              )}
            >
              {status?.text || "Yuz qidirilmoqda…"}
            </p>
            {status?.detail && (
              <p
                className={cn(
                  "mt-0.5 text-[11.5px]",
                  status.ok ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {status.detail}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        type="button"
        disabled={!canCapture}
        onClick={handleCapture}
        className="w-full gap-1.5"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        {busy ? "Saqlanmoqda…" : "Kadrni saqlash"}
      </Button>
    </div>
  );
};

/**
 * KADR TAYYORMI — serverdagi darvoza bilan AYNI shartlar.
 *
 * ⚠️ Chegaralar SERVERDAN keladi (`settings`), bu yerda yozilmaydi:
 * ikki joyda bo'lsa, panel ruxsat bergan kadr serverda rad etilardi va
 * xodim "nega saqlanmadi" deb ovora bo'lardi.
 *
 * ⚠️ YUZ O'LCHAMI ham tekshiriladi va bu chegaralardan TASHQARIDA
 * (serverda bu shart yo'q): uzoqdan olingan kichik yuz formal ravishda
 * "sifatli" bo'lishi mumkin, lekin undan olingan vektor beqaror
 * bo'ladi va keyin kiosk oldida "tanilmadi" bo'lib qolardi.
 */
const evaluate = (read, video, settings) => {
  const minQuality = settings?.minFaceQuality ?? 0.55;
  const minAntispoof = settings?.antispoofThreshold ?? 0.7;
  const minLiveness = settings?.livenessThreshold ?? 0.7;

  const vw = video.videoWidth || 1;
  const vh = video.videoHeight || 1;
  const [, , bw, bh] = read.face.box || [0, 0, 0, 0];
  const ratio = Math.sqrt((bw * bh) / (vw * vh));

  if (ratio < MIN_FACE_RATIO) {
    return { ok: false, text: "Yaqinroq turing", detail: "Yuz kadrda juda kichik" };
  }
  if (read.quality < minQuality) {
    return {
      ok: false,
      text: "Kadr sifatsiz",
      detail: "Yorug'likni oshiring va kameraga to'g'ri qarang",
    };
  }
  if (minAntispoof > 0 && read.antispoof < minAntispoof) {
    return {
      ok: false,
      text: "Tiriklik tekshiruvi o'tmadi",
      detail: "Ekrandagi rasm emas, o'zingiz kameraga qarab turing",
    };
  }
  if (minLiveness > 0 && read.liveness < minLiveness) {
    return {
      ok: false,
      text: "Tiriklik tekshiruvi o'tmadi",
      detail: "Boshingizni bir oz harakatlantirib, kameraga qarang",
    };
  }

  return {
    ok: true,
    text: "Kadr tayyor",
    detail: `Sifat ${Math.round(read.quality * 100)}% · tiriklik ${Math.round(read.liveness * 100)}%`,
  };
};

export default FaceCapture;
