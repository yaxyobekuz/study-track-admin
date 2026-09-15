// Icons
import { Pause, Play } from "lucide-react";

// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import HintTooltip from "./HintTooltip";
import Spinner from "./Spinner";

// Hooks
import { useAudioPlayer, usePlayback } from "../hooks/useAudioPlayback";

// API
import { aiAssistantAPI } from "../api/aiAssistant.api";

// Lib
import { formatClock } from "../lib/thread";
import { readErrorMessage } from "../lib/errors";

// Data
import { VOICE_COPY } from "../data/aiAssistant.data";

/**
 * EGASINING OVOZLI XABARI — ijro / pauza, jarayon chizig'i, davomiylik.
 *
 * ⚠️ AUDIO BOSILGANDA YUKLANADI, xabar chizilganda emas: suhbatda o'nlab
 * ovozli xabar bo'lsa, ekranni ochish o'nlab megabayt yuklab olishga
 * aylanardi. Yuborilgan klip esa brauzerdagi nusxadan darhol o'ynaydi
 * (`useAssistantChat` uni keshga qo'yadi).
 *
 * @param {{ messageId: string, durationMs?: number|null, className?: string }} props
 */
const VoiceClip = ({ messageId, durationMs, className }) => {
  const player = useAudioPlayer();
  const key = `voice:${messageId}`;
  const playback = usePlayback(key);

  const isPlaying = playback.status === "playing";
  const isLoading = playback.status === "loading";
  const isActive = playback.key === key;

  const totalSeconds = playback.duration || (durationMs ? durationMs / 1000 : 0);
  const progress = isActive && totalSeconds ? Math.min(1, playback.currentTime / totalSeconds) : 0;
  const clockMs = isActive && playback.currentTime > 0 ? playback.currentTime * 1000 : durationMs;

  const handleToggle = async () => {
    try {
      await player.toggle(key, (signal) => aiAssistantAPI.getMessageAudio(messageId, { signal }).then((r) => r.data), {
        durationMs: durationMs ?? 0,
      });
    } catch (error) {
      if (error?.kind === "blocked") toast.error(VOICE_COPY.playbackBlocked);
      else if (error?.kind === "load") toast.error(await readErrorMessage(error.cause, VOICE_COPY.loadFailed));
      else toast.error(VOICE_COPY.playbackFailed);
    }
  };

  const handleSeek = (event) => {
    if (!isActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    player.seek((event.clientX - rect.left) / rect.width);
  };

  const label = isPlaying ? "Pauza" : "Ovozli xabarni tinglash";

  return (
    <div className={cn("flex min-w-[200px] items-center gap-2.5", className)}>
      <HintTooltip content={label}>
        <button
          type="button"
          onClick={handleToggle}
          aria-label={label}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200",
            "outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          {isLoading ? (
            <Spinner className="text-slate-500" />
          ) : isPlaying ? (
            <Pause className="size-3.5" strokeWidth={2} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 size-3.5" strokeWidth={2} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      </HintTooltip>

      <div
        role="progressbar"
        aria-label="Ijro jarayoni"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        onClick={handleSeek}
        className={cn("group relative flex h-6 flex-1 items-center", isActive && "cursor-pointer")}
      >
        <span className="h-1 w-full overflow-hidden rounded-full bg-slate-300/70">
          <span
            className="block h-full origin-left rounded-full bg-slate-700 transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${progress})` }}
          />
        </span>
      </div>

      <span className="w-9 shrink-0 text-right text-[11px] font-medium tabular-nums text-slate-500">
        {clockMs ? formatClock(clockMs) : "—"}
      </span>
    </div>
  );
};

export default VoiceClip;
