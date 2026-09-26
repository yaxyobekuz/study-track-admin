// Icons
import { AlertCircle, Inbox } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { MOTION, SURFACE, T } from "../data/analysis.tokens";

/**
 * Tahlil blokining yagona qobig'i — sarlavha, izoh, amal va uch holat.
 *
 * ⚠️ Hamma blok SHU qobiqda: har biri o'z sarlavhasi va bo'sh holatini
 * chizsa, sahifa yuklanishda uzuq-yuluq ko'rinardi va birinchi kichik
 * o'zgarishdayoq bloklar bir-biridan ajralib ketardi.
 *
 * `accent` — sarlavha ikonkasining foni (blok toifasi rangi).
 */
const Panel = ({
  title,
  hint,
  icon: Icon,
  accent = "bg-slate-900 text-white",
  action,
  delay = 0,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyText = "Ma'lumot yo'q",
  flush = false,
  className,
  bodyClassName,
  children,
}) => {
  const state = isLoading ? "loading" : isError ? "error" : isEmpty ? "empty" : "ready";

  return (
    <section
      className={cn(SURFACE.card, "flex h-full min-w-0 flex-col", MOTION.enter, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-[18px]">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-[9px]", accent)}>
              <Icon className="size-3.5" strokeWidth={2.2} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className={cn(T.title, "truncate")}>{title}</h2>
            {hint && <p className={cn(T.hint, "mt-0.5")}>{hint}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      <div className={cn("flex min-h-0 flex-1 flex-col", flush ? "mt-3.5" : "mt-3.5 px-5 pb-5", bodyClassName)}>
        {state === "loading" && (
          <div className="flex min-h-32 flex-1 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        )}
        {state === "error" && (
          <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 text-slate-400">
            <AlertCircle className="size-5" />
            <p className={T.meta}>Ma'lumotni yuklab bo'lmadi</p>
          </div>
        )}
        {state === "empty" && (
          <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 text-slate-400">
            <Inbox className="size-5" />
            <p className={cn(T.meta, "max-w-[36ch] text-center")}>{emptyText}</p>
          </div>
        )}
        {state === "ready" && children}
      </div>
    </section>
  );
};

export default Panel;
