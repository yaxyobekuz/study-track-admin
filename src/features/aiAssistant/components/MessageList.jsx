// React
import { useImperativeHandle } from "react";

// Icons
import { ArrowDown } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import AssistantButton from "./AssistantButton";
import AssistantMessage from "./AssistantMessage";
import EmptyThread from "./EmptyThread";
import UserMessage from "./UserMessage";

// Hooks
import useStickToBottom from "../hooks/useStickToBottom";

// Lib
import { previousUserText } from "../lib/thread";

// Data
import { COPY } from "../data/aiAssistant.data";
import { THREAD_WIDTH } from "../data/assistant.tokens";

/**
 * SUHBAT OYNASI — xabarlar, bo'sh holat, yuklanish, "topilmadi".
 *
 * @param {object} props
 * @param {React.Ref} [props.ref] - `{ stickToBottom() }`
 * @param {string|null} props.conversationId
 * @param {object[]} props.messages - `buildThread` natijasi
 * @param {"loading"|"error"|"not_found"|"ready"} props.state
 * @param {(text: string) => void} props.onSend - taklif va "Qayta yuborish" uchun
 * @param {boolean} props.sendDisabled
 * @param {boolean} props.voiceOutput
 * @param {() => void} props.onNewConversation
 * @param {() => void} props.onReload
 */
const MessageList = ({
  ref,
  conversationId,
  messages,
  state,
  onSend,
  sendDisabled,
  voiceOutput,
  onNewConversation,
  onReload,
}) => {
  const isEmpty = state === "ready" && messages.length === 0;
  const hasThread = state === "ready" && !isEmpty;

  const { scrollRef, contentRef, onScroll, showJump, jumpToBottom, stickToBottom } = useStickToBottom(
    conversationId ?? "new",
    hasThread,
  );

  useImperativeHandle(ref, () => ({ stickToBottom }), [stickToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-label="Suhbat"
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div ref={contentRef} className={cn(!hasThread && "min-h-full", "flex flex-col")}>
          {state === "loading" ? (
            <ThreadSkeleton />
          ) : state === "not_found" || state === "error" ? (
            <ThreadProblem
              notFound={state === "not_found"}
              onNewConversation={onNewConversation}
              onReload={onReload}
            />
          ) : isEmpty ? (
            <EmptyThread onPick={onSend} disabled={sendDisabled} />
          ) : (
            <div className={cn(THREAD_WIDTH, "space-y-7 px-4 pb-8 pt-6 sm:px-6")}>
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <UserMessage key={message.renderKey ?? message.id} message={message} />
                ) : (
                  <AssistantMessage
                    key={message.renderKey ?? message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    retryText={previousUserText(messages, index)}
                    onRetry={onSend}
                    retryDisabled={sendDisabled}
                    voiceOutput={voiceOutput}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {showJump && hasThread && (
        <button
          type="button"
          onClick={jumpToBottom}
          className={cn(
            "absolute bottom-3 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3",
            "text-[12px] font-medium text-slate-700 ring-1 ring-slate-200 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.25)]",
            "outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary/40",
            "motion-safe:animate-wake-up",
          )}
        >
          <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
          {COPY.scrollToBottom}
        </button>
      )}
    </div>
  );
};

const ThreadSkeleton = () => (
  <div className={cn(THREAD_WIDTH, "space-y-8 px-4 pt-8 sm:px-6")} aria-hidden="true">
    <div className="ml-auto h-10 w-2/5 rounded-[14px] bg-slate-100 motion-safe:animate-breathe" />
    <div className="space-y-2.5">
      {[92, 84, 66].map((width, index) => (
        <div
          key={width}
          className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
          style={{ width: `${width}%`, animationDelay: `${index * 140}ms` }}
        />
      ))}
    </div>
  </div>
);

const ThreadProblem = ({ notFound, onNewConversation, onReload }) => (
  <div className={cn(THREAD_WIDTH, "flex flex-1 flex-col items-center justify-center px-6 py-16 text-center")}>
    <p className="text-[15px] font-semibold text-slate-900">{notFound ? COPY.notFoundTitle : COPY.loadError}</p>
    {notFound && <p className="mt-1 max-w-sm text-[13px] leading-5 text-slate-500">{COPY.notFoundHint}</p>}
    <div className="mt-4 flex items-center gap-2">
      {!notFound && (
        <AssistantButton tone="secondary" onClick={onReload}>
          {COPY.reload}
        </AssistantButton>
      )}
      <AssistantButton tone={notFound ? "primary" : "ghost"} onClick={onNewConversation}>
        {COPY.newConversation}
      </AssistantButton>
    </div>
  </div>
);

export default MessageList;
