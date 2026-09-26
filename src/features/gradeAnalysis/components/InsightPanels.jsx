// React
import { useState } from "react";

// Icons
import { CheckCircle2, ChevronRight, Info, ListChecks, Sparkles, TriangleAlert, UserSearch } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { SPOTLIGHT_TABS, fmtAvg } from "../data/gradeAnalysis.data";
import { DELAY, LEVEL, MOTION, PRIORITY, SURFACE, T, levelOf, toneOf } from "../data/analysis.tokens";

// Components
import Panel from "./Panel";
import { DeltaChip } from "./OverviewPanels";

/* ─────────────────────────── Xulosa ─────────────────────────── */

const HIGHLIGHT_ICON = { positive: CheckCircle2, warning: TriangleAlert, info: Info };

/**
 * RAHBARIYAT XULOSASI — qisqa xulosa, kuzatuvlar va USTUVOR ISHLAR.
 * ⚠️ Manba ochiq aytiladi (AI / qoidalar): AI matnidagi har bir son
 * serverda faktlar bilan tekshirilgan, lekin o'quvchi buni bilishi kerak.
 */
export const NarrativePanel = ({ narrative, delay }) => {
  const isAi = narrative?.source === "ai";
  return (
    <Panel
      title="Xulosa va ustuvor ishlar"
      hint={isAi ? "AI yozgan — har bir raqam hisob-kitob bilan tekshirilgan" : "Qoidalar asosida tuzilgan"}
      icon={Sparkles}
      accent={isAi ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white" : "bg-slate-900 text-white"}
      delay={delay}
      isEmpty={!narrative}
      emptyText="Xulosa tahlil tugagach chiqadi"
    >
      {narrative && (
        <div className="space-y-5">
          <p className={cn(T.body, "text-[13.5px]")}>{narrative.summary}</p>

          {narrative.highlights?.length > 0 && (
            <ul className="space-y-2">
              {narrative.highlights.map((item, index) => {
                const Icon = HIGHLIGHT_ICON[item.tone] ?? Info;
                const tone = toneOf(item.tone === "info" ? "info" : item.tone);
                return (
                  <li
                    key={index}
                    className={cn("flex items-start gap-3 rounded-xl bg-white px-3.5 py-3 ring-1", tone.ring, MOTION.enter)}
                    style={{ animationDelay: `${DELAY.item(delay, index)}ms` }}
                  >
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", tone.icon)}>
                      <Icon className="size-3" />
                    </span>
                    <span className={T.body}>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {narrative.priorities?.length > 0 && (
            <div>
              <p className={cn(T.section, "mb-2 flex items-center gap-1.5")}>
                <ListChecks className="size-3.5" /> Ustuvor ishlar
              </p>
              <ol className="space-y-2">
                {narrative.priorities.map((item, index) => {
                  const priority = PRIORITY[item.priority] ?? PRIORITY.medium;
                  return (
                    <li
                      key={index}
                      className={cn(SURFACE.tile, "relative overflow-hidden py-3 pl-5 pr-3.5", MOTION.enter)}
                      style={{ animationDelay: `${DELAY.item(delay + 120, index)}ms` }}
                    >
                      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", priority.rail)} />
                      <p className={T.bodyStrong}>{item.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1", priority.chip)}>
                          {priority.label}
                        </span>
                        <span className={T.meta}>{item.owner}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};

/* ─────────────────────────── O'quvchilar diqqat markazida ─────────────────────────── */

const LIST_BY_TAB = {
  risk: (overview) => overview?.riskStudents ?? [],
  decliners: (overview) => overview?.decliners ?? [],
  improvers: (overview) => overview?.improvers ?? [],
  top: (overview) => overview?.topStudents ?? [],
};

const EMPTY_BY_TAB = {
  risk: "Xavf guruhida o'quvchi yo'q",
  decliners: "Sezilarli pasaygan o'quvchi yo'q",
  improvers: "Sezilarli o'sgan o'quvchi yo'q (yoki o'tgan davr bilan solishtirib bo'lmaydi)",
  top: "Ma'lumot yetarli emas",
};

export const StudentSpotlight = ({ overview, delay }) => {
  // Birinchi BO'SH BO'LMAGAN tab ochiladi: xavf guruhi bo'sh bo'lsa,
  // bo'sh ro'yxat bilan kutib olish o'rniga pasayganlar ko'rsatiladi.
  const [picked, setPicked] = useState(null);
  const tab =
    picked ?? SPOTLIGHT_TABS.find((item) => LIST_BY_TAB[item.value](overview).length > 0)?.value ?? "risk";
  const setTab = setPicked;
  const { openModal } = useModal();
  const rows = LIST_BY_TAB[tab](overview);

  return (
    <Panel
      title="O'quvchilar diqqat markazida"
      hint="Bosing — to'liq hisobot, sabablar va tavsiyalar"
      icon={UserSearch}
      accent="bg-rose-50 text-rose-600"
      delay={delay}
      isEmpty={!overview}
    >
      <div className="hidden-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
        {SPOTLIGHT_TABS.map((item) => {
          const Icon = item.icon;
          const count = LIST_BY_TAB[item.value](overview).length;
          const active = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors duration-200",
                active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200/70 hover:bg-slate-100",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
              <span className={cn("tabular-nums", active ? "text-white/60" : "text-slate-400")}>{count}</span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className={cn(T.meta, "flex min-h-28 items-center justify-center text-center")}>{EMPTY_BY_TAB[tab]}</p>
      ) : (
        <ul className="-mx-2 divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li key={row.reportId ?? row.studentId} className={MOTION.enter} style={{ animationDelay: `${DELAY.item(0, index)}ms` }}>
              <StudentRow
                row={row}
                showRisk={tab === "risk"}
                onOpen={() => openModal("gradeAnalysisReport", { reportId: row.reportId })}
              />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

export const Initials = ({ name, levelKey, className }) => (
  <span
    className={cn(
      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
      className,
    )}
    style={{ background: levelOf(levelKey).hex }}
  >
    {(name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()}
  </span>
);

const StudentRow = ({ row, showRisk, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-slate-50"
  >
    <Initials name={row.name} levelKey={row.level} />
    <div className="min-w-0 flex-1">
      <p className={cn(T.tdName, "truncate")}>{row.name}</p>
      <p className={cn(T.meta, "truncate")}>
        {row.className ?? "Sinfsiz"}
        {row.topFinding && (
          <>
            {" · "}
            <span className={toneOf(row.topFinding.tone).text}>
              {row.topFinding.label}
              {row.topFinding.subject ? ` — ${row.topFinding.subject}` : ""}
            </span>
          </>
        )}
      </p>
    </div>
    {showRisk && (
      <span
        title="Xavf balli (0–100)"
        className={cn(
          "rounded-md px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums ring-1",
          row.riskScore >= 70 ? toneOf("critical").soft : toneOf("warning").soft,
        )}
      >
        {row.riskScore}
      </span>
    )}
    <DeltaChip value={row.delta} />
    <span className={cn(T.tdNum, "w-10 text-right", LEVEL[row.level]?.text)}>{fmtAvg(row.average)}</span>
    <ChevronRight className="size-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
  </button>
);
