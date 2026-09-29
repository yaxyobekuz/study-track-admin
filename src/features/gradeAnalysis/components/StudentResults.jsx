// Router
import { useSearchParams } from "react-router-dom";

// Icons
import { CalendarRange, GraduationCap, LayoutGrid, ListOrdered, NotebookPen, RefreshCw, Trophy } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import { HeroTile } from "./AnalysisHero";
import { ClassRankings, SchoolRankings } from "./RankingsPanel";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";

// Data
import { fmtAvg } from "../data/gradeAnalysis.data";
import { DELAY, MOTION, SURFACE, T } from "../data/analysis.tokens";

const DEFAULT_PERIOD = "month";

/** Server javobidan oldin ham davr tugmalari chizilsin (ro'yxat serverniki bilan AYNI). */
const FALLBACK_PERIODS = [
  { key: "week", label: "1 hafta" },
  { key: "month", label: "1 oy" },
  { key: "quarter", label: "3 oy" },
  { key: "half", label: "6 oy" },
  { key: "year", label: "1 yil" },
];

/**
 * O'QUVCHILAR NATIJALARI — maktab bo'yicha va har sinfda eng yuqori 3 va
 * eng past 3 natija.
 *
 * ⚠️ AI YO'Q VA TAHLILGA BOG'LIQ EMAS: raqamlar har so'rovda QO'YILGAN
 * BAHOLARDAN hisoblanadi (`GET /grade-analysis/results`). "AI tahlil"
 * tabidagi tahlilni ishga tushirish shart emas — bugun qo'yilgan baho
 * darhol shu yerda ko'rinadi.
 *
 * Davr URL'da (`?tab=results&period=month`) — havolani ochgan odam aynan
 * shu manzarani ko'radi.
 */
const StudentResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = searchParams.get("period") || DEFAULT_PERIOD;

  const query = useQuery(gradeAnalysisQueries.results({ period }));
  const data = query.data;
  const periods = data?.periods ?? FALLBACK_PERIODS;

  const setPeriod = (key) =>
    setSearchParams(
      (prev) => {
        if (key === DEFAULT_PERIOD) prev.delete("period");
        else prev.set("period", key);
        return prev;
      },
      { replace: true },
    );

  const hasGrades = (data?.summary?.gradeCount ?? 0) > 0;
  const showSchool = (data?.rankings?.classes?.length ?? 0) > 1;

  return (
    <div className="space-y-4">
      <ResultsHero
        data={data}
        periods={periods}
        period={period}
        onPeriod={setPeriod}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        onRefresh={() => query.refetch()}
      />

      {query.isError && (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Trophy}
            title="Natijalarni yuklab bo'lmadi"
            description={query.error?.response?.data?.message || "Birozdan keyin qayta urinib ko'ring."}
          />
        </Card>
      )}

      {data && !hasGrades && (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={NotebookPen}
            title="Bu davrda baho qo'yilmagan"
            description="Tanlangan davrda o'quvchilarga birorta ham baho qo'yilmagan. Uzunroq davrni tanlang."
          />
        </Card>
      )}

      {data && hasGrades && (
        <div className={cn("space-y-4 transition-opacity duration-200", query.isPlaceholderData && "opacity-60")}>
          {showSchool && <SchoolRankings rankings={data.rankings} delay={DELAY.row(0)} />}
          <ClassRankings rankings={data.rankings} delay={DELAY.row(showSchool ? 1 : 0)} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── Sarlavha ─────────────────────────── */

const ResultsHero = ({ data, periods, period, onPeriod, isLoading, isFetching, onRefresh }) => {
  const summary = data?.summary;

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-6 xs:px-7 xs:py-7")}
      style={{ animationDelay: `${DELAY.hero}ms` }}
    >
      <span aria-hidden className={SURFACE.heroLight} />
      <span aria-hidden className={SURFACE.heroGrid} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={T.labelDark}>O'quvchilar natijalari</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-white ring-1 ring-white/10">
              <Trophy className="size-5" strokeWidth={1.8} />
            </span>
            <h1 className={cn(T.pageTitle, "min-w-0")}>Eng yuqori va eng past natijalar</h1>
          </div>
          <p className={cn(T.metaDark, "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1")}>
            <CalendarRange className="size-3.5 text-white/40" />
            {data ? (
              <>
                <span className="font-semibold text-white/80">{data.period.title}</span>
                <span className="text-white/25">·</span>
                <span>{data.period.rangeLabel}</span>
                <span className="text-white/25">·</span>
                <span>Qo'yilgan baholardan</span>
                <span className="text-white/25">·</span>
                <span>{formatTimeUz(data.generatedAt)} holatiga</span>
              </>
            ) : (
              <span>{isLoading ? "Yuklanmoqda…" : "—"}</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label="Davr"
            className="hidden-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white/[0.07] p-1 ring-1 ring-white/15"
          >
            {periods.map((row) => {
              const active = row.key === period;
              return (
                <button
                  key={row.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onPeriod(row.key)}
                  className={cn(
                    "h-7 shrink-0 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                    active ? "bg-white text-slate-900" : "text-white/65 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  {row.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Yangilash"
            aria-label="Yangilash"
            className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.07] text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/[0.12] hover:text-white disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-[12.5px] leading-relaxed text-white/55">
        Har bir o'quvchining tanlangan davrdagi o'rtacha bahosi bo'yicha — AI'siz, tahlil kutilmaydi. Baholari juda kam
        o'quvchi reytingga kirmaydi: 3 ta "5" bilan 40 ta bahoda yuqori natija olgandan oldinga o'tib ketmasin.
      </p>

      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <HeroTile
            index={0}
            icon={NotebookPen}
            label="Maktab o'rtachasi"
            value={fmtAvg(summary.average)}
            hint={`${summary.gradeCount} ta baho`}
          />
          <HeroTile
            index={1}
            icon={GraduationCap}
            label="Baho olgan"
            value={summary.graded}
            hint={`${summary.students} ta o'quvchidan`}
          />
          <HeroTile
            index={2}
            icon={ListOrdered}
            label="Reytingda"
            value={summary.ranked}
            hint="baholari yetarli o'quvchi"
          />
          <HeroTile
            index={3}
            icon={LayoutGrid}
            label="Sinflar"
            value={summary.rankedClasses}
            hint={
              summary.withoutClass
                ? `${summary.classes} tadan · ${summary.withoutClass} o'quvchi sinfsiz`
                : `${summary.classes} ta sinfdan`
            }
          />
        </div>
      )}
    </section>
  );
};

export default StudentResults;
