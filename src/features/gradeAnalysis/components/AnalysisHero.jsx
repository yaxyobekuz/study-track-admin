// Icons
import { ArrowDown, ArrowUp, Bot, CalendarRange, Minus, Radio } from "lucide-react";

// Hooks
import { useCountUp } from "@/shared/hooks/useCountUp";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  METRIC_ICON,
  RUN_STATUS,
  SCOPE_ICON,
  TRIGGER_LABEL,
  deltaTone,
  fmtAvg,
  fmtDelta,
} from "../data/gradeAnalysis.data";
import { DELAY, LEVEL, LEVEL_ORDER, MOTION, SURFACE, T, levelKeyOfAverage } from "../data/analysis.tokens";

/**
 * HERO — tahlilning "sahnasi": kim (qamrov), qachon (davr), qanday
 * (o'rtacha, daraja, dinamika) va hozir nima bo'lyapti (progress).
 *
 * ⚠️ Raqamlar faqat serverdan (`overview`). Ishlanayotgan tahlilda yig'ma
 * hali yo'q — o'rniga jonli progress chiziladi, eski raqam emas: bir
 * tahlilning sarlavhasi ostida boshqasining raqami turib qolmasin.
 */
const AnalysisHero = ({ run, isLoading, actions }) => {
  const overview = run?.overview;
  const isActive = run && ["queued", "running"].includes(run.status);
  const ScopeIcon = SCOPE_ICON[run?.scope] ?? SCOPE_ICON.school;

  const average = useCountUp(overview?.average ?? null, { decimals: 2, duration: 1100 });
  const levelKey = levelKeyOfAverage(overview?.average);
  const status = RUN_STATUS[run?.status];

  return (
    <section
      className={cn(SURFACE.hero, MOTION.enter, "px-5 py-6 xs:px-7 xs:py-7")}
      style={{ animationDelay: `${DELAY.hero}ms` }}
    >
      <span aria-hidden className={SURFACE.heroLight} />
      <span aria-hidden className={SURFACE.heroGrid} />

      {/* ── Sarlavha va amallar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={T.labelDark}>Baholar tahlili</span>
            {status && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", status.chip)}>
                {status.label}
              </span>
            )}
            {run?.narrative?.source === "ai" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/25 to-cyan-500/25 px-2 py-0.5 text-[10px] font-semibold text-violet-100 ring-1 ring-white/15">
                <Bot className="size-3" />
                AI xulosa
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-white ring-1 ring-white/10">
              <ScopeIcon className="size-5" strokeWidth={1.8} />
            </span>
            <h1 className={cn(T.pageTitle, "min-w-0 truncate")} title={run?.scopeLabel}>
              {isLoading ? "Yuklanmoqda…" : run?.scopeLabel ?? "Baholar tahlili"}
            </h1>
          </div>

          {run && (
            <p className={cn(T.metaDark, "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1")}>
              <CalendarRange className="size-3.5 text-white/40" />
              <span className="font-semibold text-white/80">{run.periodTitle}</span>
              <span className="text-white/25">·</span>
              <span>{run.rangeLabel}</span>
              <span className="text-white/25">·</span>
              <span>{TRIGGER_LABEL[run.trigger] ?? run.trigger}</span>
              {run.finishedAt && (
                <>
                  <span className="text-white/25">·</span>
                  <span>{formatDateTimeUz(run.finishedAt)}</span>
                </>
              )}
            </p>
          )}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {/* ── Asosiy qism: o'rtacha yoki jonli progress ──────────────── */}
      {isActive ? (
        <LiveProgress run={run} />
      ) : overview ? (
        <>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className={T.labelDark}>Umumiy o'rtacha baho</p>
              <div className="mt-2.5 flex items-end gap-3">
                <span className={cn(T.valueHero, T.size4xl)}>{fmtAvg(average)}</span>
                <span className="mb-1.5 text-[15px] font-medium text-white/35">/ 5</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/10",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", LEVEL[levelKey].dot)} />
                  {LEVEL[levelKey].label}
                </span>
                <HeroDelta delta={overview.delta} previous={overview.previousAverage} />
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2.5 sm:w-auto sm:grid-cols-4">
              <HeroTile
                index={0}
                icon={METRIC_ICON.students}
                label="Tahlil qilindi"
                value={overview.students.analyzed}
                hint={
                  overview.students.insufficient
                    ? `${overview.students.insufficient} tasida baho yetarli emas`
                    : `${overview.gradeCount} ta baho`
                }
              />
              <HeroTile
                index={1}
                icon={METRIC_ICON.quality}
                label="Sifat (4 va 5)"
                value={overview.qualityRate == null ? "—" : `${overview.qualityRate}%`}
                hint="baholar ulushi"
              />
              <HeroTile
                index={2}
                icon={METRIC_ICON.risk}
                label="Xavf guruhi"
                value={overview.atRisk}
                hint="o'quvchi"
                tone={overview.atRisk > 0 ? "text-rose-300" : undefined}
              />
              <HeroTile
                index={3}
                icon={METRIC_ICON.trend}
                label="Dinamika"
                value={
                  <span className="flex items-baseline gap-2">
                    <span className="text-emerald-300">↑{overview.trend.improving}</span>
                    <span className="text-rose-300">↓{overview.trend.declining}</span>
                  </span>
                }
                hint="o'tgan davrga nisbatan"
              />
            </div>
          </div>

          <LevelSpectrum levels={overview.levels} total={overview.students.total} />
        </>
      ) : (
        run?.status === "failed" && (
          <p className="mt-6 rounded-xl bg-rose-500/10 px-4 py-3 text-[12.5px] text-rose-200 ring-1 ring-rose-400/20">
            Tahlil xato bilan to'xtadi: {run.error || "sabab noma'lum"}
          </p>
        )
      )}
    </section>
  );
};

