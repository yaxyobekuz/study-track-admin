// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { COPY, SUGGESTIONS } from "../data/aiAssistant.data";
import { MOTION, THREAD_WIDTH } from "../data/assistant.tokens";

/**
 * YANGI SUHBAT — nima so'rash mumkinligi.
 *
 * ⚠️ TAKLIFLARDA IKONKA YO'Q. Har kartaga rasmcha qo'yish ekranni
 * "ilova do'koni" ga aylantirardi; sarlavha va bir qator izoh yetarli.
 * Bosilganda matn DARHOL yuboriladi — bu savollar allaqachon to'liq.
 */
const EmptyThread = ({ onPick, disabled }) => (
  <div className={cn(THREAD_WIDTH, "flex flex-1 flex-col justify-center px-4 py-10 sm:px-6", MOTION.enter)}>
    <div className="max-w-[560px]">
      <h2 className="text-[19px] font-semibold leading-snug tracking-[-0.02em] text-slate-900">{COPY.emptyTitle}</h2>
      <p className="mt-2 text-[13.5px] leading-6 text-slate-500">{COPY.emptyHint}</p>
    </div>

    {/* Ikki ustun OYNA kengligi bo'yicha: 470px oynada ikki ustun har kartani
        to'rt qatorli ustunchaga aylantirardi. */}
    <ul className="mt-7 grid grid-cols-1 gap-2.5 [@container_chat_(min-width:600px)]:grid-cols-2">
      {SUGGESTIONS.map((suggestion) => (
        <li key={suggestion.id}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(suggestion.prompt)}
            className={cn(
              "flex h-full w-full flex-col items-start rounded-[14px] bg-white px-4 py-3 text-left ring-1 ring-slate-200",
              "outline-none transition-[background-color,box-shadow] duration-150 hover:bg-slate-50 hover:ring-slate-300",
              "focus-visible:ring-2 focus-visible:ring-primary/40",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:ring-slate-200",
            )}
          >
            <span className="text-[13.5px] font-semibold leading-5 text-slate-900">{suggestion.title}</span>
            <span className="mt-0.5 text-[12px] leading-5 text-slate-500">{suggestion.description}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default EmptyThread;
