// React
import { useState } from "react";

// Icons
import { ChevronLeft, ChevronRight, History } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import { RUN_STATUS, SCOPE_ICON, TRIGGER_LABEL, fmtAvg } from "../data/gradeAnalysis.data";
import { LEVEL, MOTION, T, levelKeyOfAverage } from "../data/analysis.tokens";

const PAGE_SIZE = 6;

/**
 * TAHLILLAR TARIXI — gorizontal tasma. Tanlangan tahlil sahifaning
 * qolgan qismini boshqaradi (`?run=` URL parametri).
 */
const RunHistory = ({ selectedId, onSelect }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(gradeAnalysisQueries.runs({ page, limit: PAGE_SIZE }));
  const rows = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  if (!isLoading && rows.length === 0 && page === 1) return null;

  return (
    <div className={cn("flex items-stretch gap-2", MOTION.enter)} style={{ animationDelay: "90ms" }}>
      <div className="hidden shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 ring-1 ring-slate-200/70 sm:flex">
        <History className="size-4 text-slate-400" />
        <span className={cn(T.section, "text-[9px]")}>Tarix</span>
      </div>

      <div className="hidden-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {isLoading &&
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[68px] w-56 shrink-0 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
          ))}

        {rows.map((run) => {
          const Icon = SCOPE_ICON[run.scope] ?? SCOPE_ICON.school;
          const active = run.id === selectedId;
          const status = RUN_STATUS[run.status];
          const average = run.summary?.average;
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => onSelect(run.id)}
              className={cn(
                "flex w-60 shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200",
                active
                  ? "bg-slate-900 text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.6)]"
                  : "bg-white ring-1 ring-slate-200/70 hover:ring-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[12.5px] font-semibold", active ? "text-white" : "text-slate-900")}>
                  {run.scopeLabel}
                </span>
                <span className={cn("block truncate text-[10.5px]", active ? "text-white/55" : "text-slate-500")}>
                  {run.periodLabel} · {formatDateUz(run.createdAt)}
                  {run.trigger === "weekly" ? ` · ${TRIGGER_LABEL.weekly}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-right">
                {run.status === "completed" && average != null ? (
                  <span
                    className="block text-[15px] font-semibold tabular-nums"
                    style={{ color: active ? "#fff" : LEVEL[levelKeyOfAverage(average)].hex }}
                  >
                    {fmtAvg(average)}
                  </span>
                ) : (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ring-1", status?.chip)}>
                    {run.status === "running" ? `${run.progress}%` : status?.label}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex shrink-0 flex-col gap-1">
          <PagerButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)} label="Yangiroq">
            <ChevronLeft className="size-4" />
          </PagerButton>
          <PagerButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} label="Eskiroq">
            <ChevronRight className="size-4" />
          </PagerButton>
        </div>
      )}
    </div>
  );
};

const PagerButton = ({ disabled, onClick, label, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex flex-1 items-center justify-center rounded-xl bg-white px-2 text-slate-500 ring-1 ring-slate-200/70 transition-colors hover:text-slate-900 disabled:opacity-40"
  >
    {children}
  </button>
);

export default RunHistory;