const HeroDelta = ({ delta, previous }) => {
  if (delta == null) {
    return <span className={T.metaDark}>O'tgan davr bilan solishtirish uchun baho yetarli emas</span>;
  }
  const tone = deltaTone(delta);
  const Icon = tone === "positive" ? ArrowUp : tone === "critical" ? ArrowDown : Minus;
  const color = tone === "positive" ? "text-emerald-300" : tone === "critical" ? "text-rose-300" : "text-white/60";

  return (
    <span className={cn("inline-flex items-center gap-1 text-[11.5px] font-semibold", color)}>
      <Icon className="size-3.5" />
      {fmtDelta(delta)}
      <span className="font-medium text-white/45">o'tgan davr {fmtAvg(previous)}</span>
    </span>
  );
};

const HeroTile = ({ index, icon: Icon, label, value, hint, tone }) => (
  <div
    className={cn(SURFACE.heroTile, MOTION.enter, "min-w-[132px]")}
    style={{ animationDelay: `${DELAY.item(80, index)}ms` }}
  >
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-white/40" />
      <p className={T.labelDark}>{label}</p>
    </div>
    <p className={cn(T.valueHero, T.sizeXl, "mt-2", tone)}>{value}</p>
    <p className={cn(T.metaDark, "mt-1.5 truncate")}>{hint}</p>
  </div>
);

/**
 * DARAJALAR SPEKTRI — o'quvchilar darajalar bo'yicha bitta chiziqda.
 * Bo'lak kengligi — o'quvchilar ulushi; legenda soni bilan.
 */
const LevelSpectrum = ({ levels, total }) => {
  if (!total) return null;
  const segments = LEVEL_ORDER.map((key) => ({ key, count: levels?.[key] ?? 0 })).filter((row) => row.count > 0);

  return (
    <div className="mt-7">
      <div className="flex h-2.5 w-full gap-[3px] overflow-hidden rounded-full">
        {segments.map((row, index) => (
          <span
            key={row.key}
            title={`${LEVEL[row.key].label}: ${row.count}`}
            className={cn("h-full rounded-full", MOTION.growX)}
            style={{
              width: `${(row.count / total) * 100}%`,
              background: LEVEL[row.key].hex,
              animationDelay: `${DELAY.item(260, index)}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {LEVEL_ORDER.map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-[11px] text-white/55">
            <span className="size-2 rounded-full" style={{ background: LEVEL[key].hex }} />
            {LEVEL[key].label}
            <span className="font-semibold tabular-nums text-white/85">{levels?.[key] ?? 0}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/** Ishlanayotgan tahlil — jonli progress (server `processed/total`). */
const LiveProgress = ({ run }) => {
  const percent = run.progress ?? 0;
  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={cn(T.labelDark, "flex items-center gap-1.5")}>
            <Radio className={cn("size-3.5 text-emerald-300", MOTION.breathe)} />
            {run.status === "queued" ? "Navbatda" : "Tahlil qilinmoqda"}
          </p>
          <p className={cn(T.valueHero, T.size4xl, "mt-2.5")}>{percent}%</p>
        </div>
        <p className={cn(T.metaDark, "text-right")}>
          {run.processed} / {run.total || "…"} o'quvchi
          {run.useAi && run.aiCount > 0 && (
            <>
              <br />
              AI matni: {run.aiCount}
            </>
          )}
        </p>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 transition-[width] duration-700 ease-out-quint"
          style={{ width: `${Math.max(2, percent)}%` }}
        />
      </div>
      <p className={cn(T.metaDark, "mt-3")}>
        Sahifani yopsangiz ham tahlil fonda davom etadi. Tayyor bo'lgach natija shu yerda chiqadi.
      </p>
    </div>
  );
};

export default AnalysisHero;
