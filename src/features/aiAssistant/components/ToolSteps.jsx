// React
import { useId, useState } from "react";

// Icons
import { Check, ChevronDown, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Spinner from "./Spinner";

// Lib
import { formatSeconds, summarizeSteps } from "../lib/thread";

/**
 * YORDAMCHI QAYSI MA'LUMOTLARNI O'QIDI — yig'iladigan ro'yxat.
 *
 * ⚠️ SUKUT BO'YICHA YOPIQ. Ega javobni o'qiydi, jarayonni emas; lekin
 * "bu raqam qayerdan olindi?" degan savol tug'ilganda manba bir bosishda
 * ko'rinishi kerak — javobning ishonchliligi shunga tayanadi.
 *
 * ⚠️ ISHLAYOTGAN QADAM YOPIQ HOLATDA HAM KO'RINADI (spinner + nomi):
 * uzun tahlil paytida ega "osilib qoldimi?" deb o'ylamasligi uchun.
 *
 * @param {{ steps: object[], live?: boolean }} props
 */
const ToolSteps = ({ steps, live = false }) => {
  const [open, setOpen] = useState(false);
  const listId = useId();

  if (!steps?.length) return null;

  const { text, failed, running } = summarizeSteps(steps);
  const showRunning = live && running;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={cn(
          "group -ml-1.5 inline-flex max-w-full items-center gap-2 rounded-[8px] px-1.5 py-1 text-left",
          "text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {showRunning ? (
          <>
            <Spinner className="text-slate-400" />
            <span className="truncate text-slate-700">{running.label}</span>
          </>
        ) : (
          <>
            <span className="truncate">{text}</span>
            {failed > 0 && <span className="shrink-0 text-rose-700">· {failed} tasi xato</span>}
          </>
        )}
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ol
          id={listId}
          className="mt-1.5 space-y-px border-l border-slate-200 pl-3 motion-safe:animate-wake-up"
        >
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2 py-1">
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-5 text-slate-700">{step.label}</p>
                {step.status === "error" && step.error && (
                  <p className="text-[12px] leading-5 text-rose-700">{step.error}</p>
                )}
              </div>
              {step.status !== "running" && step.durationMs > 0 && (
                <span className="shrink-0 text-[11px] leading-5 tabular-nums text-slate-500">
                  {formatSeconds(step.durationMs)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const StepIcon = ({ status }) => {
  if (status === "running") return <Spinner className="mt-[3px] size-3 text-slate-400" />;
  if (status === "error") {
    return (
      <X className="mt-[3px] size-3.5 shrink-0 text-rose-600" strokeWidth={2} aria-label="Xato" />
    );
  }
  return <Check className="mt-[3px] size-3.5 shrink-0 text-emerald-600" strokeWidth={2} aria-label="Bajarildi" />;
};

export default ToolSteps;
