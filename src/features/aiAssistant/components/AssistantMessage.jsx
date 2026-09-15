// React
import { memo, useEffect, useRef, useState } from "react";

// Icons
import { Check, Copy, Square, Volume2 } from "lucide-react";

// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import ActionCard from "./ActionCard";
import AssistantButton from "./AssistantButton";
import IconButton from "./IconButton";
import MarkdownContent from "./MarkdownContent";
import ThinkingIndicator from "./ThinkingIndicator";
import ToolSteps from "./ToolSteps";

// Hooks
import { useAudioPlayer, usePlayback } from "../hooks/useAudioPlayback";

// API
import { aiAssistantAPI } from "../api/aiAssistant.api";

// Lib
import { readErrorMessage } from "../lib/errors";

// Data
import { COPY, VOICE_COPY } from "../data/aiAssistant.data";
import { MOTION, T } from "../data/assistant.tokens";

/**
 * YORDAMCHI JAVOBI — pufakchasiz, to'liq kenglikda.
 *
 * ⚠️ PUFAKCHA YO'Q. Javob — hisobot (sarlavhalar, jadvallar, amal
 * kartalari); uni pufakchaga solish jadvallarni siqib, kartani "karta
 * ichidagi karta" qilardi. Egasining savoli pufakchada, javob esa hujjat
 * kabi oqadi — kim gapirayotgani shaklidan ko'rinadi.
 *
 * ⚠️ ASBOBLAR (nusxa, tinglash) SICHQONCHA KELGANDA ko'rinadi — oxirgi javobda
 * va sensorli ekranda doim. Har javob ostida doimiy tugmalar qatori uzun
 * suhbatni ko'z uchun "tugmalar ro'yxati" ga aylantirardi.
 *
 * @param {object} props
 * @param {object} props.message
 * @param {boolean} [props.isLast]
 * @param {string|null} [props.retryText] - "Qayta yuborish" matni (oldingi savol)
 * @param {(text: string) => void} [props.onRetry]
 * @param {boolean} [props.retryDisabled]
 * @param {boolean} [props.voiceOutput] - server ovozda o'qishni qo'llaydimi
 */
const AssistantMessage = ({ message, isLast = false, retryText, onRetry, retryDisabled = false, voiceOutput = true }) => {
  const streaming = Boolean(message.isLive) && message.status === "streaming";
  const hasContent = Boolean(message.content?.trim());
  const running = streaming
    ? (message.steps ?? []).reduce((last, step) => (step.status === "running" ? step : last), null)
    : null;
  const canSpeak = voiceOutput && !message.isLive && message.status === "complete" && hasContent;

  return (
    <div className={cn("group/message min-w-0", MOTION.enter)} aria-busy={streaming || undefined}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[12px]">
        <span className="font-semibold text-slate-900">{COPY.assistantName}</span>
        {message.timeLabel && (
          <>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className={T.meta}>{message.timeLabel}</span>
          </>
        )}
      </p>

      <ToolSteps steps={message.steps} live={streaming} />

      {streaming && !hasContent && <ThinkingIndicator label={running?.label || message.phaseLabel || COPY.thinking} />}

      {hasContent && <MarkdownContent content={message.content} streaming={streaming} />}

      {message.actions?.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.actions.map((action) => (
            <ActionCard key={action.id} action={action} locked={streaming} />
          ))}
        </div>
      )}

      {(message.status === "error" || message.status === "interrupted") && (
        <StatusNotice
          status={message.status}
          errorMessage={message.errorMessage}
          retryText={isLast ? retryText : null}
          onRetry={onRetry}
          retryDisabled={retryDisabled}
        />
      )}

      {!streaming && hasContent && (
        <div
          className={cn(
            "-ml-1.5 mt-2 flex items-center gap-0.5 transition-opacity duration-150",
            isLast
              ? "opacity-100"
              : "opacity-0 focus-within:opacity-100 group-hover/message:opacity-100 [@media(hover:none)]:opacity-100",
          )}
        >
          <CopyButton text={message.content} />
          {canSpeak && <ListenButton messageId={message.id} />}
        </div>
      )}
    </div>
  );
};

const StatusNotice = ({ status, errorMessage, retryText, onRetry, retryDisabled }) => {
  const isError = status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-[10px] px-3 py-2 ring-1 ring-inset",
        isError ? "bg-rose-50 ring-rose-200/70" : "bg-amber-50 ring-amber-200/70",
      )}
    >
      <p className={cn("min-w-0 text-[13px] leading-5", isError ? "text-rose-800" : "text-amber-900")}>
        {isError ? (
          <>
            <span className="font-semibold">{COPY.errorTitle}.</span> {errorMessage || COPY.genericError}
          </>
        ) : (
          <span className="font-medium">{errorMessage || COPY.interrupted}</span>
        )}
      </p>
      {retryText && onRetry && (
        <AssistantButton size="compact" tone="secondary" disabled={retryDisabled} onClick={() => onRetry(retryText)}>
          {COPY.retry}
        </AssistantButton>
      )}
    </div>
  );
};

const COPIED_MS = 1500;

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast.error("Nusxa olib bo'lmadi");
    }
  };

  return (
    <IconButton
      size="compact"
      icon={copied ? Check : Copy}
      label={copied ? "Nusxa olindi" : "Nusxa olish"}
      onClick={handleCopy}
      className={copied ? "text-emerald-600 hover:text-emerald-700" : undefined}
    />
  );
};

const ListenButton = ({ messageId }) => {
  const player = useAudioPlayer();
  const key = `speech:${messageId}`;
  const playback = usePlayback(key);
  const isLoading = playback.status === "loading";
  const isPlaying = playback.status === "playing";

  const handleClick = async () => {
    if (isPlaying) {
      player.stop();
      return;
    }
    try {
      await player.toggle(key, (signal) => aiAssistantAPI.getMessageSpeech(messageId, { signal }).then((r) => r.data));
    } catch (error) {
      if (error?.kind === "blocked") toast.error(VOICE_COPY.playbackBlocked);
      else if (error?.kind === "load") toast.error(await readErrorMessage(error.cause, VOICE_COPY.loadFailed));
      else toast.error(VOICE_COPY.playbackFailed);
    }
  };

  return (
    <IconButton
      size="compact"
      icon={isPlaying ? Square : Volume2}
      loading={isLoading}
      label={isLoading ? "Ovoz tayyorlanmoqda — bekor qilish" : isPlaying ? "To'xtatish" : "Ovozda tinglash"}
      onClick={handleClick}
      className={isLoading || isPlaying ? "text-slate-900" : undefined}
      aria-pressed={isPlaying}
    />
  );
};

export default memo(AssistantMessage);
