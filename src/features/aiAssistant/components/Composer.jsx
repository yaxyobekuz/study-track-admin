// React
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";

// Icons
import { ArrowUp, Mic, Square, X } from "lucide-react";

// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import AssistantButton from "./AssistantButton";
import IconButton from "./IconButton";

// Hooks
import useVoiceRecorder, { LEVEL_BARS } from "../hooks/useVoiceRecorder";
import { useAudioPlayer } from "../hooks/useAudioPlayback";

// Lib
import { formatClock, formatCount } from "../lib/thread";

// Data
import { COPY, COUNTER_THRESHOLD, VOICE_COPY } from "../data/aiAssistant.data";
import { THREAD_WIDTH } from "../data/assistant.tokens";

/**
 * XABAR YOZISH MAYDONI — matn yoki ovoz.
 *
 * ⚠️ ENTER YUBORADI, SHIFT+ENTER — YANGI QATOR. Ikki istisno:
 *   • IME tarkibi (`isComposing`) — kirill/lotin almashtirgichda so'z
 *     tanlash uchun bosilgan Enter xabarni yarim holatda yuborib yubormasin;
 *   • sensorli ekran — telefon klaviaturasida Shift yo'q, Enter yangi qator
 *     bo'lishi kerak, yuborish esa tugma bilan.
 *
 * ⚠️ MATN FAQAT MUVAFFAQIYATLI OQIMDAN KEYIN YO'QOLADI. Yuborishda maydon
 * darhol tozalanadi (javob kutib turgan maydonda matn qolmasin), lekin
 * server oqimni ochmay rad etsa (band, limit, tarmoq) matn qaytariladi —
 * uzun savol qayta yozilmaydi.
 *
 * ⚠️ UZUNLIK CHEKLOVI `maxLength` BILAN QO'YILMAYDI: u joylashtirilgan matnni
 * jimgina kesib tashlardi. Hisoblagich qizaradi va yuborish o'chadi — ega
 * nima bo'lganini ko'radi.
 *
 * @param {object} props
 * @param {React.Ref} [props.ref] - `{ focus(), setText(text) }`
 * @param {(text: string) => Promise<{ ok: boolean, restoreText?: string }>} props.onSend
 * @param {(blob: Blob, durationMs: number) => Promise<unknown>} props.onSendVoice
 * @param {() => void} props.onStop
 * @param {boolean} props.streamingHere - shu suhbatda javob yozilmoqda (Stop ko'rinadi)
 * @param {boolean} props.lockedElsewhere - boshqa suhbatda javob yozilmoqda
 * @param {boolean} props.disabled - AI sozlanmagan
 * @param {boolean} props.voiceEnabled
 * @param {{ maxTextLength: number, maxVoiceSeconds: number, maxVoiceBytes: number }} props.limits
 * @param {string} props.conversationKey - ochiq suhbat (o'zgarsa yozuv tashlanadi)
 */
