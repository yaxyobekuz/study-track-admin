// React
import { memo } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import VoiceClip from "./VoiceClip";

// Data
import { COPY } from "../data/aiAssistant.data";
import { MOTION, T } from "../data/assistant.tokens";

/**
 * EGASINING XABARI — o'ng tomonda, kulrang pufakcha.
 *
 * ⚠️ PUFAKCHA KO'K EMAS. Ko'k bu ekranda "harakat" rangi (yuborish,
 * tasdiqlash); egasining har savoli ko'k bo'lsa, suhbat oynasi tugmalar
 * bilan bir xil ohangda "baqirib" turardi.
 *
 * ⚠️ MATN `whitespace-pre-wrap` — Markdown EMAS. Ega yozgan qator
 * tashlashlari aynan saqlanadi va `*` kabi belgilar formatga aylanmaydi.
 *
 * Ovozli xabarda klip yuqorida, transkript ("Matni") pastda: ega yordamchi
 * nimani eshitganini ko'rib turishi kerak — javob shu matnga beriladi.
 */
const UserMessage = ({ message }) => {
  const isVoice = message.inputMode === "voice";
  const meta = message.isPending ? COPY.sending : message.timeLabel;

  return (
    <div className={cn("flex flex-col items-end", MOTION.enter)}>
      <div className="min-w-0 max-w-[85%] rounded-[14px] bg-slate-100 px-4 py-2.5 text-slate-900">
        {isVoice && message.hasAudio && (
          <VoiceClip messageId={message.id} durationMs={message.audioDurationMs} className="py-0.5" />
        )}

        {isVoice ? (
          message.content ? (
            <div className="mt-2 border-t border-slate-200/80 pt-2">
              <p className={T.label}>{COPY.transcript}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-6 text-slate-600 [overflow-wrap:anywhere]">
                {message.content}
              </p>
            </div>
          ) : null
        ) : (
          <p className="whitespace-pre-wrap text-[14.5px] leading-7 [overflow-wrap:anywhere]">{message.content}</p>
        )}
      </div>

      {meta && <p className={cn(T.meta, "mt-1 px-1")}>{meta}</p>}
    </div>
  );
};

export default memo(UserMessage);