const Composer = ({
  ref,
  conversationKey,
  onSend,
  onSendVoice,
  onStop,
  streamingHere,
  lockedElsewhere,
  disabled,
  voiceEnabled,
  limits,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      setText: (value) => {
        setText(value);
        requestAnimationFrame(() => textareaRef.current?.focus());
      },
    }),
    [],
  );

  const busy = streamingHere || lockedElsewhere;
  const length = text.length;
  const tooLong = length > limits.maxTextLength;
  const canSend = !disabled && !busy && !tooLong && text.trim().length > 0;

  const handleRecorded = useCallback(
    (blob, durationMs, { reachedLimit }) => {
      if (reachedLimit) toast.info(VOICE_COPY.limitReached);
      onSendVoice(blob, durationMs);
    },
    [onSendVoice],
  );

  const recorder = useVoiceRecorder({
    maxSeconds: limits.maxVoiceSeconds,
    maxBytes: limits.maxVoiceBytes,
    onRecorded: handleRecorded,
    onError: toast.error,
  });
  // ⚠️ Hook natijasi ichida ref bor — funksiyalar render'da alohida olinadi
  // (`react-hooks/refs`: ref saqlagan obyekt xossasiga render ichida murojaat).
  const { start: startRecording, stop: stopRecording, cancel: cancelRecording } = recorder;
  const recording = recorder.isActive;
  const player = useAudioPlayer();

  // ⚠️ Yozish paytida ovoz ijro etilmaydi: karnaydan chiqqan javob
  // mikrofonga tushib, transkriptga aralashardi.
  const handleStartRecording = () => {
    player.stop();
    startRecording();
  };

  // ⚠️ Boshqa suhbatga o'tilsa yozuv TASHLANADI. Aks holda A suhbatda
  // boshlangan ovozli xabar "Yuborish" bosilgan paytda ochiq turgan B
  // suhbatga ketib qolardi.
  useEffect(() => {
    cancelRecording();
  }, [conversationKey, cancelRecording]);

  // Balandlik matnga qarab (1–8 qator). Qiymat o'zgargandan keyin o'lchanadi.
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 8 * 24 + 16)}px`;
  }, [text, recording]);

  const submit = async () => {
    if (!canSend) return;
    const value = text.trim();
    setText("");
    const result = await onSend(value);
    if (result && !result.ok && result.restoreText) {
      // Ega shu orada yangi matn yozgan bo'lsa, u ustidan yozilmaydi.
      setText((current) => (current ? current : result.restoreText));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    event.preventDefault();
    submit();
  };

  const busyReason = lockedElsewhere ? COPY.composerBusyElsewhere : tooLong ? COPY.composerTooLong : null;

  return (
    <div className="shrink-0 border-t border-slate-100 p-3 sm:px-4">
      <div className={THREAD_WIDTH}>
        {recording ? (
          <RecordingBar
            status={recorder.status}
            elapsedMs={recorder.elapsedMs}
            barsRef={recorder.barsRef}
            onCancel={cancelRecording}
            onStop={stopRecording}
            maxSeconds={limits.maxVoiceSeconds}
          />
        ) : (
          <div
            className={cn(
              "flex items-end gap-1.5 rounded-[14px] bg-white p-1.5 pl-3.5 ring-1 ring-slate-200 transition-shadow",
              "focus-within:ring-2 focus-within:ring-primary/40",
              disabled && "bg-slate-50",
            )}
          >
            <label htmlFor="ai-assistant-composer" className="sr-only">
              {COPY.composerPlaceholder}
            </label>
            <textarea
              id="ai-assistant-composer"
              ref={textareaRef}
              value={text}
              rows={1}
              disabled={disabled}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={COPY.composerPlaceholder}
              className={cn(
                "max-h-[208px] min-h-9 flex-1 resize-none self-center bg-transparent py-1.5 text-[14.5px] leading-6 text-slate-900",
                "outline-none placeholder:text-slate-400 disabled:cursor-not-allowed",
              )}
            />

            <div className="flex shrink-0 items-center gap-1">
              {length >= COUNTER_THRESHOLD && (
                <span
                  aria-live="polite"
                  className={cn(
                    "mr-1 hidden text-[11px] font-medium tabular-nums xs:inline",
                    tooLong ? "text-rose-700" : "text-slate-500",
                  )}
                >
                  {formatCount(length)} / {formatCount(limits.maxTextLength)}
                </span>
              )}

              {voiceEnabled && (
                <IconButton
                  icon={Mic}
                  label={COPY.recordVoice}
                  tooltip={lockedElsewhere ? COPY.composerBusyElsewhere : undefined}
                  disabled={disabled || busy}
                  onClick={handleStartRecording}
                />
              )}

              {streamingHere ? (
                <IconButton icon={Square} label={COPY.stopAnswer} tone="secondary" onClick={onStop} />
              ) : (
                <IconButton
                  icon={ArrowUp}
                  label={COPY.send}
                  tooltip={busyReason ?? COPY.sendHint}
                  tone="primary"
                  disabled={!canSend}
                  onClick={submit}
                />
              )}
            </div>
          </div>
        )}

        <p className="mt-2 text-center text-[11px] leading-4 text-slate-500">
          {tooLong ? (
            <span className="text-rose-700">
              {COPY.composerTooLong}: ko'pi bilan {formatCount(limits.maxTextLength)} belgi
            </span>
          ) : (
            COPY.composerNote
          )}
        </p>
      </div>
    </div>
  );
};

/**
 * Yozish rejimi: qizil nuqta, vaqt, jonli daraja, bekor/yuborish.
 *
 * ⚠️ ESC — BEKOR. Klaviatura bilan ishlaydigan ega sichqonchaga qo'l
 * uzatmasdan yozuvni tashlay olishi kerak.
 */
const RecordingBar = ({ status, elapsedMs, barsRef, onCancel, onStop, maxSeconds }) => {
  const requesting = status === "requesting";

  // Hujjat darajasida: fokus qayerda bo'lishidan qat'i nazar ishlaydi.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="group"
      aria-label={COPY.recordingLabel}
      className="flex h-[48px] items-center gap-3 rounded-[14px] bg-white p-1.5 pl-3.5 ring-2 ring-rose-200"
    >
      <span className="relative flex size-2.5 shrink-0 items-center justify-center" aria-hidden="true">
        <span className={cn("size-2.5 rounded-full bg-rose-500", !requesting && "motion-safe:animate-breathe")} />
      </span>

      <span className="shrink-0 text-[13px] font-medium tabular-nums text-slate-800" aria-live="off">
        {requesting ? COPY.micConnecting : formatClock(elapsedMs)}
        {!requesting && <span className="hidden text-slate-400 xs:inline"> / {formatClock(maxSeconds * 1000)}</span>}
      </span>

      <div ref={barsRef} aria-hidden="true" className="flex h-6 min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
        {Array.from({ length: LEVEL_BARS }, (_, index) => (
          <span
            key={index}
            className="h-full w-[3px] shrink-0 origin-center rounded-full bg-slate-400 transition-transform duration-75"
            style={{ transform: "scaleY(0.12)" }}
          />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <AssistantButton tone="secondary" icon={X} onClick={onCancel} className="px-2.5 xs:px-3.5">
          <span className="sr-only xs:not-sr-only">{COPY.cancel}</span>
        </AssistantButton>
        <AssistantButton tone="primary" icon={ArrowUp} onClick={onStop} disabled={requesting} className="px-2.5 xs:px-3.5">
          <span className="sr-only xs:not-sr-only">{COPY.send}</span>
        </AssistantButton>
      </div>
    </div>
  );
};

export default Composer;
